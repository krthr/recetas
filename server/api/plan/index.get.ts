import { eq, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { weeklyPlans, planSlots, recipes } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  const plan = await db
    .select()
    .from(weeklyPlans)
    .orderBy(desc(weeklyPlans.createdAt))
    .limit(1)
    .get();

  if (!plan) {
    return null;
  }

  const slots = await db
    .select()
    .from(planSlots)
    .leftJoin(recipes, eq(planSlots.recipeId, recipes.id))
    .where(eq(planSlots.planId, plan.id));

  return {
    id: plan.id,
    createdAt: plan.createdAt,
    slots: slots.map((row) => ({
      ...row.plan_slots,
      recipe: row.recipes,
    })),
  };
});
