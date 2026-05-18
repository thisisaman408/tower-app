import { notFound } from "next/navigation";
import { DEMO_BRIEF, DEMO_WATCHLIST } from "@/lib/seed-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (token !== DEMO_WATCHLIST.shareToken && token !== "demo" && token !== "brief-001") {
    notFound();
  }

  const brief = DEMO_BRIEF;

  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)] text-[oklch(0.96_0_0)]">
      {/* Header */}
      <header className="border-b border-[oklch(0.22_0_0)] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-[oklch(0.40_0_0)] mb-0.5">{DEMO_WATCHLIST.name}</div>
          <div className="text-xs text-[oklch(0.45_0_0)]">Week of {formatDate(brief.weekStart)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[oklch(0.72_0.16_240)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[oklch(0.13_0_0)]">T</span>
          </div>
          <span className="text-xs font-semibold text-[oklch(0.65_0_0)]">tower</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-xs font-mono text-[oklch(0.40_0_0)] mb-4">
          {formatDate(brief.weekStart)} → {formatDate(brief.weekEnd)}
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-6">{brief.title}</h1>

        {brief.tldr && (
          <div className="p-4 rounded-lg bg-[oklch(0.17_0_0)] border border-[oklch(0.22_0_0)] mb-8">
            <div className="text-[10px] font-mono text-[oklch(0.40_0_0)] uppercase mb-1.5">TL;DR</div>
            <p className="text-sm font-medium text-[oklch(0.85_0_0)] leading-relaxed">{brief.tldr}</p>
          </div>
        )}

        {brief.pullQuote && (
          <div className="border-l-4 border-[oklch(0.72_0.16_240)] pl-5 my-8">
            <p className="text-xl font-semibold italic">"{brief.pullQuote}"</p>
          </div>
        )}

        <div className="space-y-6">
          {brief.paragraphs?.map((para, i) => (
            <p key={i} className="text-[oklch(0.72_0_0)] leading-[1.85] text-base">{para}</p>
          ))}
        </div>

        {/* Watermark CTA */}
        <div className="mt-16 pt-8 border-t border-[oklch(0.22_0_0)] flex items-center justify-between">
          <div className="text-xs text-[oklch(0.35_0_0)]">
            Powered by Tower · Gemini Vision Competitive Intelligence
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors"
          >
            Want this on your own competitors?
            <ArrowRight size={11} />
          </Link>
        </div>
      </main>
    </div>
  );
}
