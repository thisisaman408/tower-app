import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists, competitors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { writeBrief } from "@/lib/gemini";
import { headers } from "next/headers";

async function generateBrief(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const watchlistId = searchParams.get("watchlistId");
  if (!watchlistId) return NextResponse.json({ error: "watchlistId required" }, { status: 400 });

  const [wl] = await db.select().from(watchlists)
    .where(and(eq(watchlists.id, watchlistId), eq(watchlists.ownerId, session.user.id)));
  if (!wl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comps = await db.select().from(competitors).where(eq(competitors.watchlistId, watchlistId));
  if (!comps.length) {
    return NextResponse.json({
      title: "No competitors yet",
      tldr: "Add competitors to your watchlist to generate a brief.",
      paragraphs: ["Head to your dashboard and add competitors using the '+ Add Competitor' button."],
      pullQuote: "Intelligence begins with knowing who you're up against.",
      citations: [],
    });
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const brief = await writeBrief({
    watchlistName: wl.name,
    competitors: comps.map((c) => `${c.name} (${c.domain})`),
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: now.toISOString().split("T")[0],
    diffs: [],
  });

  return NextResponse.json(brief);
}

export const GET = generateBrief;
export const POST = generateBrief;
