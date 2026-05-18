import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genai, GEMINI_FLASH } from "@/lib/gemini";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user?.id) return NextResponse.json({ nodes: [], links: [] });

  const userWatchlists = await db.select().from(watchlists).where(eq(watchlists.ownerId, session.user.id));
  if (!userWatchlists.length) return NextResponse.json({ nodes: [], links: [] });

  const allCompetitors: (typeof competitors.$inferSelect)[] = [];
  for (const wl of userWatchlists) {
    const wlComps = await db.select().from(competitors).where(eq(competitors.watchlistId, wl.id));
    allCompetitors.push(...wlComps);
  }

  const seen = new Set<string>();
  const unique = allCompetitors.filter((c) => { if (seen.has(c.domain)) return false; seen.add(c.domain); return true; });
  if (!unique.length) return NextResponse.json({ nodes: [], links: [] });

  // Ask Gemini for competitive intel on each company + edges between them
  const prompt = `You are a competitive intelligence analyst. For each company below, provide a brief competitive profile AND identify relationships between them.

Companies:
${unique.map((c, i) => `${i + 1}. ${c.name} (${c.domain}) [id: ${c.id}]`).join("\n")}

Return ONLY valid JSON (no markdown):
{
  "companies": [
    {
      "id": "<company id from above>",
      "pricing": "e.g. Free / $X/mo / Enterprise",
      "funding": "e.g. Bootstrapped / Series B $50M / Public",
      "customers": "e.g. B2B SaaS startups / Enterprise CTOs",
      "keyProduct": "one-line description of their core product",
      "threat": "low|medium|high",
      "description": "One sentence competitive summary"
    }
  ],
  "edges": [
    {
      "source": "<id>",
      "target": "<id>",
      "relationship": "COMPETES_WITH|PARTNERS_WITH",
      "reason": "One line explaining why e.g. Both target B2B sales teams with CRM tools"
    }
  ]
}

Only add edges where there is meaningful overlap. Be concise and accurate.`;

  let enrichedNodes: Array<{ id: string; label: string; kind: string; properties: Record<string, unknown> }> = unique.map((c) => ({
    id: c.id,
    label: c.name,
    kind: "Company",
    properties: { domain: c.domain, logoUrl: c.logoUrl ?? undefined },
  }));
  let links: Array<{ source: string; target: string; relationship: string; reason?: string }> = [];

  try {
    const result = await genai.models.generateContent({
      model: GEMINI_FLASH,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.1, maxOutputTokens: 3000 },
    });

    const raw = result.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        companies: Array<{ id: string; pricing: string; funding: string; customers: string; keyProduct: string; threat: string; description: string }>;
        edges: Array<{ source: string; target: string; relationship: string; reason: string }>;
      };

      const intelMap = new Map(parsed.companies?.map((c) => [c.id, c]) ?? []);
      enrichedNodes = unique.map((c) => {
        const intel = intelMap.get(c.id);
        return {
          id: c.id,
          label: c.name,
          kind: "Company",
          properties: {
            domain: c.domain,
            logoUrl: c.logoUrl ?? undefined,
            ...(intel ? {
              pricing: intel.pricing,
              funding: intel.funding,
              customers: intel.customers,
              keyProduct: intel.keyProduct,
              threat: intel.threat,
              description: intel.description,
            } : {}),
          },
        };
      });

      const nodeIds = new Set(enrichedNodes.map((n) => n.id));
      links = (parsed.edges ?? []).filter(
        (l) => nodeIds.has(l.source) && nodeIds.has(l.target) && l.source !== l.target
      );
    }
  } catch {
    // return nodes without edges/intel on failure
  }

  return NextResponse.json({ nodes: enrichedNodes, links });
}
