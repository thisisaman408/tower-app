import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists, competitors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genai, GEMINI_FLASH } from "@/lib/gemini";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

  // Get user context (their industry + existing competitors)
  let userContext = "";
  let existingCompetitors: string[] = [];
  if (session?.user?.id) {
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    const userWatchlists = await db.select().from(watchlists).where(eq(watchlists.ownerId, session.user.id));
    if (userWatchlists.length) {
      const comps = await db.select().from(competitors).where(eq(competitors.watchlistId, userWatchlists[0].id));
      existingCompetitors = comps.map(c => `${c.name} (${c.domain})`);
    }
    if (user?.businessSummary) userContext = `User's product: ${user.businessSummary}`;
    if (user?.industry) userContext += ` | Industry: ${user.industry}`;
  }

  const domain = (() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })();

  const prompt = `Analyze this URL and determine if it's a competitor.

URL: ${url}
Domain: ${domain}
${userContext ? `\nContext about the user:\n${userContext}` : ""}
${existingCompetitors.length ? `\nUser already tracks these competitors:\n${existingCompetitors.join(", ")}` : ""}

Based on your knowledge of ${domain}, answer:
1. What company/product is this?
2. Is it a direct or adjacent competitor to the user's product?
3. Why or why not?

Return ONLY valid JSON:
{
  "companyName": "Company name",
  "isCompetitor": true or false,
  "reason": "2-3 sentences explaining why this is or isn't a competitor",
  "suggestion": ${existingCompetitors.length ? '"Add to watchlist" or "Already tracked" or "Not worth tracking"' : '"Add to watchlist to track" or "Not a competitor"'},
  "confidence": 0.0-1.0
}`;

  try {
    const result = await genai.models.generateContent({
      model: GEMINI_FLASH,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.1, maxOutputTokens: 512 },
    });
    const raw = result.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON");
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json({
      companyName: domain,
      isCompetitor: false,
      reason: "Could not analyze this URL. Try extracting a specific page like /pricing.",
      suggestion: "Try again with a more specific URL",
      confidence: 0,
    });
  }
}
