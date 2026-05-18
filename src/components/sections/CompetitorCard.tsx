"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Competitor, Diff } from "@/types";
import { motion } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

interface CompetitorCardProps {
  competitor: Competitor;
  topDiff?: Diff;
  diffCount: number;
}

function ImpactBar({ impact }: { impact: number }) {
  const color =
    impact >= 80 ? "oklch(0.68 0.24 25)" :
    impact >= 60 ? "oklch(0.82 0.20 85)" :
    impact >= 40 ? "oklch(0.72 0.16 240)" : "oklch(0.40 0 0)";
  return (
    <div className="w-full h-1 bg-[oklch(0.22_0_0)] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${impact}%` }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.15 }}
      />
    </div>
  );
}

function SignalBadge({ kind }: { kind: string }) {
  const colors: Record<string, string> = {
    pricing: "text-[oklch(0.82_0.20_85)]",
    careers: "text-[oklch(0.71_0.22_145)]",
    product: "text-[oklch(0.72_0.16_240)]",
    blog: "text-[oklch(0.55_0_0)]",
    social: "text-[oklch(0.55_0_0)]",
  };
  return (
    <span className={cn("text-[10px] font-mono uppercase", colors[kind] ?? "text-[oklch(0.45_0_0)]")}>
      {kind}↑
    </span>
  );
}

export function CompetitorCard({ competitor, topDiff, diffCount }: CompetitorCardProps) {
  const impact = topDiff?.impact ?? 0;
  const impactColor =
    impact >= 80
      ? "oklch(0.68 0.24 25)"
      : impact >= 60
      ? "oklch(0.82 0.20 85)"
      : impact >= 40
      ? "oklch(0.72 0.16 240)"
      : "oklch(0.45 0 0)";

  const pageTypeHint = topDiff?.summary?.toLowerCase().includes("pric")
    ? "pricing"
    : topDiff?.summary?.toLowerCase().includes("agent") ||
      topDiff?.summary?.toLowerCase().includes("product")
    ? "product"
    : topDiff?.summary?.toLowerCase().includes("role") ||
      topDiff?.summary?.toLowerCase().includes("hiring")
    ? "careers"
    : topDiff?.summary?.toLowerCase().includes("blog")
    ? "blog"
    : topDiff?.summary?.toLowerCase().includes("social")
    ? "social"
    : "signal";

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/watchlists/wl-demo-001/timeline?competitor=${competitor.id}`}
        className={cn(
          "block p-4 rounded-xl border transition-all duration-200 group cursor-pointer",
          impact >= 80
            ? "border-[oklch(0.68_0.24_25/0.3)] bg-[oklch(0.68_0.24_25/0.05)] hover:bg-[oklch(0.68_0.24_25/0.08)]"
            : impact >= 60
            ? "border-[oklch(0.82_0.20_85/0.3)] bg-[oklch(0.82_0.20_85/0.05)] hover:bg-[oklch(0.82_0.20_85/0.08)]"
            : "border-[oklch(0.22_0_0)] bg-[oklch(0.17_0_0)] hover:border-[oklch(0.28_0_0)]"
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          {competitor.logoUrl ? (
            <div className="w-7 h-7 rounded-md overflow-hidden bg-white flex-shrink-0">
              <img
                src={competitor.logoUrl}
                alt={competitor.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md bg-[oklch(0.22_0_0)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[oklch(0.65_0_0)]">{competitor.name[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{competitor.name.toUpperCase()}</div>
          </div>
        </div>

        <ImpactBar impact={impact} />

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {impact >= 80 && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: impactColor }}
              />
            )}
            <span className="text-sm font-bold font-mono" style={{ color: impactColor }}>
              {impact}
            </span>
          </div>
          {topDiff && <SignalBadge kind={pageTypeHint} />}
        </div>

        {diffCount > 0 && (
          <div className="mt-1.5 text-[10px] text-[oklch(0.40_0_0)]">
            {diffCount} signal{diffCount !== 1 ? "s" : ""} this week
          </div>
        )}
      </Link>
    </motion.div>
  );
}
