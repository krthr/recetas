import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  const allRecipes = await db
    .select({ ingredients: recipes.ingredients })
    .from(recipes);

  const ingredientSet = new Set<string>();

  for (const recipe of allRecipes) {
    try {
      const parsed: string[] = JSON.parse(recipe.ingredients);
      for (const ingredient of parsed) {
        const normalized = ingredient.trim().toLowerCase();
        if (normalized) {
          ingredientSet.add(normalized);
        }
      }
    } catch {
      // Skip malformed JSON
    }
  }

  return [...ingredientSet].sort((a, b) => a.localeCompare(b, "es"));
});
