import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists, competitors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const [wl] = await db.select().from(watchlists)
    .where(and(eq(watchlists.id, id), eq(watchlists.ownerId, session.user.id)));
  if (!wl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, domain } = await req.json() as { name: string; domain: string };
  if (!name || !domain) return NextResponse.json({ error: "name and domain required" }, { status: 400 });

  const [comp] = await db.insert(competitors).values({
    watchlistId: id,
    name,
    domain,
    logoUrl: `https://logo.clearbit.com/${domain}`,
  }).returning();

  return NextResponse.json(comp);
}
