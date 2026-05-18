"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export function AddCompetitorModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !domain.trim()) return;
    setSaving(true);
    setError("");
    try {
      const watchlistId = window.location.pathname.split("/watchlists/")[1]?.split("/")[0];
      if (!watchlistId) throw new Error("No watchlist ID");
      const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, "");
      const res = await fetch(`/api/watchlists/${watchlistId}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), domain: cleanDomain }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      setName("");
      setDomain("");
      window.location.reload();
    } catch {
      setError("Could not add competitor. Try again.");
    } finally {
      setSaving(false);
    }
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
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
                  placeholder="e.g. HubSpot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2.5 text-sm text-[oklch(0.90_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
                />
              </div>
              <div>
                <label className="text-xs text-[oklch(0.55_0_0)] font-mono uppercase mb-1.5 block">Domain</label>
                <input
                  type="text"
                  placeholder="hubspot.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2.5 text-sm text-[oklch(0.90_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)]"
                />
              </div>
              {error && <p className="text-xs text-[oklch(0.68_0.24_25)]">{error}</p>}
              <button
                onClick={handleAdd}
                disabled={!name.trim() || !domain.trim() || saving}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)] transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Competitor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
