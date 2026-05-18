export type WatchlistId = string & { readonly __brand: "WatchlistId" };
export type CompetitorId = string & { readonly __brand: "CompetitorId" };
export type SignalId = string & { readonly __brand: "SignalId" };
export type DiffId = string & { readonly __brand: "DiffId" };
export type BriefId = string & { readonly __brand: "BriefId" };
export type ScanId = string & { readonly __brand: "ScanId" };

export type PageType =
  | "pricing"
  | "careers"
  | "blog"
  | "changelog"
  | "social_linkedin"
  | "social_twitter"
  | "homepage"
  | "docs"
  | "case_studies"
  | "dashboard";

export type SignalType =
  | "pricing_tier"
  | "feature_change"
  | "hiring_role"
  | "headcount_metric"
  | "blog_post"
  | "release_note"
  | "partnership"
  | "customer_win"
  | "funding_round"
  | "leadership_change"
  | "case_study"
  | "product_launch";

export type DiffKind = "added" | "removed" | "changed";

export type LobsterAction = "ALLOW" | "DENY" | "LOG" | "HUMAN_REVIEW" | "QUARANTINE" | "RATE_LIMIT";

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Signal {
  id: string;
  competitorId: string;
  screenshotId: string;
  type: SignalType;
  payload: Record<string, unknown>;
  rawQuote: string;
  boundingBox?: BBox;
  confidence: number;
  capturedAt: string;
}

export interface Diff {
  id: string;
  competitorId: string;
  kind: DiffKind;
  beforeSignalId?: string;
  afterSignalId?: string;
  impact: number;
  summary: string;
  details?: Record<string, unknown>;
  weekStart: string;
  weekEnd: string;
}

export interface Competitor {
  id: string;
  watchlistId: string;
  name: string;
  domain: string;
  logoUrl?: string;
  pages?: CompetitorPage[];
  latestSignals?: Signal[];
  latestDiffs?: Diff[];
  topImpact?: number;
}

export interface CompetitorPage {
  id: string;
  competitorId: string;
  pageType: PageType;
  url: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  alertChannels: AlertChannel[];
  briefPromptOverride?: string;
  shareToken?: string;
  competitors?: Competitor[];
}

export type AlertChannel =
  | { kind: "slack"; webhookUrl: string }
  | { kind: "email"; email: string }
  | { kind: "webhook"; url: string };

export interface Brief {
  id: string;
  watchlistId: string;
  weekStart: string;
  weekEnd: string;
  markdown: string;
  title?: string;
  tldr?: string;
  pullQuote?: string;
  paragraphs?: string[];
  citations: Array<{ diffId: string; signalId: string; paragraphIndex: number }>;
  generatedBy: string;
  createdAt: string;
}

export interface LobsterTrapEvent {
  id: string;
  requestId: string;
  policyId: string;
  policyRevision: string;
  action: LobsterAction;
  declaredIntent?: string;
  detectedIntent?: string;
  payloadRedacted?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
  occurredAt: string;
}

export interface Alert {
  id: string;
  watchlistId: string;
  diffId: string;
  channel: string;
  status: "pending" | "delivered" | "failed" | "deduped";
  payload: Record<string, unknown>;
  deliveredAt?: string;
  createdAt: string;
}

export interface ExtractedSignal {
  type: SignalType;
  payload: Record<string, unknown>;
  rawQuote: string;
  boundingBox: BBox;
  confidence: number;
}

export interface ExtractOutput {
  signals: ExtractedSignal[];
  notes?: string;
}

export type PipelineEvent =
  | { event: "scan.start"; data: { competitorId: string; pageId: string; at: string } }
  | { event: "scan.complete"; data: { scanId: string; sha256: string } }
  | { event: "extract.signal"; data: { signalId: string; type: SignalType; confidence: number; rawQuote: string } }
  | { event: "lobster.quarantine"; data: { policyId: string; action: LobsterAction; requestId: string } }
  | { event: "diff.created"; data: { diffId: string; impact: number; summary: string } }
  | { event: "alert.dispatched"; data: { alertId: string; channel: string } }
  | { event: "brief.generated"; data: { briefId: string; weekStart: string; weekEnd: string } };

export interface KGNode {
  id: string;
  label: string;
  kind: "Company" | "Person" | "Product" | "FundingRound" | "Partnership";
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  z?: number;
}

export interface KGEdge {
  source: string;
  target: string;
  relationship: string;
  properties?: Record<string, unknown>;
}

export interface KGGraph {
  nodes: KGNode[];
  links: KGEdge[];
}
