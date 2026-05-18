import { pgTable, uuid, text, timestamp, real, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { competitors } from "./competitors";
import { signals } from "./signals";

export const diffKindEnum = pgEnum("diff_kind", ["added", "removed", "changed"]);

export const diffs = pgTable("diffs", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitorId: uuid("competitor_id").references(() => competitors.id).notNull(),
  kind: diffKindEnum("kind").notNull(),
  beforeSignalId: uuid("before_signal_id").references(() => signals.id),
  afterSignalId: uuid("after_signal_id").references(() => signals.id),
  impact: real("impact").notNull(),
  summary: text("summary").notNull(),
  details: jsonb("details"),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("diffs_competitor_idx").on(t.competitorId),
  index("diffs_week_idx").on(t.weekStart, t.weekEnd),
  index("diffs_impact_idx").on(t.impact),
]);
