"use client";
import { use } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DEMO_DIFFS, DEMO_COMPETITORS, DEMO_SIGNALS } from "@/lib/seed-data";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "motion/react";

export default function DiffPage({ params }: { params: Promise<{ id: string; diffId: string }> }) {
  const { diffId } = use(params);
  const diff = DEMO_DIFFS.find((d) => d.id === diffId) ?? DEMO_DIFFS[0];
  if (!diff) notFound();

  const competitor = DEMO_COMPETITORS.find((c) => c.id === diff.competitorId);
  const beforeSignal = diff.beforeSignalId ? DEMO_SIGNALS.find((s) => s.id === diff.beforeSignalId) : null;
  const afterSignal = diff.afterSignalId ? DEMO_SIGNALS.find((s) => s.id === diff.afterSignalId) : null;

  const impactColor =
    diff.impact >= 80 ? "oklch(0.68 0.24 25)" :
    diff.impact >= 60 ? "oklch(0.82 0.20 85)" :
    diff.impact >= 40 ? "oklch(0.72 0.16 240)" :
    "oklch(0.45 0 0)";

  const pricingBefore = beforeSignal?.type === "pricing_tier" ? beforeSignal.payload as { tierName?: string; pricePerMonth?: number; currency?: string; features?: string[] } : null;
  const pricingAfter = afterSignal?.type === "pricing_tier" ? afterSignal.payload as { tierName?: string; pricePerMonth?: number; currency?: string; features?: string[] } : null;

  const addedFeatures = pricingBefore && pricingAfter
    ? (pricingAfter.features ?? []).filter((f) => !(pricingBefore.features ?? []).includes(f))
    : [];
  const removedFeatures = pricingBefore && pricingAfter
    ? (pricingBefore.features ?? []).filter((f) => !(pricingAfter.features ?? []).includes(f))
    : [];

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/watchlists/wl-demo-001/timeline"
          className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors"
        >
          <ArrowLeft size={12} />
          Back to timeline
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[oklch(0.40_0_0)]">
          <span>{competitor?.name}</span>
          <span>·</span>
          <span>{formatDate(diff.weekStart)} → {formatDate(diff.weekEnd)}</span>
          <span className="font-bold ml-2" style={{ color: impactColor }}>impact {diff.impact}</span>
        </div>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-2">{competitor?.name} · Diff</h1>
        <p className="text-sm text-[oklch(0.65_0_0)]">{diff.summary}</p>
      </div>

      {/* Impact score bar */}
      <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-[oklch(0.40_0_0)] uppercase">Impact Score</span>
          <span className="text-2xl font-bold font-mono" style={{ color: impactColor }}>{diff.impact}</span>
        </div>
        <div className="w-full h-2 bg-[oklch(0.22_0_0)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: impactColor }}
            initial={{ width: 0 }}
            animate={{ width: `${diff.impact}%` }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-[oklch(0.45_0_0)]">
          <span className="capitalize">{diff.kind}</span>
          <span>·</span>
          <span>{formatRelative(diff.weekEnd)}</span>
          {diff.details && typeof diff.details === 'object' && 'pctChange' in diff.details && (
            <>
              <span>·</span>
              <span className="font-mono" style={{ color: impactColor }}>
                +{String(diff.details.pctChange)}% change
              </span>
            </>
          )}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-0 rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden mb-6">
        <div className="border-r border-[oklch(0.22_0_0)]">
          <div className="px-5 py-3 border-b border-[oklch(0.22_0_0)] bg-[oklch(0.17_0_0)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[oklch(0.55_0_0)] uppercase font-mono">Last Week</span>
            <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">{formatDate(diff.weekStart)}</span>
          </div>
          <div className="p-5 bg-[oklch(0.15_0_0)] min-h-48">
            {beforeSignal ? (
              <div className="space-y-3">
                {pricingBefore && (
                  <div className="p-4 rounded-lg border border-[oklch(0.22_0_0)] bg-[oklch(0.17_0_0)]">
                    <div className="text-sm font-bold mb-1">{pricingBefore.tierName}</div>
                    <div className="text-2xl font-bold font-mono text-[oklch(0.80_0_0)] mb-3">
                      ${pricingBefore.pricePerMonth?.toLocaleString()}
                      <span className="text-sm font-normal text-[oklch(0.45_0_0)]">/mo</span>
                    </div>
                    <div className="space-y-1">
                      {(pricingBefore.features ?? []).map((f) => (
                        <div key={f} className={cn(
                          "text-xs flex items-center gap-2",
                          removedFeatures.includes(f) ? "text-[oklch(0.68_0.24_25)] line-through" : "text-[oklch(0.65_0_0)]"
                        )}>
                          <span>—</span>{f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-[oklch(0.40_0_0)] font-mono">
                  &quot;{beforeSignal.rawQuote?.slice(0, 100)}&quot;
                </div>
              </div>
            ) : (
              <div className="text-xs text-[oklch(0.35_0_0)] italic mt-4">No previous signal — this is a new addition</div>
            )}
          </div>
        </div>
        <div>
          <div className="px-5 py-3 border-b border-[oklch(0.22_0_0)] bg-[oklch(0.17_0_0)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[oklch(0.71_0.22_145)] uppercase font-mono">This Week</span>
            <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">{formatDate(diff.weekEnd)}</span>
          </div>
          <div className="p-5 bg-[oklch(0.15_0_0)] min-h-48">
            {afterSignal ? (
              <div className="space-y-3">
                {pricingAfter && (
                  <div className="p-4 rounded-lg border border-[oklch(0.72_0.16_240/0.3)] bg-[oklch(0.72_0.16_240/0.04)]">
                    <div className="text-sm font-bold mb-1">{pricingAfter.tierName}</div>
                    <div className="text-2xl font-bold font-mono text-[oklch(0.82_0.20_85)] mb-3">
                      ${pricingAfter.pricePerMonth?.toLocaleString()}
                      <span className="text-sm font-normal text-[oklch(0.45_0_0)]">/mo</span>
                      {pricingBefore?.pricePerMonth && pricingAfter?.pricePerMonth && pricingAfter.pricePerMonth > pricingBefore.pricePerMonth && (
                        <span className="ml-2 text-sm text-[oklch(0.68_0.24_25)] font-mono">
                          +{Math.round(((pricingAfter.pricePerMonth - pricingBefore.pricePerMonth) / pricingBefore.pricePerMonth) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {(pricingAfter.features ?? []).map((f) => (
                        <div key={f} className={cn(
                          "text-xs flex items-center gap-2",
                          addedFeatures.includes(f)
                            ? "text-[oklch(0.71_0.22_145)] font-semibold"
                            : "text-[oklch(0.65_0_0)]"
                        )}>
                          <span>—</span>{f}
                          {addedFeatures.includes(f) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[oklch(0.71_0.22_145/0.15)] text-[oklch(0.71_0.22_145)] font-mono">NEW</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!pricingAfter && (
                  <div className="p-4 rounded-lg border border-[oklch(0.22_0_0)]">
                    <div className="text-xs font-mono mb-2 text-[oklch(0.55_0_0)] uppercase">{afterSignal.type}</div>
                    <p className="text-xs text-[oklch(0.65_0_0)]">{afterSignal.rawQuote}</p>
                  </div>
                )}
                <div className="text-xs text-[oklch(0.40_0_0)] font-mono">
                  &quot;{afterSignal.rawQuote?.slice(0, 100)}&quot;
                </div>
              </div>
            ) : (
              <div className="text-xs text-[oklch(0.35_0_0)] italic mt-4">Signal removed — not present this week</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary panel */}
      <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-5">
        <div className="text-xs font-mono text-[oklch(0.40_0_0)] uppercase mb-3">Analysis</div>
        <p className="text-sm text-[oklch(0.75_0_0)] leading-relaxed">{diff.summary}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[oklch(0.22_0_0)]">
          <Link
            href={`/briefs/brief-001`}
            className="flex items-center gap-1.5 text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors"
          >
            Read full brief <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
