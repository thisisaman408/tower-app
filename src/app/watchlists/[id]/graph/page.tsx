import { PageShell } from "@/components/layout/PageShell";
import { KnowledgeGraph } from "@/components/sections/KnowledgeGraph";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = await params;
  return (
    <PageShell fullWidth>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/watchlists/wl-demo-001"
              className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors mb-1"
            >
              <ArrowLeft size={12} />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Company Knowledge Graph</h1>
            <p className="text-sm text-[oklch(0.50_0_0)]">Neo4j-backed entity graph. Hover nodes for signal evidence.</p>
          </div>
          <div className="text-xs font-mono text-[oklch(0.38_0_0)]">
            Powered by Gemini 2.0 Pro entity extraction
          </div>
        </div>
        <KnowledgeGraph />
      </div>
    </PageShell>
  );
}
