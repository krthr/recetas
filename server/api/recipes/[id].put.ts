import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

const updateRecipeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  ingredients: z
    .array(z.string().min(1))
    .min(1, "Agrega al menos un ingrediente"),
  time: z.number().int().min(1, "El tiempo debe ser al menos 1 minuto"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  photo: z.string().nullish(),
  notes: z.string().nullish(),
});

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

  const body = await readBody(event);
  const parsed = updateRecipeSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0].message,
    });
  }

  // Clean up old photo if it's being replaced
  if (existing.photo && parsed.data.photo !== existing.photo) {
    const storage = useStorage("uploads");
    await storage.removeItem(existing.photo);
  }

  const result = await db
    .update(recipes)
    .set({
      ...parsed.data,
      ingredients: JSON.stringify(parsed.data.ingredients),
      photo: parsed.data.photo ?? null,
      notes: parsed.data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  return result[0];
});
