"use client";
import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { ArrowRight, Eye, Shield, Zap, BarChart2, GitCompare, Bell } from "lucide-react";
import { FadeInUp, StaggerContainer, motion } from "@/components/animations";

const FEATURES = [
  {
    icon: Eye,
    title: "Gemini Vision Extraction",
    desc: "Drop a competitor screenshot. Watch Gemini 2.0 Flash extract every pricing tier, hire, and product change in real-time structured JSON.",
    accent: "oklch(0.72 0.16 240)",
  },
  {
    icon: GitCompare,
    title: "Week-over-Week Diff Engine",
    desc: "pgvector semantic dedup + typed comparators catch every change — price hikes, feature drops, headcount surges — scored 0–100 by business impact.",
    accent: "oklch(0.82 0.20 85)",
  },
  {
    icon: BarChart2,
    title: "Founder-Grade Briefs",
    desc: "Gemini Pro writes the weekly competitive memo in the voice of a founder. Think Stratechery, not McKinsey. Every claim cites a screenshot.",
    accent: "oklch(0.71 0.22 145)",
  },
  {
    icon: Shield,
    title: "Lobster Trap Security",
    desc: "Image prompt-injection defense on every Gemini Vision call. Adversarial competitors can't hijack your extraction pipeline.",
    accent: "oklch(0.72 0.16 240)",
  },
  {
    icon: Bell,
    title: "High-Signal Alerts",
    desc: "Slack + email fires instantly when any diff scores ≥ 80. Never miss a competitor pricing their way into your customers.",
    accent: "oklch(0.68 0.24 25)",
  },
  {
    icon: Zap,
    title: "3D Knowledge Graph",
    desc: "Neo4j-backed company graph visualized in R3F. See people moving between competitors, products competing, and funding flowing.",
    accent: "oklch(0.80 0.18 300)",
  },
];

const STATS = [
  { value: "$40K/yr", label: "vs. Klue per seat" },
  { value: "3", label: "Gemini surfaces" },
  { value: "<60s", label: "killer demo moment" },
  { value: "0", label: "teams doing this" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)]">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse, oklch(0.72 0.16 240) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <FadeInUp delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.72_0.16_240/0.08)] border border-[oklch(0.72_0.16_240/0.2)] text-[oklch(0.72_0.16_240)] text-xs font-mono mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.16_240)] animate-pulse" />
              Built for Transforming Enterprise Through AI · Gemini Award Track
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              The autonomous analyst{" "}
              <br />
              <span style={{ color: "oklch(0.72 0.16 240)", textShadow: "0 0 40px oklch(0.72 0.16 240 / 0.4)" }}>
                that never sleeps.
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.15}>
            <p className="text-xl text-[oklch(0.65_0_0)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Tower watches your competitors so you don&apos;t have to. Gemini Vision reads their pricing pages,
              careers, blog, and social — the way a founder would. Diff engine catches every change.
              Brief Writer ships the weekly board memo.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/demo/extract"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)] transition-colors"
              >
                <Zap size={16} />
                Try Live Extraction
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/watchlists"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border border-[oklch(0.28_0_0)] text-[oklch(0.80_0_0)] hover:bg-[oklch(0.17_0_0)] transition-colors"
              >
                <BarChart2 size={16} />
                View Demo Dashboard
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-8" staggerDelay={0.08}>
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-[oklch(0.96_0_0)] mb-1">{value}</div>
                <div className="text-xs text-[oklch(0.55_0_0)] font-mono uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Demo preview */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Drop a screenshot. Get intelligence.</h2>
              <p className="text-[oklch(0.60_0_0)]">60 seconds from drag-and-drop to structured competitive signal.</p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <div className="rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden bg-[oklch(0.15_0_0)]">
              <div className="border-b border-[oklch(0.22_0_0)] px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[oklch(0.68_0.24_25)]" />
                <div className="w-3 h-3 rounded-full bg-[oklch(0.82_0.20_85)]" />
                <div className="w-3 h-3 rounded-full bg-[oklch(0.71_0.22_145)]" />
                <span className="ml-3 text-xs font-mono text-[oklch(0.40_0_0)]">tower — /demo/extract</span>
              </div>
              <div className="grid grid-cols-2 gap-0 min-h-64">
                <div className="border-r border-[oklch(0.22_0_0)] p-8 flex flex-col items-center justify-center">
                  <div className="w-full max-w-48 aspect-video border-2 border-dashed border-[oklch(0.30_0_0)] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[oklch(0.72_0.16_240)] transition-colors cursor-pointer">
                    <Zap size={24} className="text-[oklch(0.55_0_0)]" />
                    <span className="text-xs text-[oklch(0.45_0_0)]">Drop competitor screenshot</span>
                  </div>
                  <div className="mt-4 text-xs text-[oklch(0.38_0_0)] font-mono">or pick a sample →</div>
                </div>
                <div className="p-6 font-mono text-xs">
                  <div className="text-[oklch(0.55_0_0)] mb-2">{"// Gemini 2.0 Flash extracting..."}</div>
                  <div className="text-[oklch(0.71_0.22_145)]">{"pricing_tier {"}</div>
                  <div className="pl-4 text-[oklch(0.80_0_0)]">{'  tierName: "Enterprise"'}</div>
                  <div className="pl-4 text-[oklch(0.82_0.20_85)]">{'  pricePerMonth: 1500'}</div>
                  <div className="pl-4 text-[oklch(0.80_0_0)]">{'  currency: "USD"'}</div>
                  <div className="pl-4 text-[oklch(0.71_0.22_145)]">{'  features: ['}</div>
                  <div className="pl-8 text-[oklch(0.80_0_0)]">{'"AI Agents",'}</div>
                  <div className="pl-8 text-[oklch(0.80_0_0)]">{'"Custom roles"'}</div>
                  <div className="pl-4 text-[oklch(0.71_0.22_145)]">{']'}</div>
                  <div className="pl-4 text-[oklch(0.82_0.20_85)]">{'  confidence: 0.94'}</div>
                  <div className="text-[oklch(0.71_0.22_145)]">{"}"}</div>
                  <div className="mt-2 text-[oklch(0.72_0.16_240)] animate-pulse">▋</div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[oklch(0.15_0_0)]">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-3">Every Gemini capability in production.</h2>
              <p className="text-[oklch(0.60_0_0)]">Three Gemini surfaces. One intelligence pipeline.</p>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.05}>
            {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
              <motion.div
                key={title}
                className="p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.17_0_0)] group cursor-default"
                whileHover={{ scale: 1.02, borderColor: accent }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-xs text-[oklch(0.55_0_0)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-3xl font-bold mb-3">Replace your $40K/yr Klue subscription.</h2>
            <p className="text-[oklch(0.60_0_0)] mb-10">MIT licensed. Deploy on Vercel. Free tier everything.</p>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
            <div className="p-6 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
              <div className="text-xs font-mono text-[oklch(0.45_0_0)] uppercase mb-2">Klue</div>
              <div className="text-4xl font-bold text-[oklch(0.68_0.24_25)]">$40K</div>
              <div className="text-xs text-[oklch(0.45_0_0)]">/year per seat</div>
              <ul className="mt-4 space-y-1.5 text-xs text-[oklch(0.55_0_0)]">
                <li>✓ Competitive intelligence</li>
                <li>✗ No Gemini Vision</li>
                <li>✗ No screenshot-native extraction</li>
                <li>✗ No image prompt-injection defense</li>
                <li>✗ Closed source</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-[oklch(0.72_0.16_240/0.3)] bg-[oklch(0.72_0.16_240/0.05)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] text-xs font-semibold">Tower</div>
              <div className="text-xs font-mono text-[oklch(0.72_0.16_240)] uppercase mb-2">Tower</div>
              <div className="text-4xl font-bold text-[oklch(0.71_0.22_145)]">Free</div>
              <div className="text-xs text-[oklch(0.45_0_0)]">MIT + Vercel free tier</div>
              <ul className="mt-4 space-y-1.5 text-xs text-[oklch(0.65_0_0)]">
                <li>✓ Competitive intelligence</li>
                <li>✓ Gemini Vision hero</li>
                <li>✓ Screenshot-native extraction</li>
                <li>✓ Lobster Trap injection defense</li>
                <li>✓ Open source</li>
              </ul>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
        <div className="max-w-xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-3xl font-bold mb-4">Start watching in 30 seconds.</h2>
            <p className="text-[oklch(0.60_0_0)] mb-8">No API key required for the demo. Drop a screenshot and watch Gemini extract.</p>
            <Link
              href="/demo/extract"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)] transition-colors text-lg"
            >
              <Zap size={20} />
              Open Live Extraction
              <ArrowRight size={16} />
            </Link>
          </FadeInUp>
        </div>
      </section>

      <footer className="border-t border-[oklch(0.22_0_0)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[oklch(0.38_0_0)]">
          <span>Tower · MIT License · Built for TechEx North America 2026</span>
          <span>Powered by Gemini 2.0 Flash · Veea Lobster Trap</span>
        </div>
      </footer>
    </div>
  );
}
