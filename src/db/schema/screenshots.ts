import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { scans } from "./scans";

export const screenshots = pgTable("screenshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id").references(() => scans.id, { onDelete: "cascade" }).notNull(),
  blobUrl: text("blob_url").notNull(),
  sha256: text("sha256").notNull(),
  widthPx: integer("width_px"),
  heightPx: integer("height_px"),
  bytes: integer("bytes"),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
}, (t) => [
  index("screenshots_scan_idx").on(t.scanId),
  index("screenshots_sha256_idx").on(t.sha256),
]);
