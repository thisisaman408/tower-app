import { NextRequest, NextResponse } from "next/server";
import { DEMO_WATCHLIST, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json([{
    ...DEMO_WATCHLIST,
    competitors: DEMO_COMPETITORS.map((c) => ({
      ...c,
      topImpact: DEMO_DIFFS
        .filter((d) => d.competitorId === c.id)
        .reduce((max, d) => Math.max(max, d.impact), 0),
    })),
  }]);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; description?: string };
  return NextResponse.json({
    id: `wl-${Date.now()}`,
    name: body.name,
    description: body.description,
    alertChannels: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
