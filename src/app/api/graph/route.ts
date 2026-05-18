import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genai, GEMINI_FLASH } from "@/lib/gemini";

interface GraphNode {
  id: string;
  label: string;
  kind: string;
  properties: Record<string, unknown>;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ nodes: [], links: [] });
  }

  // Fetch user's watchlists
  const userWatchlists = await db
    .select()
    .from(watchlists)
    .where(eq(watchlists.ownerId, session.user.id));

  if (userWatchlists.length === 0) {
    return NextResponse.json({ nodes: [], links: [] });
  }

  // Fetch competitors for all watchlists
  const allCompetitors: (typeof competitors.$inferSelect)[] = [];
  for (const wl of userWatchlists) {
    const wlCompetitors = await db
      .select()
      .from(competitors)
      .where(eq(competitors.watchlistId, wl.id));
    allCompetitors.push(...wlCompetitors);
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  const uniqueCompetitors = allCompetitors.filter((c) => {
    if (seen.has(c.domain)) return false;
    seen.add(c.domain);
    return true;
  });

  if (uniqueCompetitors.length === 0) {
    return NextResponse.json({ nodes: [], links: [] });
  }

  // Build nodes
  const nodes: GraphNode[] = uniqueCompetitors.map((c) => ({
    id: c.id,
    label: c.name,
    kind: "Company",
    properties: {
      domain: c.domain,
      logoUrl: c.logoUrl ?? undefined,
      watchlistId: c.watchlistId,
    },
  }));

  // Use Gemini to generate edges between competitors
  let links: GraphLink[] = [];
  try {
    const competitorList = uniqueCompetitors
      .map((c) => `${c.id}: ${c.name} (${c.domain})`)
      .join("\n");

    const prompt = `Given these competitor companies, determine which pairs share significant industry or product overlap and should be connected in a knowledge graph.

Companies:
${competitorList}

Return a JSON array of edges. Each edge: { "source": "<id>", "target": "<id>", "relationship": "<one of: COMPETES_WITH | PARTNERS_WITH>" }
Only return edges where you have high confidence. Limit to at most ${uniqueCompetitors.length * 2} edges.
Output ONLY valid JSON array, no markdown.`;

    const response = await genai.models.generateContent({
      model: GEMINI_FLASH,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "[]";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const rawLinks = JSON.parse(cleaned) as Array<{ source: string; target: string; relationship: string }>;

    // Validate: only include links referencing valid node ids
    const nodeIds = new Set(nodes.map((n) => n.id));
    links = rawLinks.filter(
      (l) => nodeIds.has(l.source) && nodeIds.has(l.target) && l.source !== l.target
    );
  } catch {
    // Gemini failed — return nodes without edges
    links = [];
  }

  return NextResponse.json({ nodes, links });
}
