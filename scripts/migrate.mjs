import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { Client } = pg;

// Get DB password from Supabase Dashboard → Settings → Database → Connection String
// Paste the password in .env.local as SUPABASE_DB_PASSWORD=yourpassword
import { config } from "dotenv";
config({ path: ".env.local" });

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("\n❌  Missing SUPABASE_DB_PASSWORD in .env.local");
  console.error("   Go to: https://supabase.com/dashboard/project/fryaygnfprxxgxdotlkt/settings/database");
  console.error("   Copy the DB password and add to .env.local:\n");
  console.error("   SUPABASE_DB_PASSWORD=your_password_here\n");
  process.exit(1);
}

const client = new Client({
  host: "db.fryaygnfprxxgxdotlkt.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password,
  ssl: { rejectUnauthorized: false },
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "../supabase/migrations/001_init.sql"), "utf-8");

// Split into individual statements (skip comments)
const statements = sql
  .split(";")
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith("--"));

async function run() {
  try {
    await client.connect();
    console.log("✅  Connected to Supabase\n");

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        const firstLine = stmt.split("\n")[0].slice(0, 60);
        console.log(`   ✓  ${firstLine}`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`   ⚠  Already exists — skipping`);
        } else {
          console.error(`   ✗  Error: ${err.message}`);
        }
      }
    }

    console.log("\n✅  Migration complete. Tables created in Supabase.\n");
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
