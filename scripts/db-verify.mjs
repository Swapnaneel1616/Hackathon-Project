import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
config({ path: path.join(root, ".env.local") });

const conn = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!conn) {
  console.error("No DATABASE_URL or DIRECT_URL");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: conn,
  ssl: conn.includes("localhost") ? false : { rejectUnauthorized: false },
});
await client.connect();
const r = await client.query(`
  select
    (select count(*)::int from public.warehouses) as warehouses,
    (select count(*)::int from public.shelters) as shelters,
    (select count(*)::int from public.catalog_items) as catalog_items,
    (select count(*)::int from public.app_settings) as app_settings
`);
console.log("DB OK:", r.rows[0]);
await client.end();
