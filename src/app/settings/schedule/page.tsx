"use client";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { Bell, Mail, Clock, Zap, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export default function SchedulePage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ scanned: number; totalSignals: number; highImpact: number; emailSent: boolean; emailError?: string; emailTo?: string } | null>(null);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  // Convert to 24h for storage
  const to24h = () => {
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertEmail: email, scanScheduleHour: to24h() }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleScanNow = async () => {
    setScanning(true);
    setScanResult(null);
    setScanError("");
    try {
      const res = await fetch("/api/scan-all", { method: "POST" });
      const data = await res.json() as typeof scanResult & { error?: string };
      if (data.error) throw new Error(data.error);
      setScanResult(data);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / SETTINGS</div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={20} />
          Alerts & Schedule
        </h1>
        <p className="text-sm text-[oklch(0.50_0_0)] mt-1">
          Configure daily competitor scans and email notifications.
        </p>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Email */}
        <div className="p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={14} className="text-[oklch(0.72_0.16_240)]" />
            <span className="text-sm font-semibold">Alert Email</span>
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-3">
            Receive daily scan results when high-impact signals are detected.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2 text-sm font-mono text-[oklch(0.80_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
          />
        </div>

        {/* Time picker */}
        <div className="p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-[oklch(0.72_0.16_240)]" />
            <span className="text-sm font-semibold">Daily Scan Time</span>
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-4">
            Tower scans all your competitors at this time every day and emails you the results.
          </p>

          <div className="flex items-center gap-3">
            {/* Hour */}
            <div className="flex-1">
              <label className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase block mb-1.5">Hour</label>
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2.5 text-sm font-mono text-[oklch(0.80_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] appearance-none cursor-pointer"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="text-2xl font-bold text-[oklch(0.40_0_0)] mt-5">:</div>

            {/* Minute */}
            <div className="flex-1">
              <label className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase block mb-1.5">Minute</label>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2.5 text-sm font-mono text-[oklch(0.80_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] appearance-none cursor-pointer"
              >
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* AM/PM */}
            <div className="flex-none">
              <label className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase block mb-1.5">AM/PM</label>
              <div className="flex gap-1">
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmpm(p)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-semibold font-mono transition-all",
                      ampm === p
                        ? "bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)]"
                        : "bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-[oklch(0.40_0_0)] font-mono">
            → Daily scan at <span className="text-[oklch(0.72_0.16_240)]">{hour}:{minute} {ampm}</span> · email sent to <span className="text-[oklch(0.72_0.16_240)]">{email || "your email"}</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            saved
              ? "bg-[oklch(0.71_0.22_145/0.15)] text-[oklch(0.71_0.22_145)] border border-[oklch(0.71_0.22_145/0.3)]"
              : "bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)] disabled:opacity-50"
          )}
        >
          {saved ? <><CheckCircle size={14} /> Saved</> : saving ? "Saving..." : "Save Settings"}
        </button>

        {/* Scan now */}
        <div className="border-t border-[oklch(0.22_0_0)] pt-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[oklch(0.82_0.20_85)]" />
            <span className="text-sm font-semibold">Run Scan Now</span>
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-4">
            Don&apos;t wait — scan all competitors immediately and get the email right now.
          </p>

          <button
            onClick={handleScanNow}
            disabled={scanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[oklch(0.82_0.20_85/0.15)] text-[oklch(0.82_0.20_85)] border border-[oklch(0.82_0.20_85/0.3)] hover:bg-[oklch(0.82_0.20_85/0.25)] transition-colors disabled:opacity-50"
          >
            <Zap size={14} className={scanning ? "animate-pulse" : ""} />
            {scanning ? "Scanning competitors..." : "Scan All & Email Results"}
          </button>

          {scanResult && (
            <div className="mt-4 p-4 rounded-xl border border-[oklch(0.71_0.22_145/0.3)] bg-[oklch(0.71_0.22_145/0.05)]">
              <div className="text-sm font-semibold text-[oklch(0.71_0.22_145)] mb-3">✓ Scan complete</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-[oklch(0.90_0_0)]">{scanResult.scanned}</div>
                  <div className="text-[10px] text-[oklch(0.45_0_0)] font-mono uppercase">Scanned</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[oklch(0.72_0.16_240)]">{scanResult.totalSignals}</div>
                  <div className="text-[10px] text-[oklch(0.45_0_0)] font-mono uppercase">Signals</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[oklch(0.68_0.24_25)]">{scanResult.highImpact}</div>
                  <div className="text-[10px] text-[oklch(0.45_0_0)] font-mono uppercase">High Impact</div>
                </div>
              </div>
              {scanResult.emailSent ? (
                <div className="mt-3 text-xs text-[oklch(0.71_0.22_145)]">
                  📧 Email sent to <span className="font-semibold">{scanResult.emailTo ?? email}</span> — check your inbox!
                </div>
              ) : (
                <div className="mt-3 text-xs text-[oklch(0.68_0.24_25)]">
                  ❌ Email failed: {scanResult.emailError ?? "Unknown error"}
                  {scanResult.emailError?.includes("RESEND_API_KEY") && (
                    <span> — <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="underline">get a free key here</a></span>
                  )}
                </div>
              )}
            </div>
          )}

          {scanError && (
            <div className="mt-4 p-3 rounded-lg border border-[oklch(0.68_0.24_25/0.3)] bg-[oklch(0.68_0.24_25/0.06)]">
              <p className="text-xs text-[oklch(0.68_0.24_25)]">{scanError}</p>
              {scanError.includes("No competitors") && (
                <a href="/watchlists" className="text-xs text-[oklch(0.72_0.16_240)] mt-1 block">Add competitors first →</a>
              )}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)]">
          <p className="text-xs text-[oklch(0.40_0_0)]">
            <span className="text-[oklch(0.65_0_0)] font-semibold">Free email via Resend:</span>{" "}
            Add <code className="text-[oklch(0.72_0.16_240)]">RESEND_API_KEY</code> to Vercel env vars.
            Get a free key at{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-[oklch(0.72_0.16_240)] hover:underline">resend.com/api-keys</a>
            {" "}(3,000 emails/month free).
          </p>
        </div>
      </div>
    </PageShell>
  );
}
