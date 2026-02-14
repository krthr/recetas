import { eq, and, ne, inArray } from "drizzle-orm";
import { db } from "~~/server/db";
import { planSlots, recipes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { slotId } = body;

  if (!slotId) {
    throw createError({ statusCode: 400, statusMessage: "slotId es requerido" });
  }

  // Get the slot to swap
  const slot = await db
    .select()
    .from(planSlots)
    .where(eq(planSlots.id, slotId))
    .get();

  if (!slot) {
    throw createError({ statusCode: 404, statusMessage: "Slot no encontrado" });
  }

  // Get all recipe IDs currently in this plan
  const currentSlots = await db
    .select()
    .from(planSlots)
    .where(eq(planSlots.planId, slot.planId));

  const usedRecipeIds = currentSlots
    .map((s) => s.recipeId)
    .filter((id): id is number => id !== null);

  // Find recipes that match the meal type and aren't in the plan
  let candidates = await db
    .select()
    .from(recipes)
    .where(
      usedRecipeIds.length > 0
        ? and(
            eq(recipes.mealType, slot.mealType),
            // Use SQL to filter out used IDs
          )
        : eq(recipes.mealType, slot.mealType)
    );

  // Filter out recipes already in the plan
  candidates = candidates.filter((r) => !usedRecipeIds.includes(r.id));

  // If no unused candidates, allow any recipe of the same meal type
  if (candidates.length === 0) {
    candidates = await db
      .select()
      .from(recipes)
      .where(eq(recipes.mealType, slot.mealType));
  }

  // If still no candidates, try any recipe
  if (candidates.length === 0) {
    candidates = await db.select().from(recipes);
  }

  if (candidates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No hay recetas disponibles para intercambiar",
    });
  }

  // Pick a random one (different from current if possible)
  let filtered = candidates.filter((r) => r.id !== slot.recipeId);
  if (filtered.length === 0) filtered = candidates;

  const newRecipe = filtered[Math.floor(Math.random() * filtered.length)];

  // Update the slot
  await db
    .update(planSlots)
    .set({ recipeId: newRecipe.id })
    .where(eq(planSlots.id, slotId));

  return {
    ...slot,
    recipeId: newRecipe.id,
    recipe: newRecipe,
  };
});
