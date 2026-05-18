"use client";
import { PageShell } from "@/components/layout/PageShell";
import { Shield, AlertTriangle, CheckCircle, Zap, Lock, Eye, FileSearch, Cpu } from "lucide-react";
import { FadeInUp, StaggerContainer } from "@/components/animations";
import Link from "next/link";

const POLICIES = [
  {
    id: "image-injection-instruction-grammar",
    name: "Prompt Injection Guard",
    desc: "Detects embedded instructions in screenshots (e.g. 'ignore previous instructions', 'act as', 'system:') that could hijack Gemini extraction.",
    status: "ACTIVE",
    severity: "critical",
    icon: AlertTriangle,
  },
  {
    id: "image-exif-suspect",
    name: "EXIF Metadata Scan",
    desc: "Inspects image EXIF data for hidden payloads or unusual metadata that could carry adversarial content.",
    status: "ACTIVE",
    severity: "high",
    icon: FileSearch,
  },
  {
    id: "declared-vs-detected-mismatch",
    name: "Content Mismatch Check",
    desc: "Compares declared page type (pricing, blog, careers) against detected content. Flags suspicious mismatches.",
    status: "ACTIVE",
    severity: "medium",
    icon: Eye,
  },
  {
    id: "output-schema-enforcement",
    name: "Output Schema Enforcement",
    desc: "Validates all Gemini responses against a strict signal schema. Rejects any output that deviates from the expected format.",
    status: "ACTIVE",
    severity: "medium",
    icon: Cpu,
  },
  {
    id: "rate-limit-abuse",
    name: "Extraction Rate Limiter",
    desc: "Prevents abuse of the Gemini Vision API. Limits extraction requests per session and blocks automated mass extraction attempts.",
    status: "ACTIVE",
    severity: "low",
    icon: Lock,
  },
];

const SEVERITY_COLORS = {
  critical: { dot: "bg-[oklch(0.68_0.24_25)]", badge: "text-[oklch(0.68_0.24_25)] bg-[oklch(0.68_0.24_25/0.1)] border-[oklch(0.68_0.24_25/0.3)]" },
  high: { dot: "bg-[oklch(0.82_0.20_85)]", badge: "text-[oklch(0.82_0.20_85)] bg-[oklch(0.82_0.20_85/0.1)] border-[oklch(0.82_0.20_85/0.3)]" },
  medium: { dot: "bg-[oklch(0.72_0.16_240)]", badge: "text-[oklch(0.72_0.16_240)] bg-[oklch(0.72_0.16_240/0.1)] border-[oklch(0.72_0.16_240/0.2)]" },
  low: { dot: "bg-[oklch(0.71_0.22_145)]", badge: "text-[oklch(0.71_0.22_145)] bg-[oklch(0.71_0.22_145/0.1)] border-[oklch(0.71_0.22_145/0.2)]" },
};

export default function LobsterAuditPage() {
  return (
    <PageShell>
      <FadeInUp>
        <div className="mb-8">
          <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / SECURITY</div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={22} className="text-[oklch(0.72_0.16_240)]" />
            Lobster Trap
          </h1>
          <p className="text-sm text-[oklch(0.50_0_0)] mt-1">
            Prompt injection defense layer. Every Gemini Vision call passes through these policies before extraction begins.
          </p>
        </div>
      </FadeInUp>

      {/* Status banner */}
      <FadeInUp delay={0.05}>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[oklch(0.71_0.22_145/0.3)] bg-[oklch(0.71_0.22_145/0.05)] mb-8">
          <div className="w-2 h-2 rounded-full bg-[oklch(0.71_0.22_145)] animate-pulse" />
          <div>
            <div className="text-sm font-semibold text-[oklch(0.71_0.22_145)]">All systems operational</div>
            <div className="text-xs text-[oklch(0.45_0_0)]">{POLICIES.length} active policies · 0 incidents · monitoring every Gemini call</div>
          </div>
          <div className="ml-auto text-xs font-mono text-[oklch(0.35_0_0)]">policy v2026-05-19</div>
        </div>
      </FadeInUp>

      {/* How it works */}
      <FadeInUp delay={0.08}>
        <div className="mb-8 p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap size={14} className="text-[oklch(0.82_0.20_85)]" />
            How Lobster Trap protects your extractions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Intercept", desc: "Every screenshot or URL submitted to Tower is intercepted before reaching Gemini." },
              { step: "2", title: "Inspect", desc: "All 5 policies run in parallel — EXIF scan, injection grammar check, schema validation." },
              { step: "3", title: "Allow or Quarantine", desc: "Clean requests proceed to Gemini. Adversarial content is quarantined with full audit trail." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[oklch(0.72_0.16_240/0.15)] border border-[oklch(0.72_0.16_240/0.3)] flex items-center justify-center flex-shrink-0 text-[11px] font-mono text-[oklch(0.72_0.16_240)]">
                  {item.step}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[oklch(0.80_0_0)] mb-0.5">{item.title}</div>
                  <div className="text-xs text-[oklch(0.45_0_0)]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Active policies */}
      <FadeInUp delay={0.1}>
        <h2 className="text-sm font-semibold mb-3 text-[oklch(0.65_0_0)] uppercase font-mono tracking-wide">Active Policies</h2>
      </FadeInUp>
      <StaggerContainer className="space-y-3 mb-8" staggerDelay={0.05}>
        {POLICIES.map((policy) => {
          const Icon = policy.icon;
          const colors = SEVERITY_COLORS[policy.severity as keyof typeof SEVERITY_COLORS];
          return (
            <div key={policy.id} className="flex gap-4 p-4 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
              <div className="w-9 h-9 rounded-lg bg-[oklch(0.72_0.16_240/0.1)] border border-[oklch(0.72_0.16_240/0.2)] flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[oklch(0.72_0.16_240)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[oklch(0.88_0_0)]">{policy.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${colors.badge}`}>
                    {policy.severity}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-[oklch(0.71_0.22_145)] flex items-center gap-1">
                    <CheckCircle size={10} /> ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[oklch(0.50_0_0)]">{policy.desc}</p>
                <div className="mt-1.5 text-[10px] font-mono text-[oklch(0.30_0_0)]">{policy.id}</div>
              </div>
            </div>
          );
        })}
      </StaggerContainer>

      {/* Try it */}
      <FadeInUp delay={0.15}>
        <div className="p-5 rounded-xl border border-dashed border-[oklch(0.28_0_0)]">
          <div className="text-sm font-semibold mb-1">Try the adversarial demo</div>
          <p className="text-xs text-[oklch(0.45_0_0)] mb-3">
            Go to Live Extract, click the red "adversarial/injection-01.png" sample and watch Lobster Trap block it in real time.
          </p>
          <Link
            href="/demo/extract"
            className="inline-flex items-center gap-1.5 text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors"
          >
            <Zap size={11} />
            Open Live Extract →
          </Link>
        </div>
      </FadeInUp>
    </PageShell>
  );
}
