import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { competitors } from "./competitors";

export const pageTypeEnum = pgEnum("page_type", [
  "pricing", "careers", "blog", "changelog",
  "social_linkedin", "social_twitter", "homepage",
  "docs", "case_studies", "dashboard"
]);

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitorId: uuid("competitor_id").references(() => competitors.id, { onDelete: "cascade" }).notNull(),
  pageType: pageTypeEnum("page_type").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("pages_competitor_idx").on(t.competitorId),
]);
