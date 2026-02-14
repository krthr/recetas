import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "ID inválido" });
  }

  const existing = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .get();

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Receta no encontrada" });
  }

  // Clean up photo file
  if (existing.photo) {
    const storage = useStorage("uploads");
    await storage.removeItem(existing.photo);
  }

  await db.delete(recipes).where(eq(recipes.id, id));

  return { success: true };
});
