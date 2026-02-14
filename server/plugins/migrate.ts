import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { useDb } from "~~/server/db";

export default defineNitroPlugin(() => {
  migrate(useDb(), { migrationsFolder: "drizzle" });
  console.log("[db] Migrations applied successfully");
});
