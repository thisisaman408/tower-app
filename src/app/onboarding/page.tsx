"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BusinessInfo {
  companyName?: string;
  businessSummary: string;
  industry: string;
  productType: string;
}

interface Competitor {
  name: string;
  domain: string;
  description: string;
}

type Step = 1 | 2 | 3 | 4;

function StepDots({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`rounded-full transition-all duration-300 ${
            n === current
              ? "w-6 h-2 bg-[oklch(0.72_0.16_240)]"
              : n < current
              ? "w-2 h-2 bg-[oklch(0.72_0.16_240/0.5)]"
              : "w-2 h-2 bg-[oklch(0.25_0_0)]"
          }`}
        />
      ))}
      <span className="text-xs text-[oklch(0.45_0_0)] ml-1 font-mono">{current}/{total}</span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [url, setUrl] = useState("");
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // Step 2 state
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [editedSummary, setEditedSummary] = useState("");
  const [findingCompetitors, setFindingCompetitors] = useState(false);
  const [competitorsError, setCompetitorsError] = useState("");

  // Step 3 state
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<Set<string>>(new Set());
  const [manualName, setManualName] = useState("");
  const [manualDomain, setManualDomain] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [createError, setCreateError] = useState("");

  // Step 1 handler
  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzeError("");
    setAnalyzingUrl(true);
    try {
      const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const res = await fetch("/api/onboard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json() as BusinessInfo & { error?: string; rateLimited?: boolean };
      // Always proceed to step 2 — user can fill in manually if Gemini failed
      setBusinessInfo(data);
      setEditedSummary(data.businessSummary ?? "");
      if (data.error) setAnalyzeError(data.error);
      setStep(2);
    } catch {
      setAnalyzeError("Could not reach the server. Check your connection.");
    } finally {
      setAnalyzingUrl(false);
    }
  };

  // Step 2 handler
  const handleFindCompetitors = async () => {
    setCompetitorsError("");
    setFindingCompetitors(true);
    try {
      const res = await fetch("/api/onboard/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          businessSummary: editedSummary,
          industry: businessInfo?.industry,
          companyName: businessInfo?.companyName ?? new URL(url).hostname.replace("www.", ""),
        }),
      });
      if (!res.ok) throw new Error("Failed to find competitors");
      const data: { competitors: Competitor[] } = await res.json();
      setCompetitors(data.competitors);
      setSelectedCompetitors(new Set(data.competitors.map((c) => c.domain)));
      setStep(3);
    } catch {
      setCompetitorsError("Could not find competitors. Please try again.");
    } finally {
      setFindingCompetitors(false);
    }
  };

  // Step 3 handlers
  const toggleCompetitor = (domain: string) => {
    setSelectedCompetitors((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  const addManualCompetitor = () => {
    if (!manualName.trim() || !manualDomain.trim()) return;
    const newComp: Competitor = {
      name: manualName.trim(),
      domain: manualDomain.trim(),
      description: "Added manually",
    };
    setCompetitors((prev) => [...prev, newComp]);
    setSelectedCompetitors((prev) => new Set([...prev, newComp.domain]));
    setManualName("");
    setManualDomain("");
  };

  const handleCreateWorkspace = async () => {
    setCreateError("");
    setCreatingWorkspace(true);
    const selected = competitors.filter((c) => selectedCompetitors.has(c.domain));
    try {
      const res = await fetch("/api/onboard/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: selected }),
      });
      if (!res.ok) throw new Error("Failed to create workspace");
      setStep(4);
    } catch {
      setCreateError("Could not create your workspace. Please try again.");
    } finally {
      setCreatingWorkspace(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)] flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-md bg-[oklch(0.72_0.16_240)] flex items-center justify-center">
            <span className="text-sm font-bold text-[oklch(0.13_0_0)]">T</span>
          </div>
          <span className="font-semibold text-base tracking-tight text-[oklch(0.95_0_0)]">Tower</span>
        </div>

        <div className="bg-[oklch(0.15_0_0)] border border-[oklch(0.22_0_0)] rounded-xl p-8">
          {step !== 4 && <StepDots current={step} total={4} />}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h1 className="text-xl font-bold text-[oklch(0.95_0_0)] mb-1">Tell us about your product</h1>
              <p className="text-sm text-[oklch(0.55_0_0)] mb-6">
                We&apos;ll analyze your website and find your key competitors automatically.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                    Your website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourproduct.com"
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full"
                  />
                </div>

                {analyzeError && (
                  <div className="p-3 rounded-lg bg-[oklch(0.60_0.20_25/0.1)] border border-[oklch(0.60_0.20_25/0.3)]">
                    <p className="text-xs text-[oklch(0.72_0.15_25)]">{analyzeError}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!url.trim() || analyzingUrl}
                  className="bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors disabled:opacity-50 w-full"
                >
                  {analyzingUrl ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[oklch(0.13_0_0/0.3)] border-t-[oklch(0.13_0_0)] animate-spin" />
                      Analyzing your product...
                    </span>
                  ) : (
                    "Continue →"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h1 className="text-xl font-bold text-[oklch(0.95_0_0)] mb-1">
                {businessInfo?.businessSummary ? "Here's what we found" : "Tell us about your product"}
              </h1>
              <p className="text-sm text-[oklch(0.55_0_0)] mb-6">
                {analyzeError
                  ? analyzeError
                  : "Review and edit the summary before we find your competitors."}
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)]">
                    <p className="text-[10px] font-mono text-[oklch(0.45_0_0)] mb-0.5">INDUSTRY</p>
                    <p className="text-sm text-[oklch(0.80_0_0)]">{businessInfo?.industry}</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)]">
                    <p className="text-[10px] font-mono text-[oklch(0.45_0_0)] mb-0.5">PRODUCT TYPE</p>
                    <p className="text-sm text-[oklch(0.80_0_0)]">{businessInfo?.productType}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                    Business summary
                  </label>
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={4}
                    placeholder="Describe what your product does and who it's for. e.g. 'We help sales teams track competitor pricing and product changes in real time.'"
                    className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full resize-none"
                  />
                </div>

                {competitorsError && (
                  <div className="p-3 rounded-lg bg-[oklch(0.60_0.20_25/0.1)] border border-[oklch(0.60_0.20_25/0.3)]">
                    <p className="text-xs text-[oklch(0.72_0.15_25)]">{competitorsError}</p>
                  </div>
                )}

                <button
                  onClick={handleFindCompetitors}
                  disabled={findingCompetitors}
                  className="bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors disabled:opacity-50 w-full"
                >
                  {findingCompetitors ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[oklch(0.13_0_0/0.3)] border-t-[oklch(0.13_0_0)] animate-spin" />
                      Discovering competitors...
                    </span>
                  ) : (
                    "Looks right, find my competitors →"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h1 className="text-xl font-bold text-[oklch(0.95_0_0)] mb-1">Your competitors</h1>
              <p className="text-sm text-[oklch(0.55_0_0)] mb-4">
                {competitors.length === 1 && competitors[0].domain === "example.com"
                  ? "Add the competitors you want to track below."
                  : "Select which ones to track. Add more with the form below."}
              </p>

              <div className="space-y-2 mb-5 max-h-96 overflow-y-auto pr-1">
                {competitors.filter(c => c.domain !== "example.com").map((comp) => (
                  <label
                    key={comp.domain}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCompetitors.has(comp.domain)
                        ? "border-[oklch(0.72_0.16_240/0.4)] bg-[oklch(0.72_0.16_240/0.05)]"
                        : "border-[oklch(0.22_0_0)] bg-[oklch(0.18_0_0)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompetitors.has(comp.domain)}
                      onChange={() => toggleCompetitor(comp.domain)}
                      className="mt-0.5 accent-[oklch(0.72_0.16_240)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[oklch(0.85_0_0)]">{comp.name}</span>
                        <span className="text-xs font-mono text-[oklch(0.45_0_0)]">{comp.domain}</span>
                      </div>
                      <p className="text-xs text-[oklch(0.50_0_0)] mt-0.5 truncate">{comp.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add manually */}
              <div className="p-4 rounded-lg border border-[oklch(0.22_0_0)] bg-[oklch(0.18_0_0)] mb-4">
                <p className="text-xs font-medium text-[oklch(0.55_0_0)] mb-3">Add manually</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Company name"
                    className="bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2 text-xs text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] flex-1"
                  />
                  <input
                    type="text"
                    value={manualDomain}
                    onChange={(e) => setManualDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualCompetitor()}
                    placeholder="domain.com"
                    className="bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2 text-xs text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] flex-1"
                  />
                  <button
                    onClick={addManualCompetitor}
                    disabled={!manualName.trim() || !manualDomain.trim()}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-[oklch(0.22_0_0)] text-[oklch(0.70_0_0)] hover:bg-[oklch(0.28_0_0)] transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-[oklch(0.60_0.20_25/0.1)] border border-[oklch(0.60_0.20_25/0.3)] mb-3">
                  <p className="text-xs text-[oklch(0.72_0.15_25)]">{createError}</p>
                </div>
              )}

              <button
                onClick={handleCreateWorkspace}
                disabled={creatingWorkspace}
                className="bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors disabled:opacity-50 w-full"
              >
                {creatingWorkspace ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[oklch(0.13_0_0/0.3)] border-t-[oklch(0.13_0_0)] animate-spin" />
                    Creating your workspace...
                  </span>
                ) : (
                  `Set up my dashboard → (${selectedCompetitors.size} selected)`
                )}
              </button>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="text-center py-4">
              {/* Animated checkmark */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[oklch(0.71_0.22_145/0.1)] border border-[oklch(0.71_0.22_145/0.3)] flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[oklch(0.71_0.22_145)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "drawCheck 0.4s ease-out forwards" }}
                  >
                    <style>{`
                      @keyframes drawCheck {
                        from { stroke-dashoffset: 30; opacity: 0; }
                        to { stroke-dashoffset: 0; opacity: 1; }
                      }
                      .check-path { stroke-dasharray: 30; stroke-dashoffset: 30; animation: drawCheck 0.4s 0.1s ease-out forwards; opacity: 0; }
                    `}</style>
                    <polyline className="check-path" points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[oklch(0.95_0_0)] mb-2">You&apos;re all set!</h1>
              <p className="text-sm text-[oklch(0.55_0_0)] mb-8 max-w-xs mx-auto">
                Your competitive intelligence dashboard is ready. Start tracking signals from your competitors.
              </p>

              <button
                onClick={() => router.push("/watchlists")}
                className="bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors"
              >
                Open Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
