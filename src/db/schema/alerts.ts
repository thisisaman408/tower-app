import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { diffs } from "./diffs";
import { watchlists } from "./watchlists";

export const alertStatusEnum = pgEnum("alert_status", [
  "pending", "delivered", "failed", "deduped"
]);

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchlistId: uuid("watchlist_id").references(() => watchlists.id).notNull(),
  diffId: uuid("diff_id").references(() => diffs.id).notNull(),
  channel: text("channel").notNull(),
  status: alertStatusEnum("status").notNull().default("pending"),
  payload: jsonb("payload").notNull(),
  attempts: jsonb("attempts").$type<Array<{ at: string; error?: string }>>().default([]),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("alerts_watchlist_idx").on(t.watchlistId),
  index("alerts_status_idx").on(t.status),
]);
