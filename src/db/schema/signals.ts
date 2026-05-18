import { pgTable, uuid, text, timestamp, real, jsonb, index, pgEnum, customType } from "drizzle-orm/pg-core";

const vector = customType<{ data: number[]; driverData: string }>({
  dataType(config) {
    return `vector(${(config as { dimensions?: number }).dimensions ?? 768})`;
  },
  fromDriver(value: string): number[] {
    return value.replace(/[\[\]]/g, "").split(",").map(Number);
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});
import { competitors } from "./competitors";
import { screenshots } from "./screenshots";

export const signalTypeEnum = pgEnum("signal_type", [
  "pricing_tier", "feature_change", "hiring_role", "headcount_metric",
  "blog_post", "release_note", "partnership", "customer_win",
  "funding_round", "leadership_change", "case_study", "product_launch"
]);

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitorId: uuid("competitor_id").references(() => competitors.id).notNull(),
  screenshotId: uuid("screenshot_id").references(() => screenshots.id).notNull(),
  type: signalTypeEnum("type").notNull(),
  payload: jsonb("payload").notNull(),
  rawQuote: text("raw_quote").notNull(),
  boundingBox: jsonb("bounding_box"),
  confidence: real("confidence").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
  capturedAt: timestamp("captured_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("signals_competitor_idx").on(t.competitorId),
  index("signals_type_idx").on(t.type),
  index("signals_captured_at_idx").on(t.capturedAt),
]);
