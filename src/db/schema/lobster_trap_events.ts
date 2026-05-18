import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";

export const lobsterActionEnum = pgEnum("lobster_action", [
  "ALLOW", "DENY", "LOG", "HUMAN_REVIEW", "QUARANTINE", "RATE_LIMIT"
]);

export const lobsterTrapEvents = pgTable("lobster_trap_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: text("request_id").notNull(),
  policyId: text("policy_id").notNull(),
  policyRevision: text("policy_revision").notNull(),
  action: lobsterActionEnum("action").notNull(),
  declaredIntent: text("declared_intent"),
  detectedIntent: text("detected_intent"),
  payloadRedacted: jsonb("payload_redacted"),
  evidence: jsonb("evidence"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (t) => [
  index("lobster_request_idx").on(t.requestId),
  index("lobster_policy_idx").on(t.policyId),
  index("lobster_action_idx").on(t.action),
  index("lobster_occurred_at_idx").on(t.occurredAt),
]);
