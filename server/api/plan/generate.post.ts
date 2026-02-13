import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { recipes, weeklyPlans, planSlots } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const allRecipes = await db.select().from(recipes);

  if (allRecipes.length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Agrega al menos 5 recetas para generar un plan semanal",
    });
  }

  const recipeList = allRecipes.map((r) => ({
    id: r.id,
    name: r.name,
    mealType: r.mealType,
    difficulty: r.difficulty,
    time: r.time,
  }));

  const ai = useGemini();

  const prompt = `Aquí tienes una lista de recetas disponibles:

${JSON.stringify(recipeList, null, 2)}

Genera un plan semanal de comidas de lunes a domingo. Cada día debe tener almuerzo y cena (14 comidas en total).

Reglas:
- Usa SOLO los IDs de las recetas proporcionadas
- Balancea la dificultad a lo largo de la semana (no pongas todas las difíciles el mismo día)
- Varía las recetas tanto como sea posible
- Si hay menos de 14 recetas, puedes repetir algunas pero minimiza las repeticiones
- Las recetas marcadas como "lunch" son ideales para almuerzo y las de "dinner" para cena, pero puedes ser flexible

Responde SOLO con un JSON array con exactamente 14 objetos, cada uno con:
- "dayOfWeek": número de 0 (lunes) a 6 (domingo)
- "mealType": "lunch" o "dinner"
- "recipeId": el ID de la receta seleccionada`;

  let planData: Array<{
    dayOfWeek: number;
    mealType: string;
    recipeId: number;
  }>;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "Eres un planificador de comidas profesional. Responde siempre con JSON válido.",
      },
    });

    planData = JSON.parse(response.text ?? "[]");
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage:
        "No se pudo generar el plan. Intenta de nuevo en unos momentos.",
    });
  }

  // Validate all recipe IDs exist
  const validIds = new Set(allRecipes.map((r) => r.id));
  planData = planData.filter(
    (slot) =>
      validIds.has(slot.recipeId) &&
      slot.dayOfWeek >= 0 &&
      slot.dayOfWeek <= 6 &&
      (slot.mealType === "lunch" || slot.mealType === "dinner")
  );

  // Ensure we have all 14 slots (fill any missing with random picks)
  const existingSlots = new Set(
    planData.map((s) => `${s.dayOfWeek}-${s.mealType}`)
  );
  for (let day = 0; day < 7; day++) {
    for (const meal of ["lunch", "dinner"]) {
      const key = `${day}-${meal}`;
      if (!existingSlots.has(key)) {
        const randomRecipe =
          allRecipes[Math.floor(Math.random() * allRecipes.length)];
        planData.push({
          dayOfWeek: day,
          mealType: meal,
          recipeId: randomRecipe.id,
        });
      }
    }
  }

  // Delete existing plan
  const existingPlans = await db.select().from(weeklyPlans);
  for (const plan of existingPlans) {
    await db.delete(weeklyPlans).where(eq(weeklyPlans.id, plan.id));
  }

  // Create new plan
  const [newPlan] = await db.insert(weeklyPlans).values({}).returning();

  // Insert all slots
  await db.insert(planSlots).values(
    planData.map((slot) => ({
      planId: newPlan.id,
      dayOfWeek: slot.dayOfWeek,
      mealType: slot.mealType,
      recipeId: slot.recipeId,
    }))
  );

  // Return plan with recipe details
  const slots = await db
    .select()
    .from(planSlots)
    .leftJoin(recipes, eq(planSlots.recipeId, recipes.id))
    .where(eq(planSlots.planId, newPlan.id));

  return {
    id: newPlan.id,
    createdAt: newPlan.createdAt,
    slots: slots.map((row) => ({
      ...row.plan_slots,
      recipe: row.recipes,
    })),
  };
});
