import { pgTable, uuid, timestamp, pgEnum, index, jsonb } from "drizzle-orm/pg-core";
import { competitors } from "./competitors";
import { pages } from "./pages";

export const scanStatusEnum = pgEnum("scan_status", [
  "queued", "running", "succeeded", "failed", "quarantined"
]);

export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitorId: uuid("competitor_id").references(() => competitors.id).notNull(),
  pageId: uuid("page_id").references(() => pages.id).notNull(),
  status: scanStatusEnum("status").notNull().default("queued"),
  error: jsonb("error"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("scans_page_idx").on(t.pageId),
  index("scans_status_idx").on(t.status),
  index("scans_created_at_idx").on(t.createdAt),
]);
