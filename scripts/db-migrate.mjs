/**
 * Applies SQL files in supabase/migrations/ against DIRECT_URL (port 5432).
 * Usage: npm run db:migrate
 * Requires .env.local with DIRECT_URL (or DATABASE_URL as fallback).
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

config({ path: path.join(root, ".env.local") });
config({ path: path.join(root, ".env") });

// Prefer direct (5432) for DDL; pooler (6543) often works when db.* host does not resolve.
const conn =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL;

if (!conn) {
  console.error(
    "Missing DIRECT_URL or DATABASE_URL in .env.local (see .env.example).",
  );
  process.exit(1);
}

const migrationsDir = path.join(root, "supabase", "migrations");
const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (!files.length) {
  console.error("No migration files found in", migrationsDir);
  process.exit(1);
}

const { Client } = pg;
const client = new Client({
  connectionString: conn,
  ssl: conn.includes("localhost") ? false : { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected. Running", files.length, "migration(s)…");

for (const file of files) {
  const full = path.join(migrationsDir, file);
  const sql = await readFile(full, "utf8");
  console.log("→", file);
  await client.query(sql);
}

await client.end();
console.log("Done.");
