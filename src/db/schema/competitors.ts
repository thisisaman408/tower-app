import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { watchlists } from "./watchlists";

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchlistId: uuid("watchlist_id").references(() => watchlists.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("competitors_watchlist_idx").on(t.watchlistId),
  index("competitors_domain_idx").on(t.domain),
]);
