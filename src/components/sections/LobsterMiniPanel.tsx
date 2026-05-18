"use client";
import type { LobsterTrapEvent } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface LobsterMiniPanelProps {
  events: LobsterTrapEvent[];
}

const ACTION_COLOR: Record<string, string> = {
  QUARANTINE: "text-[oklch(0.68_0.24_25)] bg-[oklch(0.68_0.24_25/0.1)]",
  HUMAN_REVIEW: "text-[oklch(0.82_0.20_85)] bg-[oklch(0.82_0.20_85/0.1)]",
  ALLOW: "text-[oklch(0.71_0.22_145)] bg-[oklch(0.71_0.22_145/0.1)]",
  DENY: "text-[oklch(0.68_0.24_25)] bg-[oklch(0.68_0.24_25/0.15)]",
  LOG: "text-[oklch(0.45_0_0)] bg-[oklch(0.45_0_0/0.1)]",
  RATE_LIMIT: "text-[oklch(0.82_0.20_85)] bg-[oklch(0.82_0.20_85/0.1)]",
};

export function LobsterMiniPanel({ events }: LobsterMiniPanelProps) {
  const quarantined = events.filter((e) => e.action === "QUARANTINE").length;
  const humanReview = events.filter((e) => e.action === "HUMAN_REVIEW").length;

  return (
    <div className="rounded-xl border border-[oklch(0.72_0.16_240/0.2)] bg-[oklch(0.72_0.16_240/0.03)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[oklch(0.72_0.16_240/0.15)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[oklch(0.72_0.16_240)]" />
          <h2 className="text-sm font-semibold text-[oklch(0.72_0.16_240)]">Lobster Trap</h2>
        </div>
        <Link
          href="/security/lobster"
          className="text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] font-mono"
        >
          audit →
        </Link>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xl font-bold font-mono text-[oklch(0.80_0_0)]">{events.length}</div>
            <div className="text-[10px] text-[oklch(0.40_0_0)] uppercase font-mono">events</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold font-mono text-[oklch(0.68_0.24_25)]">{quarantined}</div>
            <div className="text-[10px] text-[oklch(0.40_0_0)] uppercase font-mono">blocked</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold font-mono text-[oklch(0.82_0.20_85)]">{humanReview}</div>
            <div className="text-[10px] text-[oklch(0.40_0_0)] uppercase font-mono">review</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {events.slice(0, 3).map((ev) => (
            <div key={ev.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0",
                  ACTION_COLOR[ev.action] ?? "text-[oklch(0.45_0_0)]"
                )}
              >
                {ev.action}
              </span>
              <span className="text-[10px] text-[oklch(0.45_0_0)] truncate">
                {ev.policyId.replace("image-injection-", "").replace("-grammar", "")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
