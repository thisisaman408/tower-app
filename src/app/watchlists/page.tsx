import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function WatchlistsIndex() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userWatchlists = await db.select()
    .from(watchlists)
    .where(eq(watchlists.ownerId, session.user.id))
    .limit(1);

  if (userWatchlists.length === 0) redirect("/onboarding");
  redirect(`/watchlists/${userWatchlists[0].id}`);
}
