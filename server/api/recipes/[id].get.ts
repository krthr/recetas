import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "ID inválido" });
  }

  const recipe = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .get();

  if (!recipe) {
    throw createError({ statusCode: 404, statusMessage: "Receta no encontrada" });
  }

  return recipe;
});
