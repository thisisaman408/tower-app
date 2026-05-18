import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export type AlertChannel =
  | { kind: "slack"; webhookUrl: string }
  | { kind: "email"; email: string }
  | { kind: "webhook"; url: string };

export const watchlists = pgTable("watchlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  alertChannels: jsonb("alert_channels").$type<AlertChannel[]>().default([]),
  briefPromptOverride: text("brief_prompt_override"),
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("watchlists_owner_idx").on(t.ownerId),
]);
