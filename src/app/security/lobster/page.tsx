"use client";
import { PageShell } from "@/components/layout/PageShell";
import { DEMO_LOBSTER_EVENTS } from "@/lib/seed-data";
import { formatRelative, cn } from "@/lib/utils";
import { Shield, Download, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react";
import { FadeInUp, StaggerContainer } from "@/components/animations";

const ACTION_STYLES: Record<string, { color: string; bg: string; icon: typeof Shield }> = {
  QUARANTINE: { color: "text-[oklch(0.68_0.24_25)]", bg: "bg-[oklch(0.68_0.24_25/0.1)] border-[oklch(0.68_0.24_25/0.3)]", icon: AlertTriangle },
  HUMAN_REVIEW: { color: "text-[oklch(0.82_0.20_85)]", bg: "bg-[oklch(0.82_0.20_85/0.1)] border-[oklch(0.82_0.20_85/0.3)]", icon: Eye },
  ALLOW: { color: "text-[oklch(0.71_0.22_145)]", bg: "bg-[oklch(0.71_0.22_145/0.08)] border-[oklch(0.71_0.22_145/0.2)]", icon: CheckCircle },
  DENY: { color: "text-[oklch(0.68_0.24_25)]", bg: "bg-[oklch(0.68_0.24_25/0.12)] border-[oklch(0.68_0.24_25/0.3)]", icon: AlertTriangle },
  LOG: { color: "text-[oklch(0.45_0_0)]", bg: "bg-[oklch(0.45_0_0/0.08)] border-[oklch(0.45_0_0/0.2)]", icon: Clock },
};

export default function LobsterAuditPage() {
  const events = DEMO_LOBSTER_EVENTS;
  const quarantined = events.filter((e) => e.action === "QUARANTINE").length;
  const humanReview = events.filter((e) => e.action === "HUMAN_REVIEW").length;
  const allowed = events.filter((e) => e.action === "ALLOW" || e.action === "LOG").length;

  return (
    <PageShell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / SECURITY</div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={22} className="text-[oklch(0.72_0.16_240)]" />
            Lobster Trap Audit
          </h1>
          <p className="text-sm text-[oklch(0.50_0_0)] mt-1">
            Deep-packet inspection on every Gemini Vision call. Image prompt-injection defense.
          </p>
        </div>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(DEMO_LOBSTER_EVENTS, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tower-lobster-audit-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[oklch(0.28_0_0)] text-[oklch(0.65_0_0)] hover:bg-[oklch(0.17_0_0)] transition-colors"
        >
          <Download size={12} />
          Export JSON
        </button>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-4 gap-4 mb-8" staggerDelay={0.07}>
        {[
          { label: "Total Events", value: events.length, color: "text-[oklch(0.80_0_0)]" },
          { label: "Quarantined", value: quarantined, color: "text-[oklch(0.68_0.24_25)]" },
          { label: "Human Review", value: humanReview, color: "text-[oklch(0.82_0.20_85)]" },
          { label: "Passed", value: allowed, color: "text-[oklch(0.71_0.22_145)]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-5">
            <div className={cn("text-3xl font-bold font-mono mb-1", color)}>{value}</div>
            <div className="text-xs text-[oklch(0.40_0_0)] font-mono uppercase">{label}</div>
          </div>
        ))}
      </StaggerContainer>

      {/* Policy info */}
      <div className="rounded-xl border border-[oklch(0.72_0.16_240/0.2)] bg-[oklch(0.72_0.16_240/0.03)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-[oklch(0.72_0.16_240)]" />
          <span className="text-sm font-semibold text-[oklch(0.72_0.16_240)]">Active Policy</span>
          <span className="ml-auto text-xs font-mono text-[oklch(0.45_0_0)]">tower-vision-policy · v2026-05-13.r1</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { id: "image-injection-instruction-grammar", action: "QUARANTINE", desc: "OCR matches jailbreak/instruction grammar" },
            { id: "image-injection-base64-payload", action: "HUMAN_REVIEW", desc: "Long base64 strings in OCR output" },
            { id: "image-injection-known-exploit-url", action: "DENY", desc: "Known prompt-injection domain in image" },
            { id: "image-exif-suspect", action: "HUMAN_REVIEW", desc: "EXIF metadata contains URLs or instructions" },
            { id: "declared-vs-detected-mismatch", action: "QUARANTINE", desc: "Intent mismatch: visual extraction ≠ detected" },
            { id: "rate-limit-per-domain", action: "RATE_LIMIT", desc: "Per-domain rate limit: >12/min" },
          ].map((rule) => {
            const style = ACTION_STYLES[rule.action] ?? ACTION_STYLES.LOG;
            return (
              <div key={rule.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-[oklch(0.17_0_0)] border border-[oklch(0.22_0_0)]">
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5", style.color, style.bg)}>
                  {rule.action}
                </span>
                <div>
                  <div className="font-mono text-[oklch(0.55_0_0)] text-[10px]">{rule.id}</div>
                  <div className="text-[oklch(0.45_0_0)] text-[10px] mt-0.5">{rule.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event log */}
      <div className="rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
          <h2 className="text-sm font-semibold">Event Log · Past 24h</h2>
        </div>
        <div className="divide-y divide-[oklch(0.20_0_0)]">
          {events.map((ev) => {
            const style = ACTION_STYLES[ev.action] ?? ACTION_STYLES.LOG;
            const Icon = style.icon;
            return (
              <div key={ev.id} className="px-5 py-4 hover:bg-[oklch(0.15_0_0)] transition-colors bg-[oklch(0.13_0_0)]">
                <div className="flex items-start gap-3">
                  <Icon size={14} className={cn("mt-0.5 flex-shrink-0", style.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded border font-semibold",
                        style.color, style.bg
                      )}>
                        {ev.action}
                      </span>
                      <span className="text-xs font-mono text-[oklch(0.50_0_0)]">{ev.policyId}</span>
                      <span className="ml-auto text-[10px] font-mono text-[oklch(0.38_0_0)]">
                        {formatRelative(ev.occurredAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                      <div>
                        <span className="text-[oklch(0.38_0_0)]">request: </span>
                        <span className="text-[oklch(0.55_0_0)]">{ev.requestId}</span>
                      </div>
                      {ev.payloadRedacted && (
                        <div>
                          <span className="text-[oklch(0.38_0_0)]">domain: </span>
                          <span className="text-[oklch(0.55_0_0)]">{String(ev.payloadRedacted.domain ?? "")}</span>
                        </div>
                      )}
                      {ev.declaredIntent && (
                        <div>
                          <span className="text-[oklch(0.38_0_0)]">declared: </span>
                          <span className="text-[oklch(0.55_0_0)]">{ev.declaredIntent}</span>
                        </div>
                      )}
                      {ev.detectedIntent && (
                        <div>
                          <span className="text-[oklch(0.38_0_0)]">detected: </span>
                          <span className={ev.action === "QUARANTINE" ? "text-[oklch(0.68_0.24_25)]" : "text-[oklch(0.82_0.20_85)]"}>
                            {ev.detectedIntent}
                          </span>
                        </div>
                      )}
                    </div>

                    {ev.evidence && (
                      <div className="mt-2 p-2.5 rounded bg-[oklch(0.18_0_0)] border border-[oklch(0.22_0_0)]">
                        <div className="text-[10px] font-mono text-[oklch(0.40_0_0)] mb-1">Evidence:</div>
                        {ev.evidence.ocrMatch != null && (
                          <div className="text-[10px] font-mono text-[oklch(0.65_0_0)] break-all">
                            OCR: &quot;{String(ev.evidence.ocrMatch).slice(0, 80)}&quot;
                          </div>
                        )}
                        {ev.evidence.exifField != null && (
                          <div className="text-[10px] font-mono text-[oklch(0.65_0_0)]">
                            EXIF.{String(ev.evidence.exifField)}: {String(ev.evidence.value ?? "").slice(0, 60)}
                          </div>
                        )}
                      </div>
                    )}

                    {(ev.action === "QUARANTINE" || ev.action === "DENY") && (
                      <div className="mt-2 text-[10px] font-mono text-[oklch(0.45_0_0)]">
                        → action: fallback to HTML-only extraction path (degraded mode)
                      </div>
                    )}
                    {ev.action === "HUMAN_REVIEW" && (
                      <div className="flex items-center gap-2 mt-2">
                        <button className="text-[10px] px-2 py-0.5 rounded bg-[oklch(0.71_0.22_145/0.1)] text-[oklch(0.71_0.22_145)] border border-[oklch(0.71_0.22_145/0.2)] font-mono hover:bg-[oklch(0.71_0.22_145/0.15)] transition-colors">
                          approve ▸
                        </button>
                        <button className="text-[10px] px-2 py-0.5 rounded bg-[oklch(0.68_0.24_25/0.1)] text-[oklch(0.68_0.24_25)] border border-[oklch(0.68_0.24_25/0.2)] font-mono hover:bg-[oklch(0.68_0.24_25/0.15)] transition-colors">
                          deny ▸
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
