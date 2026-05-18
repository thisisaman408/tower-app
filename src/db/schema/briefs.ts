import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { watchlists } from "./watchlists";

export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchlistId: uuid("watchlist_id").references(() => watchlists.id, { onDelete: "cascade" }).notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  markdown: text("markdown").notNull(),
  title: text("title"),
  tldr: text("tldr"),
  pullQuote: text("pull_quote"),
  citations: jsonb("citations").$type<Array<{ diffId: string; signalId: string; paragraphIndex: number }>>().default([]),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("briefs_watchlist_idx").on(t.watchlistId),
  index("briefs_week_idx").on(t.weekStart, t.weekEnd),
]);
