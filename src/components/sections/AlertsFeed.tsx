"use client";
import type { Alert, Competitor, Diff } from "@/types";
import Link from "next/link";
import { formatRelative, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, SkipForward } from "lucide-react";

interface AlertsFeedProps {
  alerts: Alert[];
  competitors: Competitor[];
  diffs: Diff[];
}

const STATUS_ICON = {
  delivered: CheckCircle,
  failed: XCircle,
  pending: Clock,
  deduped: SkipForward,
};

const STATUS_COLOR = {
  delivered: "text-[oklch(0.71_0.22_145)]",
  failed: "text-[oklch(0.68_0.24_25)]",
  pending: "text-[oklch(0.82_0.20_85)]",
  deduped: "text-[oklch(0.40_0_0)]",
};

export function AlertsFeed({ alerts, competitors, diffs }: AlertsFeedProps) {
  return (
    <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[oklch(0.22_0_0)] flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Alerts</h2>
        <Link
          href="/alerts"
          className="text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] font-mono"
        >
          all alerts →
        </Link>
      </div>
      <div className="divide-y divide-[oklch(0.20_0_0)]">
        {alerts.map((alert) => {
          const diff = diffs.find((d) => d.id === alert.diffId);
          const competitor = competitors.find((c) => diff?.competitorId === c.id);
          const Icon = STATUS_ICON[alert.status];
          const colorClass = STATUS_COLOR[alert.status];
          const isHigh = (diff?.impact ?? 0) >= 80;
          return (
            <div
              key={alert.id}
              className={cn(
                "px-4 py-2.5 flex items-start gap-2.5 hover:bg-[oklch(0.17_0_0)] transition-colors",
                alert.status === "deduped" && "opacity-50"
              )}
            >
              <Icon size={13} className={cn("mt-0.5 flex-shrink-0", colorClass)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isHigh && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.24_25)] flex-shrink-0" />
                  )}
                  <span className="text-xs text-[oklch(0.75_0_0)] truncate">
                    {competitor?.name} · {diff?.summary?.slice(0, 45)}
                    {(diff?.summary?.length ?? 0) > 45 ? "…" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">
                    {formatRelative(alert.createdAt)}
                  </span>
                  <span className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase">
                    {alert.channel.split(":")[0]}
                  </span>
                  <span className={cn("text-[10px] font-mono uppercase ml-auto", colorClass)}>
                    {alert.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
