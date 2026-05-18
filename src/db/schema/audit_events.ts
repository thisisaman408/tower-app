import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  subjectKind: text("subject_kind"),
  subjectId: text("subject_id"),
  metadata: jsonb("metadata"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (t) => [
  index("audit_actor_idx").on(t.actor),
  index("audit_action_idx").on(t.action),
  index("audit_occurred_at_idx").on(t.occurredAt),
]);
