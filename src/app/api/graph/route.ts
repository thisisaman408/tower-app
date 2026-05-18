import { NextRequest, NextResponse } from "next/server";
import { getDemoKGGraph } from "@/lib/seed-data";

export async function GET(_req: NextRequest) {
  return NextResponse.json(getDemoKGGraph());
}
