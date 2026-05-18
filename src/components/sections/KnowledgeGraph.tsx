"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { motion } from "motion/react";

class GraphErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-[520px] text-center gap-3 p-8">
          <div className="text-3xl">🕸</div>
          <div className="text-sm font-semibold text-[oklch(0.65_0_0)]">3D Graph requires hardware acceleration</div>
          <div className="text-xs text-[oklch(0.40_0_0)] max-w-sm">
            Enable GPU acceleration in your browser settings, or open this page in Chrome/Edge on a device with a dedicated GPU.
          </div>
          <div className="text-[10px] font-mono text-[oklch(0.30_0_0)] mt-2">WebGL context unavailable</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ForceGraph3D = dynamic(
  () => import("react-force-graph-3d").then((mod) => mod.default),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-[560px] text-[oklch(0.45_0_0)] text-sm gap-2">
      <span className="animate-spin">⟳</span> Loading 3D graph...
    </div>
  )}
);

// THREE.Color only accepts hex/rgb/hsl — not oklch
const EDGE_COLORS: Record<string, string> = {
  MAKES: "#3d8bff",
  COMPETES_WITH: "#e05030",
  WORKED_AT: "#42c462",
  PARTNERS_WITH: "#b86be0",
  RAISED: "#e8b741",
  ACQUIRED: "#e05030",
  CUSTOMER_OF: "#3d8bff",
};

const NODE_COLORS: Record<string, string> = {
  Company: "#4da6ff",
  Person: "#48c45a",
  Product: "#f0c040",
  FundingRound: "#e05c35",
  Partnership: "#c070e8",
};

interface GraphNode {
  id: string;
  label: string;
  kind: string;
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  z?: number;
  __threeObj?: unknown;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
}

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterEdge, setFilterEdge] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((data) => setGraphData(data as { nodes: GraphNode[]; links: GraphLink[] }))
      .catch(() => setGraphData({ nodes: [], links: [] }))
      .finally(() => setLoading(false));
  }, []);

  const filteredLinks = filterEdge
    ? graphData.links.filter((l) => l.relationship === filterEdge)
    : graphData.links;

  const edgeTypes = [...new Set(graphData.links.map((l) => l.relationship))];

  const nodeColor = useCallback((node: GraphNode) => {
    return NODE_COLORS[node.kind] ?? "#888888";
  }, []);

  const linkColor = useCallback((link: GraphLink) => {
    return EDGE_COLORS[link.relationship] ?? "#444444";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[560px] text-[oklch(0.45_0_0)] text-sm gap-2 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)]">
        <span className="animate-spin">⟳</span> Loading graph...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden bg-[oklch(0.13_0_0)]"
    >
      {/* Legend + filters */}
      <div className="border-b border-[oklch(0.22_0_0)] px-5 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          {Object.entries(NODE_COLORS).map(([kind, color]) => (
            <div key={kind} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-mono text-[oklch(0.50_0_0)]">{kind}</span>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-[oklch(0.38_0_0)]">Filter edges:</span>
          <button
            onClick={() => setFilterEdge(null)}
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded transition-colors",
              filterEdge === null
                ? "bg-[oklch(0.72_0.16_240/0.15)] text-[oklch(0.72_0.16_240)]"
                : "text-[oklch(0.40_0_0)] hover:text-[oklch(0.60_0_0)]"
            )}
          >
            ALL
          </button>
          {edgeTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterEdge(filterEdge === t ? null : t)}
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded transition-colors",
                filterEdge === t
                  ? "bg-[oklch(0.72_0.16_240/0.15)] text-[oklch(0.72_0.16_240)]"
                  : "text-[oklch(0.40_0_0)] hover:text-[oklch(0.60_0_0)]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="h-[520px]">
          <GraphErrorBoundary>
          <ForceGraph3D
            graphData={{ nodes: graphData.nodes as GraphNode[], links: filteredLinks as GraphLink[] }}
            nodeLabel={(node) => {
              const n = node as GraphNode;
              return `${n.label} (${n.kind})`;
            }}
            nodeColor={nodeColor as (node: object) => string}
            nodeRelSize={6}
            linkColor={linkColor as (link: object) => string}
            linkWidth={1.5}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkLabel={(link) => (link as GraphLink).relationship}
            backgroundColor="#1a1a1a"
            onNodeHover={(node) => setHoveredNode(node as GraphNode | null)}
            onNodeClick={(node) => setHoveredNode(node as GraphNode | null)}
            cooldownTicks={100}
            onEngineStop={() => {
              // Camera fly-in when graph stabilizes
            }}
            nodeThreeObject={(node) => {
              const n = node as GraphNode;
              const geometry = new THREE.SphereGeometry(n.kind === "Company" ? 8 : n.kind === "Person" ? 5 : 6);
              const material = new THREE.MeshLambertMaterial({
                color: NODE_COLORS[n.kind] ?? "#888888",
                transparent: true,
                opacity: 0.9,
              });
              return new THREE.Mesh(geometry, material);
            }}
          />
          </GraphErrorBoundary>
        </div>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 p-4 rounded-xl border border-[oklch(0.28_0_0)] bg-[oklch(0.17_0_0/0.95)] backdrop-blur-sm max-w-xs z-10">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: NODE_COLORS[hoveredNode.kind] ?? "#888888" }}
              />
              <span className="text-sm font-bold">{hoveredNode.label}</span>
              <span className="text-[10px] font-mono text-[oklch(0.40_0_0)] ml-auto">{hoveredNode.kind}</span>
            </div>
            <div className="space-y-1">
              {Object.entries(hoveredNode.properties)
                .filter(([k, v]) => v !== undefined && v !== null && !["watchlistId", "id", "logoUrl"].includes(k))
                .slice(0, 4)
                .map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-[oklch(0.40_0_0)] font-mono w-20 flex-shrink-0">{k}:</span>
                    <span className="text-[oklch(0.70_0_0)] break-all">{String(v)}</span>
                  </div>
                ))}
              {hoveredNode.properties.logoUrl && (
                <img
                  src={String(hoveredNode.properties.logoUrl)}
                  alt={hoveredNode.label}
                  className="w-6 h-6 rounded mt-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
