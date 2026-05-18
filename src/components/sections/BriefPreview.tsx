"use client";
import type { Brief } from "@/types";
import Link from "next/link";
import { formatDate, formatRelative } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";

interface BriefPreviewProps {
  brief: Brief | null;
  watchlistId: string;
}

export function BriefPreview({ brief, watchlistId }: BriefPreviewProps) {
  if (!brief) {
    return (
      <div className="rounded-xl border border-dashed border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] p-8 text-center">
        <FileText size={24} className="mx-auto mb-2 text-[oklch(0.35_0_0)]" />
        <div className="text-sm text-[oklch(0.45_0_0)]">No brief yet</div>
        <div className="text-xs text-[oklch(0.35_0_0)] mt-1">Run your first scan to generate a competitive brief</div>
      </div>
    );
  }

  const preview = brief.paragraphs?.[0] ?? brief.markdown?.slice(0, 300) ?? "";

  return (
    <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[oklch(0.22_0_0)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">This Week's Brief</h2>
          <div className="text-[10px] text-[oklch(0.40_0_0)] font-mono mt-0.5">
            published {formatRelative(brief.createdAt)} · {formatDate(brief.weekStart)} →{" "}
            {formatDate(brief.weekEnd)}
          </div>
        </div>
        <Link
          href={`/briefs/${brief.id}`}
          className="flex items-center gap-1 text-xs text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.85_0.16_240)] transition-colors"
        >
          read full brief
          <ExternalLink size={11} />
        </Link>
      </div>
      <div className="px-5 py-5">
        {brief.pullQuote && (
          <blockquote className="border-l-2 border-[oklch(0.72_0.16_240)] pl-4 mb-4">
            <p className="text-sm font-semibold text-[oklch(0.90_0_0)] italic">
              &ldquo;{brief.pullQuote}&rdquo;
            </p>
          </blockquote>
        )}
        {brief.tldr && (
          <p className="text-sm text-[oklch(0.80_0_0)] font-medium mb-3 leading-relaxed">
            {brief.tldr}
          </p>
        )}
        <p className="text-sm text-[oklch(0.58_0_0)] leading-relaxed line-clamp-3">{preview}</p>
        <Link
          href={`/briefs/${brief.id}`}
          className="inline-flex items-center gap-1 mt-3 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors"
        >
          read more →
        </Link>
      </div>
    </div>
  );
}
