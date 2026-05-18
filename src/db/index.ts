import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as schema from "./schema";

function readEnvFile(): Record<string, string> {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    return Object.fromEntries(
      content.split("\n")
        .filter((l) => l.includes("=") && !l.startsWith("#"))
        .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    );
  } catch { return {}; }
}

function getDb() {
  // Shell env from another project may pollute DATABASE_URL — fall back to .env file
  let url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    url = readEnvFile()["DATABASE_URL"] ?? "";
  }
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = neon(url);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    if (!_db) _db = getDb();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { schema };
