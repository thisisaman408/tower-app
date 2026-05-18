import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function BriefsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/");
  }

  const [watchlist] = await db
    .select()
    .from(watchlists)
    .where(eq(watchlists.ownerId, session.user.id))
    .limit(1);

  if (!watchlist) {
    redirect("/watchlists");
  }

  redirect(`/briefs/${watchlist.id}`);
}
