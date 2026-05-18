"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef, Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { Crosshair, X } from "lucide-react";

class GraphErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center gap-3 p-8">
        <div className="text-3xl">🕸</div>
        <div className="text-sm text-[oklch(0.65_0_0)]">3D Graph requires hardware acceleration</div>
        <div className="text-xs text-[oklch(0.40_0_0)]">Enable GPU acceleration in Chrome settings</div>
      </div>
    );
    return this.props.children;
  }
}

const ForceGraph3D = dynamic(
  () => import("react-force-graph-3d").then((m) => m.default),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[520px] text-[oklch(0.45_0_0)] text-sm">Loading 3D graph...</div> }
);

const EDGE_COLORS: Record<string, string> = {
  COMPETES_WITH: "#ff4444",
  PARTNERS_WITH: "#b86be0",
};
const NODE_COLORS: Record<string, string> = {
  Company: "#4da6ff",
  Person: "#48c45a",
  Product: "#f0c040",
  FundingRound: "#e05c35",
  Partnership: "#c070e8",
};
const THREAT_COLORS: Record<string, string> = {
  high: "#ff4444",
  medium: "#f0a040",
  low: "#48c45a",
};

interface GraphNode {
  id: string; label: string; kind: string;
  properties: Record<string, string>;
  x?: number; y?: number; z?: number; __threeObj?: unknown;
}
interface GraphLink {
  source: string | GraphNode; target: string | GraphNode;
  relationship: string; reason?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FGRef = { cameraPosition: (pos: object, lookAt?: object, ms?: number) => void } | null;

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterEdge, setFilterEdge] = useState<string | null>(null);
  const fgRef = useRef<FGRef>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((d) => setGraphData(d as { nodes: GraphNode[]; links: GraphLink[] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const centerCamera = useCallback(() => {
    fgRef.current?.cameraPosition({ x: 0, y: 0, z: 400 }, { x: 0, y: 0, z: 0 }, 800);
  }, []);

  const filteredLinks = filterEdge
    ? graphData.links.filter((l) => l.relationship === filterEdge)
    : graphData.links;

  const edgeTypes = [...new Set(graphData.links.map((l) => l.relationship))];

  const nodeColor = useCallback((node: object) => {
    const n = node as GraphNode;
    const threat = n.properties?.threat;
    if (threat && THREAT_COLORS[threat]) return THREAT_COLORS[threat];
    return NODE_COLORS[n.kind] ?? "#888888";
  }, []);

  const linkColor = useCallback((link: object) => EDGE_COLORS[(link as GraphLink).relationship] ?? "#444444", []);

  if (loading) return (
    <div className="flex items-center justify-center h-[560px] text-[oklch(0.45_0_0)] text-sm gap-2 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0)]">
      <span className="w-4 h-4 rounded-full border-2 border-[oklch(0.38_0_0)] border-t-[oklch(0.72_0.16_240)] animate-spin" />
      Gemini is mapping relationships...
    </div>
  );

  return (
    <div className="rounded-xl border border-[oklch(0.22_0_0)] overflow-hidden bg-[oklch(0.13_0_0)]">
      {/* Controls bar */}
      <div className="border-b border-[oklch(0.22_0_0)] px-4 py-2.5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {Object.entries(NODE_COLORS).slice(0, 2).map(([kind, color]) => (
            <div key={kind} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-mono text-[oklch(0.50_0_0)]">{kind}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff4444]" />
            <span className="text-[10px] font-mono text-[oklch(0.50_0_0)]">High threat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#f0a040]" />
            <span className="text-[10px] font-mono text-[oklch(0.50_0_0)]">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#48c45a]" />
            <span className="text-[10px] font-mono text-[oklch(0.50_0_0)]">Low</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {edgeTypes.map((t) => (
            <button key={t} onClick={() => setFilterEdge(filterEdge === t ? null : t)}
              className={cn("text-[10px] font-mono px-2 py-0.5 rounded transition-colors border",
                filterEdge === t ? "bg-[oklch(0.72_0.16_240/0.15)] text-[oklch(0.72_0.16_240)] border-[oklch(0.72_0.16_240/0.3)]"
                : "text-[oklch(0.40_0_0)] border-[oklch(0.22_0_0)] hover:text-[oklch(0.65_0_0)]")}>
              {t}
            </button>
          ))}
          <button onClick={centerCamera}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-[oklch(0.25_0_0)] text-[oklch(0.45_0_0)] hover:text-[oklch(0.72_0.16_240)] hover:border-[oklch(0.72_0.16_240/0.4)] transition-colors">
            <Crosshair size={10} />
            Center
          </button>
        </div>
      </div>

      <div className="relative flex">
        {/* Graph */}
        <div className="flex-1 h-[500px]">
          <GraphErrorBoundary>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ForceGraph3D
              ref={fgRef as any}
              graphData={{ nodes: graphData.nodes, links: filteredLinks }}
              nodeLabel={(n) => `${(n as GraphNode).label} · click for intel`}
              nodeColor={nodeColor}
              nodeRelSize={7}
              linkColor={linkColor}
              linkWidth={1.5}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={1}
              linkLabel={(l) => (l as GraphLink).reason ?? (l as GraphLink).relationship}
              backgroundColor="#111111"
              onNodeClick={(node) => setSelectedNode(selectedNode?.id === (node as GraphNode).id ? null : node as GraphNode)}
              cooldownTicks={120}
              nodeThreeObject={(node) => {
                const n = node as GraphNode;
                const threat = n.properties?.threat;
                const color = threat && THREAT_COLORS[threat] ? THREAT_COLORS[threat] : (NODE_COLORS[n.kind] ?? "#888888");
                const geo = new THREE.SphereGeometry(n.kind === "Company" ? 9 : 6);
                const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 });
                return new THREE.Mesh(geo, mat);
              }}
            />
          </GraphErrorBoundary>
        </div>

        {/* Click panel */}
        {selectedNode && (
          <div className="w-72 border-l border-[oklch(0.22_0_0)] bg-[oklch(0.14_0_0)] p-5 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {selectedNode.properties.logoUrl && (
                  <img src={selectedNode.properties.logoUrl} alt={selectedNode.label} className="w-8 h-8 rounded-md" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div>
                  <div className="font-bold text-sm text-[oklch(0.90_0_0)]">{selectedNode.label}</div>
                  <div className="text-[10px] font-mono text-[oklch(0.40_0_0)]">{selectedNode.properties.domain}</div>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-[oklch(0.35_0_0)] hover:text-[oklch(0.60_0_0)]">
                <X size={14} />
              </button>
            </div>

            {selectedNode.properties.description && (
              <p className="text-xs text-[oklch(0.65_0_0)] leading-relaxed border-l-2 border-[oklch(0.72_0.16_240)] pl-3">
                {selectedNode.properties.description}
              </p>
            )}

            <div className="space-y-2.5">
              {[
                { label: "Pricing", key: "pricing", icon: "💰" },
                { label: "Funding", key: "funding", icon: "📈" },
                { label: "Customers", key: "customers", icon: "🎯" },
                { label: "Core product", key: "keyProduct", icon: "⚡" },
              ].map(({ label, key, icon }) => selectedNode.properties[key] ? (
                <div key={key}>
                  <div className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase mb-0.5">{icon} {label}</div>
                  <div className="text-xs text-[oklch(0.75_0_0)]">{selectedNode.properties[key]}</div>
                </div>
              ) : null)}
            </div>

            {selectedNode.properties.threat && (
              <div className="mt-auto pt-3 border-t border-[oklch(0.22_0_0)]">
                <div className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase mb-1">Threat level</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: THREAT_COLORS[selectedNode.properties.threat] ?? "#888" }} />
                  <span className="text-sm font-semibold capitalize" style={{ color: THREAT_COLORS[selectedNode.properties.threat] ?? "#888" }}>
                    {selectedNode.properties.threat}
                  </span>
                </div>
              </div>
            )}

            {/* Connections */}
            {(() => {
              const connections = graphData.links.filter((l) => {
                const src = typeof l.source === "string" ? l.source : l.source.id;
                const tgt = typeof l.target === "string" ? l.target : l.target.id;
                return src === selectedNode.id || tgt === selectedNode.id;
              });
              if (!connections.length) return null;
              return (
                <div className="pt-3 border-t border-[oklch(0.22_0_0)]">
                  <div className="text-[10px] font-mono text-[oklch(0.38_0_0)] uppercase mb-2">Connections</div>
                  <div className="space-y-2">
                    {connections.map((l, i) => {
                      const otherId = (typeof l.source === "string" ? l.source : l.source.id) === selectedNode.id
                        ? (typeof l.target === "string" ? l.target : l.target.id)
                        : (typeof l.source === "string" ? l.source : l.source.id);
                      const other = graphData.nodes.find((n) => n.id === otherId);
                      return (
                        <div key={i} className="text-xs">
                          <span className="text-[oklch(0.72_0.16_240)]">{other?.label ?? otherId}</span>
                          <span className="text-[oklch(0.35_0_0)]"> · </span>
                          <span className="text-[oklch(0.50_0_0)]">{l.reason ?? l.relationship}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {!selectedNode && graphData.nodes.length > 0 && (
        <div className="border-t border-[oklch(0.22_0_0)] px-4 py-2 text-[10px] font-mono text-[oklch(0.32_0_0)]">
          {graphData.nodes.length} competitors mapped · {graphData.links.length} relationships · click any node for competitive intel
        </div>
      )}
    </div>
  );
}
