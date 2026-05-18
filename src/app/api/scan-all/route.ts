import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { genai, GEMINI_FLASH } from "@/lib/gemini";
import { sendAlertEmail } from "@/app/api/notify/route";

async function scanCompetitor(name: string, domain: string): Promise<{ signals: Array<{ title: string; summary: string; impact: number; type: string }> }> {
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
    return JSON.parse(match[0]) as { signals: Array<{ title: string; summary: string; impact: number; type: string }> };
  } catch { return { signals: [] }; }
}

function buildEmailHtml(results: Array<{ name: string; domain: string; signals: Array<{ title: string; summary: string; impact: number; type: string }> }>) {
  const high = results.flatMap(r => r.signals.filter(s => s.impact >= 70).map(s => ({ ...s, company: r.name })));
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;max-width:600px;margin:0 auto">
<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;margin-bottom:16px">
  <h1 style="color:#4da6ff;font-size:20px;margin:0 0 4px">⚡ Tower Daily Scan</h1>
  <p style="color:#666;font-size:13px;margin:0">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
</div>
${high.length > 0 ? `
<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:16px">
  <h2 style="color:#ff6b6b;font-size:14px;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em">🔴 High Impact Signals</h2>
  ${high.map(s => `<div style="border-bottom:1px solid #2a2a2a;padding:12px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <span style="font-weight:600;color:#e0e0e0;font-size:14px">${s.company} · ${s.title}</span>
      <span style="background:#ff6b6b22;color:#ff6b6b;border-radius:4px;padding:2px 8px;font-size:11px;font-family:monospace">${s.impact}</span>
    </div>
    <p style="color:#888;font-size:13px;margin:0">${s.summary}</p>
  </div>`).join("")}
</div>` : ""}
${results.map(r => r.signals.length > 0 ? `
<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:12px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <img src="https://logo.clearbit.com/${r.domain}" width="28" height="28" style="border-radius:6px" onerror="this.style.display='none'">
    <h3 style="color:#4da6ff;font-size:15px;margin:0">${r.name}</h3>
  </div>
  ${r.signals.map(s => `<div style="padding:8px 0;border-bottom:1px solid #222">
    <span style="font-size:13px;color:#ccc;font-weight:500">${s.title}</span>
    <p style="color:#777;font-size:12px;margin:4px 0 0">${s.summary}</p>
  </div>`).join("")}
</div>` : "").join("")}
<p style="color:#444;font-size:11px;text-align:center;margin-top:24px">Sent by Tower · <a href="https://tower-app-peach.vercel.app" style="color:#4da6ff">Open Dashboard</a></p>
</body></html>`;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userWatchlists = await db.select().from(watchlists).where(eq(watchlists.ownerId, session.user.id));
  if (!userWatchlists.length) return NextResponse.json({ error: "No watchlists" }, { status: 400 });

  const allCompetitors = await db.select().from(competitors).where(eq(competitors.watchlistId, userWatchlists[0].id));
  if (!allCompetitors.length) return NextResponse.json({ error: "No competitors" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  const emailTo = user?.alertEmail ?? session.user.email;

  // Scan up to 5 competitors (rate limit friendly)
  const toScan = allCompetitors.slice(0, 5);
  const results = await Promise.all(
    toScan.map(async (c) => ({ name: c.name, domain: c.domain, ...(await scanCompetitor(c.name, c.domain)) }))
  );

  const totalSignals = results.reduce((n, r) => n + r.signals.length, 0);
  const highImpact = results.reduce((n, r) => n + r.signals.filter(s => s.impact >= 70).length, 0);

  if (totalSignals > 0 && emailTo) {
    const html = buildEmailHtml(results);
    await sendAlertEmail(emailTo, `Tower: ${highImpact} high-impact signals found across ${toScan.length} competitors`, html);
  }

  return NextResponse.json({ scanned: toScan.length, totalSignals, highImpact, emailSent: !!emailTo });
}
