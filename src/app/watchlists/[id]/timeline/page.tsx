"use client";
import { useState, use } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DEMO_SIGNALS, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";
import { formatRelative, signalTypeColor, signalTypeLabel, cn, formatImpact } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Filter, ChevronDown } from "lucide-react";

const FILTER_OPTIONS = [
  { value: null, label: "All" },
  { value: "pricing_tier", label: "Pricing" },
  { value: "product_launch", label: "Product" },
  { value: "hiring_role", label: "Hiring" },
  { value: "blog_post", label: "Blog" },
  { value: "funding_round", label: "Funding" },
];

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = use(params);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const signals = DEMO_SIGNALS;
  const competitors = DEMO_COMPETITORS;
  const diffs = DEMO_DIFFS;

  const combined = [
    ...signals.map((s) => ({ ...s, _kind: "signal" as const, _date: new Date(s.capturedAt) })),
    ...diffs.map((d) => ({ ...d, _kind: "diff" as const, _date: new Date(d.weekEnd) })),
  ].sort((a, b) => b._date.getTime() - a._date.getTime());

  const filteredCombined = combined.filter((item) => {
    if (!activeFilter) return true;
    if (item._kind === "diff") return true; // always show diffs
    return (item as typeof signals[0] & { _kind: "signal"; _date: Date }).type === activeFilter;
  });

  const activeLabel = FILTER_OPTIONS.find((o) => o.value === activeFilter)?.label ?? "All";

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/watchlists/wl-demo-001" className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors">
              <ArrowLeft size={12} />
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Signal Timeline</h1>
          <p className="text-sm text-[oklch(0.50_0_0)]">May 6 → May 13, 2026</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[oklch(0.28_0_0)] text-[oklch(0.65_0_0)] hover:bg-[oklch(0.17_0_0)] transition-colors"
          >
            <Filter size={12} />
            {activeFilter ? `Type: ${activeLabel}` : "Filter by type"}
            <ChevronDown size={10} className={cn("transition-transform", showFilterMenu && "rotate-180")} />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[oklch(0.28_0_0)] bg-[oklch(0.15_0_0)] shadow-xl z-50 overflow-hidden">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => {
                    setActiveFilter(opt.value);
                    setShowFilterMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[oklch(0.20_0_0)]",
                    activeFilter === opt.value
                      ? "text-[oklch(0.72_0.16_240)] bg-[oklch(0.72_0.16_240/0.08)]"
                      : "text-[oklch(0.60_0_0)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap bar */}
      <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-5 mb-6">
        <div className="text-xs font-mono text-[oklch(0.40_0_0)] mb-4 uppercase">Activity Heatmap · Past 7 days</div>
        <div className="space-y-2">
          {competitors.map((c) => {
            const compDiffs = diffs.filter((d) => d.competitorId === c.id);
            const maxImpact = compDiffs.reduce((max, d) => Math.max(max, d.impact), 0);
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs text-[oklch(0.55_0_0)] w-24 flex-shrink-0 truncate">{c.name.toUpperCase()}</span>
                <div className="flex-1 h-5 bg-[oklch(0.20_0_0)] rounded overflow-hidden flex">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const daysAgo = 6 - dayIdx;
                    const targetDate = new Date(Date.now() - daysAgo * 86400000);
                    const dayStart = new Date(targetDate);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(targetDate);
                    dayEnd.setHours(23, 59, 59, 999);

                    const dayDiffs = compDiffs.filter((d) => {
                      const diffDate = new Date(d.weekEnd);
                      return diffDate >= dayStart && diffDate <= dayEnd;
                    });

                    const intensity = dayDiffs.length > 0
                      ? Math.min(1, dayDiffs.reduce((sum, d) => sum + d.impact, 0) / 100)
                      : 0;

                    const bgColor = intensity > 0.6
                      ? `oklch(0.68 0.24 25 / ${intensity})`
                      : intensity > 0.3
                      ? `oklch(0.82 0.20 85 / ${intensity + 0.2})`
                      : intensity > 0
                      ? `oklch(0.72 0.16 240 / ${intensity + 0.3})`
                      : "oklch(0.20 0 0)";

                    return (
                      <div
                        key={dayIdx}
                        className="flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: bgColor }}
                        title={`${dayDiffs.length} diffs · max impact ${dayDiffs.reduce((m, d) => Math.max(m, d.impact), 0)}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-mono text-[oklch(0.40_0_0)] w-8 text-right">{maxImpact}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-[oklch(0.35_0_0)]">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="space-y-3">
        {filteredCombined.map((item) => {
          if (item._kind === "diff") {
            const diff = item as typeof diffs[0] & { _kind: "diff"; _date: Date };
            const competitor = competitors.find((c) => c.id === diff.competitorId);
            const impactInfo = formatImpact(diff.impact);
            return (
              <Link
                key={`diff-${diff.id}`}
                href={`/watchlists/wl-demo-001/diffs/${diff.id}`}
                className={cn(
                  "block p-4 rounded-xl border transition-all hover:scale-[1.002]",
                  diff.impact >= 80
                    ? "border-[oklch(0.68_0.24_25/0.3)] bg-[oklch(0.68_0.24_25/0.05)]"
                    : diff.impact >= 60
                    ? "border-[oklch(0.82_0.20_85/0.3)] bg-[oklch(0.82_0.20_85/0.05)]"
                    : "border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn("text-xs font-mono px-2 py-0.5 rounded font-semibold", impactInfo.color, "bg-current/10")}>
                        DIFF · impact {diff.impact}
                      </span>
                      <span className="text-xs font-semibold text-[oklch(0.75_0_0)]">{competitor?.name}</span>
                      <span className="text-[10px] font-mono text-[oklch(0.38_0_0)] ml-auto">{formatRelative(diff.weekEnd)}</span>
                    </div>
                    <p className="text-sm text-[oklch(0.80_0_0)]">{diff.summary}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[oklch(0.40_0_0)] capitalize flex-shrink-0 border border-[oklch(0.25_0_0)] px-2 py-0.5 rounded">
                    {diff.kind}
                  </span>
                </div>
              </Link>
            );
          }

          const signal = item as typeof signals[0] & { _kind: "signal"; _date: Date };
          const competitor = competitors.find((c) => c.id === signal.competitorId);
          const typeColor = signalTypeColor(signal.type);
          return (
            <div key={`sig-${signal.id}`} className="p-4 rounded-xl border border-[oklch(0.20_0_0)] bg-[oklch(0.15_0_0)] hover:border-[oklch(0.26_0_0)] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: typeColor }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: typeColor, background: `${typeColor}15` }}>
                      {signalTypeLabel(signal.type)}
                    </span>
                    <span className="text-xs font-semibold text-[oklch(0.65_0_0)]">{competitor?.name}</span>
                    <span className="text-[10px] font-mono text-[oklch(0.38_0_0)] ml-auto">{formatRelative(signal.capturedAt)}</span>
                  </div>
                  <p className="text-xs text-[oklch(0.60_0_0)] leading-relaxed">{signal.rawQuote}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">conf {(signal.confidence * 100).toFixed(0)}%</span>
                    {signal.boundingBox && (
                      <span className="text-[10px] font-mono text-[oklch(0.35_0_0)]">
                        bbox ({signal.boundingBox.x},{signal.boundingBox.y},{signal.boundingBox.w}×{signal.boundingBox.h})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
