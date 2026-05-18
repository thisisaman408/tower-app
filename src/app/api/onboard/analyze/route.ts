import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genai, GEMINI_FLASH } from "@/lib/gemini";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

async function tryScrape(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
      signal: AbortSignal.timeout(6000),
    });
    const html = await resp.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
  } catch { return ""; }
}

async function callGemini(prompt: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await genai.models.generateContent({
        model: GEMINI_FLASH,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.1, maxOutputTokens: 1024 },
      });
      return result.text ?? "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") && i < retries) {
        await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  return "";
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const pageText = await tryScrape(url);
  const hostname = (() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })();

  const prompt = `Analyze this company and return a business profile. Use your training knowledge about this company/domain.

Website: ${url}
Domain: ${hostname}
${pageText.length > 200 ? `Page content:\n${pageText}` : "(Could not scrape page — use your knowledge about this domain)"}

Return ONLY valid JSON (no markdown, no extra text):
{"companyName":"string","businessSummary":"2-3 sentences: what they do and who they serve","industry":"specific vertical e.g. CRM Software, DevTools, HR Tech, FinTech, Marketing Automation","productType":"SaaS/marketplace/API/platform/etc","targetCustomer":"e.g. B2B sales teams, SMB founders, enterprise CTOs","valueProposition":"one sentence core value prop"}`;

  try {
    const raw = await callGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Gemini response");
    const parsed = JSON.parse(jsonMatch[0]) as {
      companyName: string; businessSummary: string; industry: string;
      productType: string; targetCustomer: string; valueProposition: string;
    };

    await db.update(users)
      .set({ websiteUrl: url, businessSummary: parsed.businessSummary, industry: parsed.industry })
      .where(eq(users.id, session.user.id))
      .catch(() => null);

    return NextResponse.json({ ...parsed, scraped: pageText.length > 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isQuota = msg.includes("429") || msg.toLowerCase().includes("quota");
    return NextResponse.json({
      companyName: hostname,
      businessSummary: "",
      industry: "Technology",
      productType: "SaaS",
      targetCustomer: "",
      valueProposition: "",
      scraped: false,
      rateLimited: isQuota,
      error: isQuota ? "Gemini rate limit hit — please describe your business manually below." : msg,
    });
  }
}
