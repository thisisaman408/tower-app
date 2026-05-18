"use client";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { Bell, Mail, Clock, Zap, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`,
}));

export default function SchedulePage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [hour, setHour] = useState("08");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ scanned: number; totalSignals: number; highImpact: number; emailSent: boolean } | null>(null);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertEmail: email, scanScheduleHour: hour }),
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
            Receive daily scan results when high-impact signals are detected. Powered by Resend (free tier).
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2 text-sm font-mono text-[oklch(0.80_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
          />
        </div>

        {/* Schedule */}
        <div className="p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-[oklch(0.72_0.16_240)]" />
            <span className="text-sm font-semibold">Daily Scan Time</span>
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-3">
            Tower will automatically scan all your competitors every day at this time (UTC).
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {HOURS.filter((_, i) => i % 2 === 0).map((h) => (
              <button
                key={h.value}
                onClick={() => setHour(h.value)}
                className={cn(
                  "py-2 rounded-lg text-xs font-mono transition-colors",
                  hour === h.value
                    ? "bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)]"
                    : "bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)]"
                )}
              >
                {h.label}
              </button>
            ))}
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

        {/* Divider */}
        <div className="border-t border-[oklch(0.22_0_0)] pt-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[oklch(0.82_0.20_85)]" />
            <span className="text-sm font-semibold">Run Scan Now</span>
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-4">
            Scan all your competitors immediately and receive the results by email.
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
              <div className="text-sm font-semibold text-[oklch(0.71_0.22_145)] mb-2">✓ Scan complete</div>
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
              {scanResult.emailSent && (
                <div className="mt-3 text-xs text-[oklch(0.55_0_0)]">
                  📧 Results sent to <span className="text-[oklch(0.72_0.16_240)]">{email}</span>
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

        {/* Resend setup note */}
        <div className="p-4 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)]">
          <p className="text-xs text-[oklch(0.40_0_0)]">
            <span className="text-[oklch(0.65_0_0)] font-semibold">Free email via Resend:</span>{" "}
            Add <code className="text-[oklch(0.72_0.16_240)]">RESEND_API_KEY</code> to your environment variables.
            Get a free key at{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-[oklch(0.72_0.16_240)] hover:underline">resend.com/api-keys</a>
            {" "}(3,000 emails/month free). Add it to Vercel env vars and redeploy.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
