"use client";
import { use } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DEMO_BRIEF, DEMO_COMPETITORS, DEMO_DIFFS } from "@/lib/seed-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Share2, Download, ArrowLeft } from "lucide-react";

export default function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = use(params);
  const brief = DEMO_BRIEF;
  const citations = brief.citations ?? [];

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, nav, .no-print { display: none !important; }
          .prose p { color: #333 !important; }
        }
      `}</style>
      <PageShell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/watchlists/wl-demo-001"
              className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors"
            >
              <ArrowLeft size={12} />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/share/${DEMO_BRIEF.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[oklch(0.28_0_0)] text-[oklch(0.65_0_0)] hover:bg-[oklch(0.17_0_0)] transition-colors"
              >
                <Share2 size={12} />
                Share
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[oklch(0.28_0_0)] text-[oklch(0.65_0_0)] hover:bg-[oklch(0.17_0_0)] transition-colors"
              >
                <Download size={12} />
                PDF
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-2">
            {formatDate(brief.weekStart)} → {formatDate(brief.weekEnd)} · Modern GTM Stack
          </div>

          <h1 className="text-3xl font-bold leading-tight mb-4">{brief.title}</h1>

          {brief.tldr && (
            <div className="p-4 rounded-lg bg-[oklch(0.17_0_0)] border border-[oklch(0.22_0_0)] mb-6">
              <div className="text-[10px] font-mono text-[oklch(0.45_0_0)] uppercase mb-1.5">TL;DR</div>
              <p className="text-sm font-medium text-[oklch(0.85_0_0)] leading-relaxed">{brief.tldr}</p>
            </div>
          )}

          {brief.pullQuote && (
            <div className="border-l-4 border-[oklch(0.72_0.16_240)] pl-5 my-8">
              <p className="text-xl font-semibold text-[oklch(0.96_0_0)] leading-snug italic">
                &ldquo;{brief.pullQuote}&rdquo;
              </p>
            </div>
          )}

          <div className="prose prose-invert prose-sm max-w-none">
            {brief.paragraphs?.map((para, i) => (
              <p key={i} className="text-[oklch(0.75_0_0)] leading-[1.85] mb-5 text-base">
                {para}
                {citations
                  .filter((c) => c.paragraphIndex === i)
                  .map((c, ci) => (
                    <sup key={ci}>
                      <Link
                        href={`/watchlists/wl-demo-001/diffs/${c.diffId}`}
                        className="ml-0.5 text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] font-mono"
                      >
                        [{ci + 1}]
                      </Link>
                    </sup>
                  ))}
              </p>
            ))}
          </div>

          {citations.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[oklch(0.22_0_0)]">
              <div className="text-xs font-mono text-[oklch(0.40_0_0)] mb-3 uppercase">Citations</div>
              <div className="space-y-2">
                {citations.map((c, i) => {
                  const diff = DEMO_DIFFS.find((d) => d.id === c.diffId);
                  const competitor = DEMO_COMPETITORS.find((comp) => diff?.competitorId === comp.id);
                  return (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="font-mono text-[oklch(0.72_0.16_240)] w-5 flex-shrink-0">
                        [{i + 1}]
                      </span>
                      <Link
                        href={`/watchlists/wl-demo-001/diffs/${c.diffId}`}
                        className="text-[oklch(0.55_0_0)] hover:text-[oklch(0.70_0_0)] transition-colors"
                      >
                        {competitor?.name} — {diff?.summary?.slice(0, 80)}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[oklch(0.22_0_0)] flex items-center justify-between text-[10px] font-mono text-[oklch(0.35_0_0)]">
            <span>Generated by {brief.generatedBy}</span>
            <span>{formatDate(brief.createdAt)}</span>
          </div>
        </div>
      </PageShell>
    </>
  );
}
