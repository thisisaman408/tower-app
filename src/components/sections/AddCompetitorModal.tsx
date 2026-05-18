"use client";
import { useState } from "react";
import { Plus, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AddCompetitorModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !domain.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
    setName("");
    setDomain("");
    toast.success(`${name} added to watchlist`, {
      description: "Tower will scan them on the next daily run.",
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] font-semibold hover:bg-[oklch(0.78_0.16_240)] transition-colors"
      >
        <Plus size={12} />
        Add Competitor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[oklch(0.28_0_0)] bg-[oklch(0.17_0_0)] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Add Competitor</h2>
              <button onClick={() => setOpen(false)} className="text-[oklch(0.40_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[oklch(0.55_0_0)] font-mono uppercase mb-1.5 block">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Salesforce"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2.5 text-sm text-[oklch(0.90_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
                />
              </div>
              <div>
                <label className="text-xs text-[oklch(0.55_0_0)] font-mono uppercase mb-1.5 block">Domain</label>
                <div className="relative">
                  <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(0.40_0_0)]" />
                  <input
                    type="text"
                    placeholder="salesforce.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg pl-8 pr-3 py-2.5 text-sm text-[oklch(0.90_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[oklch(0.55_0_0)] font-mono uppercase mb-2 block">Pages to track</label>
                <div className="flex flex-wrap gap-1.5">
                  {["pricing", "careers", "blog", "changelog", "homepage"].map((p) => (
                    <span key={p} className="text-[10px] font-mono px-2 py-1 rounded bg-[oklch(0.72_0.16_240/0.1)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-[oklch(0.55_0_0)] hover:text-[oklch(0.75_0_0)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim() || !domain.trim() || saving}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                  name.trim() && domain.trim()
                    ? "bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)]"
                    : "bg-[oklch(0.20_0_0)] text-[oklch(0.38_0_0)] cursor-not-allowed"
                )}
              >
                {saving ? "Adding..." : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
