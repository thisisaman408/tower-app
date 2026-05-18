import { NextRequest, NextResponse } from "next/server";
import { writeBrief } from "@/lib/gemini";
import { DEMO_BRIEF, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const briefId = searchParams.get("id");
  const watchlistId = searchParams.get("watchlistId");

  if (briefId === "brief-001" || watchlistId === "wl-demo-001") {
    return NextResponse.json(DEMO_BRIEF);
  }

  return NextResponse.json({ error: "Brief not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { watchlistId?: string; weekStart?: string; weekEnd?: string };

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(DEMO_BRIEF);
  }

  try {
    const result = await writeBrief({
      watchlistName: "Modern GTM Stack",
      competitors: DEMO_COMPETITORS.map((c) => c.name),
      weekStart: body.weekStart ?? new Date(Date.now() - 7 * 86400000).toISOString(),
      weekEnd: body.weekEnd ?? new Date().toISOString(),
      diffs: DEMO_DIFFS.map((d) => ({
        id: d.id,
        summary: d.summary,
        impact: d.impact,
        kind: d.kind,
        competitorName: DEMO_COMPETITORS.find((c) => c.id === d.competitorId)?.name ?? "Unknown",
      })),
    });

    return NextResponse.json({
      ...result,
      id: `brief-${Date.now()}`,
      watchlistId: body.watchlistId ?? "wl-demo-001",
      weekStart: body.weekStart,
      weekEnd: body.weekEnd,
      generatedBy: "gemini-2.0-flash:v1",
      createdAt: new Date().toISOString(),
      markdown: [result.tldr, "", ...result.paragraphs].join("\n\n"),
      citations: result.citations ?? [],
    });
  } catch (err) {
    console.error("Brief generation failed:", err);
    return NextResponse.json(DEMO_BRIEF);
  }
}
