import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ingredients: text("ingredients").notNull(), // JSON array of strings
  time: integer("time").notNull(), // minutes
  difficulty: text("difficulty").notNull(), // easy | medium | hard
  mealType: text("meal_type").notNull(), // breakfast | lunch | dinner | snack
  photo: text("photo"), // filename in uploads dir
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const weeklyPlans = sqliteTable("weekly_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const planSlots = sqliteTable("plan_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id")
    .notNull()
    .references(() => weeklyPlans.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Monday ... 6=Sunday
  mealType: text("meal_type").notNull(), // lunch | dinner
  recipeId: integer("recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type WeeklyPlan = typeof weeklyPlans.$inferSelect;
export type PlanSlot = typeof planSlots.$inferSelect;
