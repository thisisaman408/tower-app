import { NextRequest, NextResponse } from "next/server";
import { DEMO_SIGNALS, DEMO_COMPETITORS } from "@/lib/seed-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "wl-demo-001" || id === "demo") {
    return NextResponse.json(
      DEMO_SIGNALS.map((s) => ({
        ...s,
        competitor: DEMO_COMPETITORS.find((c) => c.id === s.competitorId),
      }))
    );
  }

  return NextResponse.json([]);
}
