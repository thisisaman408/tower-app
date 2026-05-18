import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { watchlists, competitors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [wl] = await db.select()
    .from(watchlists)
    .where(and(eq(watchlists.id, id), eq(watchlists.ownerId, session.user.id)));

  if (!wl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comps = await db.select()
    .from(competitors)
    .where(eq(competitors.watchlistId, id));

  return NextResponse.json({
    id: wl.id,
    name: wl.name,
    description: wl.description,
    competitors: comps.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      logoUrl: c.logoUrl,
    })),
  });
}
