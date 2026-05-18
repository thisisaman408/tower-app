import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { dailyCompetitorScan, weeklyBriefGeneration, highSignalAlert } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyCompetitorScan, weeklyBriefGeneration, highSignalAlert],
});
