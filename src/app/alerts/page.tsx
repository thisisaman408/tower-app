import { PageShell } from "@/components/layout/PageShell";
import { DEMO_ALERTS, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";
import { formatRelative, cn, formatImpact } from "@/lib/utils";
import Link from "next/link";
import { Bell, CheckCircle, XCircle, Clock, SkipForward, ExternalLink } from "lucide-react";

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
  deduped: "text-[oklch(0.35_0_0)]",
};

export default function AlertsPage() {
  const alerts = DEMO_ALERTS;
  const delivered = alerts.filter((a) => a.status === "delivered").length;
  const failed = alerts.filter((a) => a.status === "failed").length;

  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / ALERTS</div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={20} />
          Alert Center
        </h1>
        <p className="text-sm text-[oklch(0.50_0_0)] mt-1">
          High-signal events (impact ≥ 80) dispatched to Slack and email.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Fired", value: alerts.length, color: "text-[oklch(0.80_0_0)]" },
          { label: "Delivered", value: delivered, color: "text-[oklch(0.71_0.22_145)]" },
          { label: "Failed", value: failed, color: "text-[oklch(0.68_0.24_25)]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-5">
            <div className={cn("text-3xl font-bold font-mono mb-1", color)}>{value}</div>
            <div className="text-xs text-[oklch(0.40_0_0)] font-mono uppercase">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] flex items-center justify-between">
          <h2 className="text-sm font-semibold">All Alerts</h2>
          <span className="text-xs font-mono text-[oklch(0.40_0_0)]">threshold: impact ≥ 80</span>
        </div>
        <div className="divide-y divide-[oklch(0.20_0_0)]">
          {alerts.map((alert) => {
            const diff = DEMO_DIFFS.find((d) => d.id === alert.diffId);
            const competitor = DEMO_COMPETITORS.find((c) => diff?.competitorId === c.id);
            const Icon = STATUS_ICON[alert.status];
            const colorClass = STATUS_COLOR[alert.status];
            const impactInfo = formatImpact(diff?.impact ?? 0);
            const channels = alert.channel.split(",");
            return (
              <div
                key={alert.id}
                className={cn(
                  "px-5 py-4 hover:bg-[oklch(0.15_0_0)] transition-colors",
                  alert.status === "deduped" && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon size={15} className={cn("mt-0.5 flex-shrink-0", colorClass)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {(diff?.impact ?? 0) >= 80 && (
                        <span className="w-2 h-2 rounded-full bg-[oklch(0.68_0.24_25)] animate-pulse flex-shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-[oklch(0.85_0_0)]">{competitor?.name}</span>
                      <span className="text-sm text-[oklch(0.60_0_0)]">·</span>
                      <span className="text-sm text-[oklch(0.70_0_0)] truncate">
                        {diff?.summary?.slice(0, 60)}{(diff?.summary?.length ?? 0) > 60 ? "…" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">
                        {formatRelative(alert.createdAt)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {channels.map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[oklch(0.20_0_0)] text-[oklch(0.50_0_0)] uppercase"
                          >
                            {ch.split(":")[0]}
                          </span>
                        ))}
                      </div>
                      {diff?.impact && (
                        <span className={cn("text-[10px] font-mono font-semibold", impactInfo.color)}>
                          impact {diff.impact}
                        </span>
                      )}
                      <span className={cn("ml-auto text-[10px] font-mono uppercase font-semibold", colorClass)}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  {diff && (
                    <Link
                      href={`/watchlists/wl-demo-001/diffs/${diff.id}`}
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors"
                    >
                      <ExternalLink size={12} />
                      diff
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
