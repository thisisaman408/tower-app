import { PageShell } from "@/components/layout/PageShell";
import { LiveExtractionDemo } from "@/components/sections/LiveExtractionDemo";

export const metadata = {
  title: "Live Extraction — Tower",
  description: "Drop a competitor screenshot. Watch Gemini Vision extract structured intelligence in real time.",
};

export default function DemoExtractPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / LIVE EXTRACTION</div>
        <h1 className="text-2xl font-bold mb-1">Gemini Vision · Live Extraction</h1>
        <p className="text-sm text-[oklch(0.55_0_0)]">
          Drop a competitor screenshot. Watch Gemini 2.0 Flash extract structured signals in real time, secured by Lobster Trap.
        </p>
      </div>
      <LiveExtractionDemo />
    </PageShell>
  );
}
