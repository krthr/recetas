import { z } from "zod";
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

const createRecipeSchema = z.object({
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
  const body = await readBody(event);
  const parsed = createRecipeSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0].message,
    });
  }

  const result = await db
    .insert(recipes)
    .values({
      ...parsed.data,
      ingredients: JSON.stringify(parsed.data.ingredients),
      photo: parsed.data.photo ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  return result[0];
});
