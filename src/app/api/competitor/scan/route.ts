import { NextRequest } from "next/server";
import { genai, GEMINI_FLASH } from "@/lib/gemini";

const PAGES = ["", "/pricing", "/blog", "/careers", "/changelog", "/features"];

async function fetchPage(domain: string, path: string): Promise<string> {
  const urls = [`https://${domain}${path}`, `https://www.${domain}${path}`];
  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
        signal: AbortSignal.timeout(6000),
      });
      if (!resp.ok) continue;
      const html = await resp.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 300) return `[${url}]\n${text.slice(0, 4000)}`;
    } catch { /* try next */ }
  }
  return "";
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { domain, name } = await req.json() as { domain: string; name: string };
  if (!domain) return new Response("domain required", { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: string, d: unknown) => controller.enqueue(encoder.encode(sse(e, d)));

      try {
        send("status", { message: `Scanning ${domain}...` });

        // Fetch multiple pages concurrently
        const pageTexts = await Promise.all(
          PAGES.slice(0, 4).map((p) => fetchPage(domain, p))
        );
        const combined = pageTexts.filter(Boolean).join("\n\n---\n\n");

        if (!combined) {
          send("status", { message: "Using Gemini knowledge base..." });
        } else {
          send("status", { message: `Scraped ${pageTexts.filter(Boolean).length} pages, extracting signals...` });
        }

        const prompt = `You are a competitive intelligence analyst. Extract structured signals from this competitor.

Company: ${name} (${domain})
${combined ? `Scraped content:\n${combined.slice(0, 12000)}` : `(Could not scrape — use your knowledge about ${domain})`}

Extract ALL competitive signals. Return ONLY valid JSON:
{
  "signals": [
    {
      "type": "pricing_tier|feature_change|hiring_role|headcount_metric|blog_post|product_launch|partnership|customer_win|funding_round|leadership_change",
      "title": "short title",
      "summary": "1-2 sentence description",
      "data": { "key fields relevant to the signal type" },
      "confidence": 0.0-1.0,
      "sourceUrl": "url where this was found or inferred",
      "impact": 0-100
    }
  ],
  "overview": "2-3 sentence competitive overview of this company"
}

Be thorough. Extract pricing tiers, recent launches, hiring patterns, key features. Aim for 5-15 signals.`;

        const result = await genai.models.generateContent({
          model: GEMINI_FLASH,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { temperature: 0.1, maxOutputTokens: 4096 },
        });

        const raw = result.text ?? "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const parsed = JSON.parse(jsonMatch[0]) as {
          signals: Array<{
            type: string; title: string; summary: string;
            data: Record<string, unknown>; confidence: number;
            sourceUrl?: string; impact: number;
          }>;
          overview: string;
        };

        send("overview", { overview: parsed.overview, domain });

        for (const signal of parsed.signals ?? []) {
          await new Promise((r) => setTimeout(r, 150));
          send("signal", signal);
        }

        send("done", { count: parsed.signals?.length ?? 0 });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const isQuota = msg.includes("429") || msg.toLowerCase().includes("quota");
        send("error", {
          message: isQuota
            ? "Gemini rate limit — get a new API key at aistudio.google.com/app/apikey"
            : `Scan failed: ${msg.slice(0, 100)}`
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
