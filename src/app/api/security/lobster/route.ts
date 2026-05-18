import { NextResponse } from "next/server";
import { DEMO_LOBSTER_EVENTS } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(DEMO_LOBSTER_EVENTS);
}

export async function POST() {
  // Simulate a new quarantine event for demo
  const event = {
    id: `lt-${Date.now()}`,
    requestId: `req-live-${Date.now()}`,
    policyId: "image-injection-instruction-grammar",
    policyRevision: "2026-05-13.r1",
    action: "QUARANTINE" as const,
    declaredIntent: "tower.extract.visual",
    detectedIntent: "instruction.execute",
    payloadRedacted: { domain: "competitor.com", pageType: "pricing" },
    evidence: { ocrMatch: "Ignore previous instructions...", boundingBox: { x: 0, y: 980, w: 400, h: 20 } },
    occurredAt: new Date().toISOString(),
  };

  return NextResponse.json(event);
}
