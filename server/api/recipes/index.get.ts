import { like, eq, and, desc, type SQL } from "drizzle-orm";
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = query.search as string | undefined;
  const mealType = query.mealType as string | undefined;
  const difficulty = query.difficulty as string | undefined;

  const conditions: SQL[] = [];

  if (search) {
    conditions.push(like(recipes.name, `%${search}%`));
  }

  if (mealType) {
    conditions.push(eq(recipes.mealType, mealType));
  }

  if (difficulty) {
    conditions.push(eq(recipes.difficulty, difficulty));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.select().from(recipes).where(where).orderBy(desc(recipes.createdAt));
});
