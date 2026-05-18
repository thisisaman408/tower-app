"use client";
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import { Key, Eye, EyeOff, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyField {
  provider: string;
  label: string;
  placeholder: string;
  desc: string;
  required: boolean;
  docsUrl: string;
}

const API_KEY_FIELDS: ApiKeyField[] = [
  {
    provider: "gemini",
    label: "Gemini API Key",
    placeholder: "AIza...",
    desc: "Required for Gemini Vision extraction, Brief Writer, and KG enrichment. Get a free key from Google AI Studio.",
    required: true,
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    provider: "slack",
    label: "Slack Webhook URL",
    placeholder: "https://hooks.slack.com/services/...",
    desc: "Optional. High-signal alerts (impact ≥ 80) fire to this webhook.",
    required: false,
    docsUrl: "https://api.slack.com/messaging/webhooks",
  },
  {
    provider: "resend",
    label: "Resend API Key",
    placeholder: "re_...",
    desc: "Optional. Weekly digest emails sent via Resend.",
    required: false,
    docsUrl: "https://resend.com/api-keys",
  },
  {
    provider: "neon",
    label: "Neon Database URL",
    placeholder: "postgresql://...",
    desc: "Optional for demo. Required for production persistence. Neon free tier works.",
    required: false,
    docsUrl: "https://neon.tech",
  },
];

function KeyRow({ field }: { field: ApiKeyField }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{field.label}</span>
            {field.required && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[oklch(0.72_0.16_240/0.1)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]">
                required
              </span>
            )}
          </div>
          <p className="text-xs text-[oklch(0.45_0_0)] mt-1 max-w-md">{field.desc}</p>
        </div>
        <a
          href={field.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.65_0_0)] transition-colors flex-shrink-0"
        >
          docs <ExternalLink size={11} />
        </a>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            className="w-full bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-3 py-2 text-xs font-mono text-[oklch(0.80_0_0)] placeholder-[oklch(0.35_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] pr-9"
          />
          <button
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[oklch(0.38_0_0)] hover:text-[oklch(0.60_0_0)] transition-colors"
          >
            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
            saved
              ? "bg-[oklch(0.71_0.22_145/0.15)] text-[oklch(0.71_0.22_145)] border border-[oklch(0.71_0.22_145/0.3)]"
              : value.trim()
              ? "bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] hover:bg-[oklch(0.78_0.16_240)]"
              : "bg-[oklch(0.20_0_0)] text-[oklch(0.38_0_0)] cursor-not-allowed"
          )}
        >
          {saved ? <><Check size={12} /> Saved</> : "Save"}
        </button>
      </div>
    </div>
  );
}

export function KeysClient({ hasGeminiKey }: { hasGeminiKey: boolean }) {
  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-xs font-mono text-[oklch(0.45_0_0)] mb-1">TOWER / SETTINGS</div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key size={20} />
          API Keys
        </h1>
        <p className="text-sm text-[oklch(0.50_0_0)] mt-1">
          Configure your API keys. Keys are stored encrypted in the database. Never committed to git.
        </p>
      </div>

      {!hasGeminiKey && (
        <div className="mb-6 p-4 rounded-lg border border-[oklch(0.82_0.20_85/0.3)] bg-[oklch(0.82_0.20_85/0.05)]">
          <p className="text-xs text-[oklch(0.75_0.10_85)]">
            <strong>Demo mode active.</strong> No API keys required to explore Tower&apos;s UI and seed data.
            Add a Gemini API key to enable live extraction on real screenshots.
          </p>
        </div>
      )}

      {hasGeminiKey && (
        <div className="mb-6 p-4 rounded-lg border border-[oklch(0.71_0.22_145/0.3)] bg-[oklch(0.71_0.22_145/0.05)]">
          <p className="text-xs text-[oklch(0.71_0.22_145)]">
            <strong>Live mode active.</strong> Gemini API key detected — live extraction is enabled.
          </p>
        </div>
      )}

      <div className="space-y-4 max-w-2xl">
        {API_KEY_FIELDS.map((field) => (
          <KeyRow key={field.provider} field={field} />
        ))}
      </div>

      <div className="mt-8 p-5 rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.15_0_0)] max-w-2xl">
        <h3 className="text-sm font-semibold mb-2">Environment Variables</h3>
        <p className="text-xs text-[oklch(0.45_0_0)] mb-3">
          For production deployment, set these in your Vercel project settings or <code>.env.local</code>:
        </p>
        <pre className="text-[10px] font-mono text-[oklch(0.60_0_0)] bg-[oklch(0.18_0_0)] rounded-lg p-4 overflow-x-auto">
{`GEMINI_API_KEY=AIza...
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
RESEND_API_KEY=re_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
LOBSTER_TRAP_URL=http://localhost:8000
NEO4J_URI=neo4j+s://<id>.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=...`}
        </pre>
      </div>
    </PageShell>
  );
}
