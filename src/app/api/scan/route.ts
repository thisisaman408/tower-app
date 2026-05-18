import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json() as { competitorId?: string; pageType?: string };

  // Simulate scan result
  const scanId = `scan-${Date.now()}`;

  return NextResponse.json({
    scanId,
    status: "queued",
    competitorId: body.competitorId,
    pageType: body.pageType,
    estimatedDuration: 8000,
    message: "Scan queued successfully",
  });
}
