import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // Onboarding
  websiteUrl: text("website_url"),
  businessSummary: text("business_summary"),
  industry: text("industry"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});
