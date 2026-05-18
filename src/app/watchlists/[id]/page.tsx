"use client";
import { use, useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { AddCompetitorModal } from "@/components/sections/AddCompetitorModal";
import { LiveScanPanel } from "@/components/sections/LiveScanPanel";
import { FadeInUp, StaggerContainer } from "@/components/animations";
import { Zap, Globe } from "lucide-react";
import { AnimatePresence } from "motion/react";

interface Competitor {
  id: string; name: string; domain: string; logoUrl?: string;
}
interface WatchlistData {
  id: string; name: string; description?: string | null;
  competitors: Competitor[];
}

export default function WatchlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<WatchlistData | null>(null);
  const [scanning, setScanning] = useState<Competitor | null>(null);

  useEffect(() => {
    fetch(`/api/watchlists/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d as WatchlistData))
      .catch(() => null);
  }, [id]);

  if (!data) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64 text-[oklch(0.40_0_0)] text-sm">
          Loading...
        </div>
      </PageShell>
    );
  }

  const competitors = data.competitors ?? [];

  return (
    <PageShell>
      <AnimatePresence>
        {scanning && (
          <LiveScanPanel
            competitor={scanning}
            onClose={() => setScanning(null)}
          />
        )}
      </AnimatePresence>

      <FadeInUp>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0_0)] font-mono mb-1">
              <span>WATCHLIST</span><span>/</span>
              <span className="text-[oklch(0.65_0_0)]">{data.name}</span>
            </div>
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-[oklch(0.45_0_0)]">
              <span>{competitors.length} competitor{competitors.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span className="text-[oklch(0.72_0.16_240)]">Click any competitor to scan</span>
            </div>
          </div>
          <AddCompetitorModal />
        </div>
      </FadeInUp>

      {competitors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[oklch(0.28_0_0)] p-12 text-center">
          <div className="text-[oklch(0.40_0_0)] mb-2">No competitors yet</div>
          <div className="text-xs text-[oklch(0.35_0_0)] mb-4">Use "+ Add Competitor" above, or re-run setup to auto-discover them</div>
          <button
            onClick={async () => {
              await fetch("/api/onboard/reset", { method: "POST" });
              window.location.href = "/onboarding";
            }}
            className="text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors underline"
          >
            Re-run competitor discovery →
          </button>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8" staggerDelay={0.05}>
          {competitors.map((comp) => (
            <FadeInUp key={comp.id}>
              <button
                onClick={() => setScanning(comp)}
                className="w-full text-left p-4 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] hover:border-[oklch(0.72_0.16_240/0.5)] hover:bg-[oklch(0.17_0_0)] transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={`https://logo.clearbit.com/${comp.domain}`}
                    alt={comp.name}
                    className="w-8 h-8 rounded-md"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = "none";
                      t.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="w-8 h-8 rounded-md bg-[oklch(0.20_0_0)] hidden items-center justify-center flex-shrink-0">
                    <Globe size={14} className="text-[oklch(0.45_0_0)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[oklch(0.85_0_0)] truncate">{comp.name}</div>
                    <div className="text-[10px] text-[oklch(0.40_0_0)] font-mono truncate">{comp.domain}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[oklch(0.40_0_0)] group-hover:text-[oklch(0.72_0.16_240)] transition-colors">
                  <Zap size={10} />
                  Scan with Gemini
                </div>
              </button>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}

      <FadeInUp delay={0.1}>
        <div className="rounded-xl border border-dashed border-[oklch(0.22_0_0)] p-8 text-center">
          <Zap size={20} className="mx-auto mb-2 text-[oklch(0.35_0_0)]" />
          <div className="text-sm text-[oklch(0.45_0_0)]">Click a competitor above to run a live Gemini scan</div>
          <div className="text-xs text-[oklch(0.30_0_0)] mt-1">Tower scrapes their pricing, blog, careers pages and extracts every signal</div>
        </div>
      </FadeInUp>
    </PageShell>
  );
}
