import { NextRequest, NextResponse } from "next/server";
import { DEMO_BRIEF, DEMO_WATCHLIST } from "@/lib/seed-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (token === DEMO_WATCHLIST.shareToken || token === "demo") {
    return NextResponse.json({
      brief: DEMO_BRIEF,
      watchlist: { name: DEMO_WATCHLIST.name },
      isPublic: true,
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
