import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { readFileSync } from "fs";
import { resolve } from "path";

function getEnvVar(key: string) {
  const v = process.env[key] ?? "";
  if (v && !v.includes("/") && v.length > 8) return v;
  try {
    const env = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    return env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() ?? v;
  } catch { return v; }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { alertEmail, scanScheduleHour } = await req.json() as {
    alertEmail?: string;
    scanScheduleHour?: string;
  };

  await db.update(users)
    .set({
      alertEmail: alertEmail ?? session.user.email,
      scanScheduleHour: scanScheduleHour ?? "08",
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ resendConfigured: !!getEnvVar("RESEND_API_KEY") });
}

export async function sendAlertEmail(to: string, subject: string, html: string) {
  const apiKey = getEnvVar("RESEND_API_KEY");
  if (!apiKey) return { error: "No Resend API key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Tower <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    return res.ok ? { success: true } : { error: await res.text() };
  } catch (err) {
    return { error: String(err) };
  }
}
