import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { runScanForUser } from "@/app/api/scan-all/route";

// Vercel Cron calls this every 15 minutes
// We check which users have their scan scheduled in the current window
export async function GET(req: NextRequest) {
  // Verify this is a legit Vercel cron call
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? "tower-cron-2026"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = String(now.getUTCHours()).padStart(2, "0");
  const currentMin = now.getUTCMinutes();

  // Get all users with a scan schedule set
  const allUsers = await db.select().from(users).where(isNotNull(users.alertEmail));

  const triggered: string[] = [];
  const skipped: string[] = [];

  for (const user of allUsers) {
    if (!user.scanScheduleHour || !user.alertEmail) continue;

    // scanScheduleHour stored as "HH:MM" (24h)
    const [scheduledHour, scheduledMin] = user.scanScheduleHour.split(":").map(Number);

    // Fire if within a 15-minute window of the scheduled time
    const schedMin = (scheduledHour * 60 + (scheduledMin ?? 0));
    const nowMin = (now.getUTCHours() * 60 + currentMin);
    const diff = Math.abs(nowMin - schedMin);

    if (diff <= 7 || diff >= (24 * 60 - 7)) {
      try {
        await runScanForUser(user.id, user.email);
        triggered.push(user.email);
      } catch { skipped.push(user.email); }
    } else {
      skipped.push(`${user.email} (scheduled ${user.scanScheduleHour} UTC, now ${currentHour}:${String(currentMin).padStart(2,"0")})`);
    }
  }

  return NextResponse.json({ triggered, skipped, time: now.toISOString() });
}
