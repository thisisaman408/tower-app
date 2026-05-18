import { NextResponse } from "next/server";
import { DEMO_ALERTS, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(
    DEMO_ALERTS.map((a) => ({
      ...a,
      diff: DEMO_DIFFS.find((d) => d.id === a.diffId),
      competitor: DEMO_COMPETITORS.find((c) =>
        DEMO_DIFFS.find((d) => d.id === a.diffId)?.competitorId === c.id
      ),
    }))
  );
}
