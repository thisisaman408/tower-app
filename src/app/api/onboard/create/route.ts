import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    competitors?: Array<{ name: string; domain: string; description?: string }>;
    selectedCompetitors?: Array<{ name: string; domain: string; description?: string }>;
    businessSummary?: string;
  };
  const selectedCompetitors = body.competitors ?? body.selectedCompetitors ?? [];
  const { businessSummary } = body;

  // Get user data to name the watchlist
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  const watchlistName = user?.businessSummary
    ? `${user.industry ?? "My"} Competitive Landscape`
    : "My Competitors";

  // Create watchlist
  const watchlistId = randomUUID();
  const shareToken = randomUUID().replace(/-/g, "").slice(0, 16);

  await db.insert(watchlists).values({
    id: watchlistId,
    ownerId: session.user.id,
    name: watchlistName,
    description: businessSummary ?? user?.businessSummary ?? null,
    shareToken,
    alertChannels: [],
  });

  // Create competitors
  if (selectedCompetitors.length > 0) {
    await db.insert(competitors).values(
      selectedCompetitors.map((c) => ({
        watchlistId,
        name: c.name,
        domain: c.domain,
        logoUrl: `https://logo.clearbit.com/${c.domain}`,
      }))
    );
  }

  // Mark onboarding complete
  await db.update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ watchlistId, success: true });
}
