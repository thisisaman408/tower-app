"use client";
import { formatRelative, signalTypeLabel, signalTypeColor, cn } from "@/lib/utils";
import type { Signal, Competitor } from "@/types";
import Link from "next/link";
import { motion } from "motion/react";

interface SignalTimelineProps {
  signals: Signal[];
  competitors: Competitor[];
}

export function SignalTimeline({ signals, competitors }: SignalTimelineProps) {
  const sorted = [...signals].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );

  return (
    <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[oklch(0.22_0_0)] flex items-center justify-between">
        <h2 className="text-sm font-semibold">Signal Timeline</h2>
        <Link
          href="/watchlists/wl-demo-001/timeline"
          className="text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors font-mono"
        >
          view all →
        </Link>
      </div>
      <div className="divide-y divide-[oklch(0.20_0_0)]">
        {sorted.slice(0, 6).map((signal, idx) => {
          const competitor = competitors.find((c) => c.id === signal.competitorId);
          const typeColor = signalTypeColor(signal.type);
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="px-5 py-3.5 hover:bg-[oklch(0.17_0_0)] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: typeColor, marginTop: "6px" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: typeColor, background: `${typeColor}15` }}
                    >
                      {signalTypeLabel(signal.type)}
                    </span>
                    {competitor && (
                      <span className="text-xs font-semibold text-[oklch(0.70_0_0)]">
                        {competitor.name}
                      </span>
                    )}
                    <span className="text-[10px] text-[oklch(0.38_0_0)] ml-auto font-mono">
                      {formatRelative(signal.capturedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[oklch(0.60_0_0)] leading-relaxed truncate">
                    {signal.rawQuote}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative group/tooltip inline-flex items-center gap-1">
                      <span className="text-[10px] font-mono text-[oklch(0.38_0_0)] cursor-help underline decoration-dotted">
                        conf {(signal.confidence * 100).toFixed(0)}%
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 rounded-lg border border-[oklch(0.28_0_0)] bg-[oklch(0.13_0_0)] shadow-xl z-50 hidden group-hover/tooltip:block pointer-events-none">
                        <div className="text-[10px] font-mono text-[oklch(0.40_0_0)] mb-1.5">Source evidence</div>
                        <p className="text-xs text-[oklch(0.70_0_0)] italic mb-2 leading-relaxed">
                          &quot;{signal.rawQuote?.slice(0, 120)}&quot;
                        </p>
                        {signal.boundingBox && (
                          <div className="text-[10px] font-mono text-[oklch(0.38_0_0)]">
                            bbox: ({signal.boundingBox.x}, {signal.boundingBox.y}) {signal.boundingBox.w}×{signal.boundingBox.h}px
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
