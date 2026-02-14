<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { data: recipe } = await useFetch<Recipe>(`/api/recipes/${route.params.id}`);

if (!recipe.value) {
  throw createError({ statusCode: 404, statusMessage: "Receta no encontrada" });
}

const initialData = computed(() => {
  if (!recipe.value) return undefined;
  let ingredients: string[] = [];
  try {
    ingredients = JSON.parse(recipe.value.ingredients as string);
  } catch {
    ingredients = [];
  }
  return {
    name: recipe.value.name,
    ingredients,
    time: recipe.value.time,
    difficulty: recipe.value.difficulty,
    mealType: recipe.value.mealType,
    photo: recipe.value.photo,
    notes: recipe.value.notes,
  };
});

async function handleSubmit(data: any) {
  try {
    await $fetch(`/api/recipes/${route.params.id}`, {
      method: "PUT",
      body: data,
    });
    toast.add({
      title: "Receta actualizada",
      description: `"${data.name}" se actualizó correctamente`,
      color: "success",
    });
    router.push(`/recetas/${route.params.id}`);
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.statusMessage || "No se pudo actualizar la receta",
      color: "error",
    });
  }
}
</script>

<template>
  <div v-if="recipe" class="max-w-lg mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        :to="`/recetas/${route.params.id}`"
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
      />
      <h1 class="text-2xl font-bold">Editar Receta</h1>
    </div>

    <RecipeForm
      :initial-data="initialData"
      submit-label="Guardar cambios"
      @submit="handleSubmit"
    />
  </div>
</template>
