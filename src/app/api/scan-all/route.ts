import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { genai, GEMINI_FLASH } from "@/lib/gemini";
import { readFileSync } from "fs";
import { resolve } from "path";

function getResendKey() {
  const v = process.env.RESEND_API_KEY ?? "";
  if (v.startsWith("re_")) return v;
  try {
    const env = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    return env.match(/RESEND_API_KEY=(.+)/)?.[1]?.trim() ?? "";
  } catch { return ""; }
}

type Signal = { title: string; summary: string; impact: number; type: string };
type ScanResult = { name: string; domain: string; signals: Signal[] };

async function scanCompetitor(name: string, domain: string): Promise<{ signals: Signal[] }> {
  try {
    const resp = await fetch(`https://${domain}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      signal: AbortSignal.timeout(6000),
    });
    const html = await resp.text();
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000);

    const result = await genai.models.generateContent({
      model: GEMINI_FLASH,
      contents: [{ role: "user", parts: [{ text: `Extract top 3-5 competitive signals from ${name} (${domain}).
${text ? `Page content: ${text}` : `Use your knowledge about ${domain}`}
Return JSON only: {"signals":[{"title":"string","summary":"string","impact":0-100,"type":"pricing_tier|product_launch|feature_change|hiring_role"}]}` }] }],
      config: { temperature: 0.1, maxOutputTokens: 1024 },
    });
    const raw = result.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { signals: [] };
    return JSON.parse(match[0]) as { signals: Signal[] };
  } catch { return { signals: [] }; }
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendKey();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Tower <onboarding@resend.dev>", to, subject, html }),
    });
    const body = await res.json() as { id?: string; message?: string };
    if (!res.ok) return { ok: false, error: body.message ?? `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) { return { ok: false, error: String(err) }; }
}

function buildEmailHtml(results: ScanResult[], prevResults: ScanResult[] | null) {
  const high = results.flatMap(r => r.signals.filter(s => s.impact >= 70).map(s => ({ ...s, company: r.name })));

  // Compute diffs if we have previous data
  const newSignals: Array<Signal & { company: string }> = [];
  const unchanged: Array<{ company: string; count: number }> = [];

  if (prevResults) {
    const prevMap = new Map(prevResults.map(r => [r.domain, new Set(r.signals.map(s => s.title))]));
    for (const r of results) {
      const prev = prevMap.get(r.domain) ?? new Set();
      const newSigs = r.signals.filter(s => !prev.has(s.title));
      const sameSigs = r.signals.filter(s => prev.has(s.title));
      newSigs.forEach(s => newSignals.push({ ...s, company: r.name }));
      if (sameSigs.length > 0) unchanged.push({ company: r.name, count: sameSigs.length });
    }
  }

  const hasDiff = prevResults !== null;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:system-ui,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;max-width:600px;margin:0 auto}
  .card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:16px}
  .badge{display:inline-block;border-radius:4px;padding:2px 8px;font-size:11px;font-family:monospace}
  .high{background:#ff444422;color:#ff6666}
  .med{background:#f0a04022;color:#f0a040}
  .low{background:#48c45a22;color:#48c45a}
  </style></head><body>
  <div class="card">
    <h1 style="color:#4da6ff;font-size:20px;margin:0 0 4px">⚡ Tower Daily Scan</h1>
    <p style="color:#666;font-size:13px;margin:0">${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
  </div>

  ${hasDiff && newSignals.length > 0 ? `
  <div class="card" style="border-color:#ff444433">
    <h2 style="color:#ff6666;font-size:14px;margin:0 0 16px">🆕 NEW CHANGES DETECTED</h2>
    ${newSignals.map(s => `<div style="border-bottom:1px solid #2a2a2a;padding:10px 0">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="color:#e0e0e0;font-size:13px">${s.company} · ${s.title}</strong>
        <span class="badge ${s.impact>=70?"high":s.impact>=40?"med":"low"}">${s.impact}</span>
      </div>
      <p style="color:#888;font-size:12px;margin:4px 0 0">${s.summary}</p>
    </div>`).join("")}
  </div>` : hasDiff ? `
  <div class="card" style="border-color:#48c45a33">
    <h2 style="color:#48c45a;font-size:14px;margin:0 0 8px">✅ No Changes Since Last Scan</h2>
    <p style="color:#666;font-size:13px;margin:0">Your competitive landscape is stable. All ${results.length} competitors look the same as last scan.</p>
  </div>` : ""}

  ${high.length > 0 ? `
  <div class="card">
    <h2 style="color:#ff6b6b;font-size:13px;margin:0 0 16px;text-transform:uppercase;letter-spacing:.05em">🔴 High Impact Signals (≥70)</h2>
    ${high.map(s => `<div style="border-bottom:1px solid #2a2a2a;padding:10px 0">
      <div style="display:flex;justify-content:space-between">
        <strong style="font-size:13px">${s.company} · ${s.title}</strong>
        <span class="badge high">${s.impact}</span>
      </div>
      <p style="color:#888;font-size:12px;margin:4px 0 0">${s.summary}</p>
    </div>`).join("")}
  </div>` : ""}

  ${results.filter(r => r.signals.length > 0).map(r => `
  <div class="card">
    <h3 style="color:#4da6ff;font-size:14px;margin:0 0 12px">
      <img src="https://logo.clearbit.com/${r.domain}" width="20" height="20" style="border-radius:4px;vertical-align:middle;margin-right:8px" onerror="this.style.display='none'">
      ${r.name}
    </h3>
    ${r.signals.map(s => `<div style="padding:6px 0;border-bottom:1px solid #222">
      <span style="font-size:12px;color:#ccc">${s.title}</span>
      <p style="color:#666;font-size:11px;margin:2px 0 0">${s.summary}</p>
    </div>`).join("")}
  </div>`).join("")}

  <p style="color:#444;font-size:11px;text-align:center;margin-top:24px">
    Tower · <a href="https://tower-app-peach.vercel.app" style="color:#4da6ff">Open Dashboard</a>
  </p>
  </body></html>`;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return runScanForUser(session.user.id, session.user.email);
}

export async function runScanForUser(userId: string, fallbackEmail: string) {
  const userWatchlists = await db.select().from(watchlists).where(eq(watchlists.ownerId, userId));
  if (!userWatchlists.length) return NextResponse.json({ error: "No watchlists" }, { status: 400 });

  const allCompetitors = await db.select().from(competitors).where(eq(competitors.watchlistId, userWatchlists[0].id));
  if (!allCompetitors.length) return NextResponse.json({ error: "No competitors" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const emailTo = user?.alertEmail ?? fallbackEmail;

  const toScan = allCompetitors.slice(0, 5);
  const results: ScanResult[] = await Promise.all(
    toScan.map(async (c) => ({ name: c.name, domain: c.domain, ...(await scanCompetitor(c.name, c.domain)) }))
  );

  const totalSignals = results.reduce((n, r) => n + r.signals.length, 0);
  const highImpact = results.reduce((n, r) => n + r.signals.filter(s => s.impact >= 70).length, 0);

  // Get previous scan data for diff (stored in business_summary as JSON hack)
  let prevResults: ScanResult[] | null = null;
  try {
    if (user?.businessSummary?.startsWith("[SCAN]")) {
      prevResults = JSON.parse(user.businessSummary.slice(6)) as ScanResult[];
    }
  } catch { /* no prev */ }

  // Store current scan as previous for next time
  await db.update(users)
    .set({ businessSummary: `[SCAN]${JSON.stringify(results)}` })
    .where(eq(users.id, userId))
    .catch(() => null);

  let emailResult: { ok: boolean; error?: string } = { ok: false, error: "No email set" };
  if (emailTo) {
    const newSignalCount = prevResults
      ? results.flatMap(r => { const prev = new Set((prevResults!.find(p => p.domain === r.domain)?.signals ?? []).map(s => s.title)); return r.signals.filter(s => !prev.has(s.title)); }).length
      : totalSignals;

    const subject = prevResults
      ? newSignalCount > 0
        ? `Tower: ${newSignalCount} new changes detected across ${toScan.length} competitors`
        : `Tower: No changes — competitive landscape stable`
      : `Tower: Daily scan complete — ${highImpact} high-impact signals found`;

    const html = buildEmailHtml(results, prevResults);
    emailResult = await sendEmail(emailTo, subject, html);
  }

  return NextResponse.json({
    scanned: toScan.length,
    totalSignals,
    highImpact,
    emailSent: emailResult.ok,
    emailError: emailResult.error,
    emailTo,
  });
}
