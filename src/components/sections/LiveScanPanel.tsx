"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, X, Shield, TrendingUp, Users, DollarSign, Megaphone, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Signal {
  type: string; title: string; summary: string;
  data: Record<string, unknown>; confidence: number;
  sourceUrl?: string; impact: number;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  pricing_tier: DollarSign,
  feature_change: Zap,
  hiring_role: Users,
  headcount_metric: Users,
  blog_post: Megaphone,
  product_launch: Star,
  partnership: TrendingUp,
  customer_win: Star,
  funding_round: DollarSign,
  leadership_change: Users,
};

const TYPE_COLOR: Record<string, string> = {
  pricing_tier: "oklch(0.82 0.20 85)",
  feature_change: "oklch(0.72 0.16 240)",
  hiring_role: "oklch(0.71 0.22 145)",
  headcount_metric: "oklch(0.71 0.22 145)",
  blog_post: "oklch(0.72 0.16 240)",
  product_launch: "oklch(0.80 0.18 300)",
  partnership: "oklch(0.72 0.16 240)",
  customer_win: "oklch(0.82 0.20 85)",
  funding_round: "oklch(0.82 0.20 85)",
  leadership_change: "oklch(0.68 0.24 25)",
};

export function LiveScanPanel({
  competitor,
  onClose,
}: {
  competitor: { id: string; name: string; domain: string };
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [status, setStatus] = useState("");
  const [overview, setOverview] = useState("");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [error, setError] = useState("");

  const startScan = useCallback(async () => {
    setPhase("scanning");
    setSignals([]);
    setOverview("");
    setError("");
    setStatus(`Connecting to ${competitor.domain}...`);

    try {
      const res = await fetch("/api/competitor/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: competitor.domain, name: competitor.name }),
      });
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          let evtName = "";
          let dataStr = "";
          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) evtName = line.slice(7);
            if (line.startsWith("data: ")) dataStr = line.slice(6);
          }
          if (!dataStr) continue;
          try {
            const d = JSON.parse(dataStr) as Record<string, unknown>;
            if (evtName === "status") setStatus(d.message as string);
            else if (evtName === "overview") setOverview(d.overview as string);
            else if (evtName === "signal") setSignals((p) => [...p, d as unknown as Signal]);
            else if (evtName === "done") setPhase("done");
            else if (evtName === "error") { setError(d.message as string); setPhase("error"); }
          } catch { /* ignore */ }
        }
      }
      if (phase !== "error") setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setPhase("error");
    }
  }, [competitor, phase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.08_0_0/0.85)] backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[oklch(0.22_0_0)]">
          <img
            src={`https://logo.clearbit.com/${competitor.domain}`}
            alt={competitor.name}
            className="w-7 h-7 rounded-md"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex-1">
            <div className="font-semibold text-sm">{competitor.name}</div>
            <div className="text-xs text-[oklch(0.45_0_0)] font-mono">{competitor.domain}</div>
          </div>
          <div className="flex items-center gap-2">
            {phase === "scanning" && (
              <div className="flex items-center gap-1.5 text-xs text-[oklch(0.72_0.16_240)] font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.16_240)] animate-pulse" />
                LIVE
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-[oklch(0.40_0_0)] hover:text-[oklch(0.70_0_0)] hover:bg-[oklch(0.18_0_0)] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {phase === "idle" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[oklch(0.72_0.16_240/0.1)] border border-[oklch(0.72_0.16_240/0.2)] flex items-center justify-center mb-4">
                <Zap size={24} className="text-[oklch(0.72_0.16_240)]" />
              </div>
              <h3 className="font-semibold text-[oklch(0.90_0_0)] mb-1">Scan {competitor.name}</h3>
              <p className="text-sm text-[oklch(0.50_0_0)] max-w-sm mb-6">
                Tower will scrape their pricing, blog, careers, and features pages — then extract every competitive signal with Gemini Vision.
              </p>
              <button
                onClick={startScan}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors"
              >
                <Zap size={15} />
                Start scan
              </button>
            </div>
          )}

          {(phase === "scanning" || phase === "done") && (
            <div className="space-y-4">
              {/* Status */}
              {phase === "scanning" && (
                <div className="flex items-center gap-2 text-xs text-[oklch(0.55_0_0)]">
                  <div className="w-3 h-3 rounded-full border border-[oklch(0.38_0_0)] border-t-[oklch(0.72_0.16_240)] animate-spin flex-shrink-0" />
                  {status}
                </div>
              )}

              {/* Overview */}
              {overview && (
                <div className="p-4 rounded-xl border border-[oklch(0.72_0.16_240/0.2)] bg-[oklch(0.72_0.16_240/0.04)]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield size={12} className="text-[oklch(0.72_0.16_240)]" />
                    <span className="text-[10px] font-mono text-[oklch(0.72_0.16_240)] uppercase">AI Overview</span>
                  </div>
                  <p className="text-sm text-[oklch(0.75_0_0)] leading-relaxed">{overview}</p>
                </div>
              )}

              {/* Signals */}
              <AnimatePresence initial={false}>
                {signals.map((sig, i) => {
                  const Icon = TYPE_ICON[sig.type] ?? Zap;
                  const color = TYPE_COLOR[sig.type] ?? "oklch(0.60 0 0)";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3 p-3 rounded-lg border border-[oklch(0.20_0_0)] bg-[oklch(0.16_0_0)]"
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, border: `1px solid color-mix(in oklch, ${color} 30%, transparent)` }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-[oklch(0.88_0_0)]">{sig.title}</span>
                          <span className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0",
                            sig.impact >= 70 ? "bg-[oklch(0.68_0.24_25/0.15)] text-[oklch(0.68_0.24_25)]" :
                            sig.impact >= 40 ? "bg-[oklch(0.82_0.20_85/0.15)] text-[oklch(0.82_0.20_85)]" :
                            "bg-[oklch(0.22_0_0)] text-[oklch(0.45_0_0)]"
                          )}>
                            {sig.impact}
                          </span>
                        </div>
                        <p className="text-xs text-[oklch(0.55_0_0)] mt-0.5 leading-relaxed">{sig.summary}</p>
                        <span className="text-[10px] font-mono text-[oklch(0.35_0_0)] mt-1 block">
                          {sig.type.replace(/_/g, " ")} · {(sig.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {phase === "done" && signals.length > 0 && (
                <div className="text-center pt-2">
                  <div className="text-xs text-[oklch(0.71_0.22_145)] font-mono">
                    ✓ {signals.length} signals extracted from {competitor.name}
                  </div>
                  <button
                    onClick={startScan}
                    className="mt-3 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors"
                  >
                    Scan again →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === "error" && (
            <div className="p-4 rounded-xl border border-[oklch(0.68_0.24_25/0.3)] bg-[oklch(0.68_0.24_25/0.06)]">
              <div className="text-sm font-semibold text-[oklch(0.68_0.24_25)] mb-1">Scan failed</div>
              <div className="text-xs text-[oklch(0.60_0_0)]">{error}</div>
              <button
                onClick={startScan}
                className="mt-3 text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors"
              >
                Try again →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
