import { db } from "~~/server/db";
import { weeklyPlans } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  await db.delete(weeklyPlans);
  return { success: true };
});
