import { type GetFunctionInput } from "inngest";
import { inngest } from "./client";
import { DEMO_COMPETITORS } from "@/lib/seed-data";

type FnCtx = GetFunctionInput<typeof inngest>;

export const dailyCompetitorScan = inngest.createFunction(
  {
    id: "daily-competitor-scan",
    name: "Daily Competitor Scan",
    triggers: [{ cron: "0 6 * * *" }],
  },
  async ({ step, logger }: FnCtx) => {
    logger.info("Starting daily competitor scan");

    const results = await step.run("scan-all-competitors", async () => {
      const competitors = DEMO_COMPETITORS;
      const scans: Array<{
        competitorId: string;
        competitorName: string;
        domain: string;
        pageType: string;
        status: string;
        queuedAt: string;
      }> = [];

      for (const competitor of competitors) {
        const pageTypes = ["pricing", "careers", "blog", "changelog"];
        for (const pageType of pageTypes) {
          scans.push({
            competitorId: competitor.id,
            competitorName: competitor.name,
            domain: competitor.domain,
            pageType,
            status: "queued",
            queuedAt: new Date().toISOString(),
          });
        }
      }
      return scans;
    });

    logger.info(`Queued ${results.length} scans`);

    await step.sleep("wait-between-batches", "5s");

    const extractionResults = await step.run("extract-signals", async () => {
      return results.map((scan) => ({
        ...scan,
        status: "succeeded",
        signalCount: Math.floor(Math.random() * 8) + 1,
        finishedAt: new Date().toISOString(),
      }));
    });

    await step.run("run-diff-engine", async () => {
      const highImpactDiffs = extractionResults
        .filter(() => Math.random() > 0.8)
        .map((r) => ({
          competitorId: r.competitorId,
          impact: Math.floor(Math.random() * 40) + 60,
          summary: `New signal detected for ${r.competitorName} on ${r.pageType}`,
        }));
      return highImpactDiffs;
    });

    return { scansQueued: results.length, completedAt: new Date().toISOString() };
  }
);

export const weeklyBriefGeneration = inngest.createFunction(
  {
    id: "weekly-brief-generation",
    name: "Weekly Brief Generation",
    triggers: [{ cron: "0 22 * * 0" }],
  },
  async ({ step, logger }: FnCtx) => {
    logger.info("Generating weekly briefs");

    const brief = await step.run("generate-brief", async () => {
      return {
        watchlistId: "wl-demo-001",
        watchlistName: "Modern GTM Stack",
        weekStart: new Date(Date.now() - 7 * 86400000).toISOString(),
        weekEnd: new Date().toISOString(),
        status: "generated",
        generatedAt: new Date().toISOString(),
      };
    });

    await step.run("dispatch-digest", async () => {
      logger.info(`Dispatching weekly digest for watchlist ${brief.watchlistId}`);
      return { dispatched: true };
    });

    return brief;
  }
);

export const highSignalAlert = inngest.createFunction(
  {
    id: "high-signal-alert",
    name: "High Signal Alert",
    triggers: [{ event: "tower/diff.high-impact" }],
  },
  async ({ event, step, logger }: FnCtx) => {
    const { diffId, impact, competitorName, summary, channels } = event.data as {
      diffId: string;
      impact: number;
      competitorName: string;
      summary: string;
      channels: string[];
    };

    logger.info(`High impact diff: ${competitorName} impact=${impact}`);

    if (channels.includes("slack")) {
      await step.run("dispatch-slack", async () => {
        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (!webhookUrl) return { skipped: true, reason: "no webhook configured" };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *${competitorName}* — impact ${impact}/100\n${summary}`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Tower Alert* · \`impact ${impact}\`\n*${competitorName}* — ${summary}`,
                },
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "View Diff" },
                    url: `https://tower-demo.vercel.app/watchlists/wl-demo-001/diffs/${diffId}`,
                  },
                ],
              },
            ],
          }),
        });

        return { delivered: true };
      });
    }

    return { alertId: `alert-${Date.now()}`, diffId, delivered: true };
  }
);
