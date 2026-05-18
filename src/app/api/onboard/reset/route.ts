import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, watchlists, competitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete existing watchlists (cascades to competitors)
  const userWatchlists = await db.select({ id: watchlists.id })
    .from(watchlists).where(eq(watchlists.ownerId, session.user.id));

  for (const wl of userWatchlists) {
    await db.delete(competitors).where(eq(competitors.watchlistId, wl.id));
    await db.delete(watchlists).where(eq(watchlists.id, wl.id));
  }

  // Reset onboarding flag
  await db.update(users)
    .set({ onboardingComplete: false, websiteUrl: null, businessSummary: null })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
