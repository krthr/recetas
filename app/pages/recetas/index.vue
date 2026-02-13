<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

const search = ref("");
const mealType = ref<string | undefined>(undefined);
const difficulty = ref<string | undefined>(undefined);

const queryParams = computed(() => {
  const params: Record<string, string> = {};
  if (search.value) params.search = search.value;
  if (mealType.value) params.mealType = mealType.value;
  if (difficulty.value) params.difficulty = difficulty.value;
  return params;
});

const { data: recipes, refresh } = await useFetch<Recipe[]>("/api/recipes", {
  query: queryParams,
});

const mealTypeOptions = [
  { label: "Todas", value: undefined },
  { label: "Desayuno", value: "breakfast" },
  { label: "Almuerzo", value: "lunch" },
  { label: "Cena", value: "dinner" },
  { label: "Merienda", value: "snack" },
];

const difficultyOptions = [
  { label: "Todas", value: undefined },
  { label: "Fácil", value: "easy" },
  { label: "Media", value: "medium" },
  { label: "Difícil", value: "hard" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Mis Recetas</h1>
      <UButton
        to="/recetas/nueva"
        icon="i-lucide-plus"
        label="Nueva"
        size="sm"
      />
    </div>

    <!-- Search and filters -->
    <div class="space-y-3">
      <UInput
        v-model="search"
        placeholder="Buscar recetas..."
        icon="i-lucide-search"
        class="w-full"
      />
      <div class="flex gap-2 flex-wrap">
        <USelect
          v-model="mealType"
          :items="mealTypeOptions"
          value-key="value"
          placeholder="Tipo"
          size="sm"
          class="w-32"
        />
        <USelect
          v-model="difficulty"
          :items="difficultyOptions"
          value-key="value"
          placeholder="Dificultad"
          size="sm"
          class="w-32"
        />
      </div>
    </div>

    <!-- Recipe grid -->
    <div
      v-if="recipes && recipes.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-16 space-y-4"
    >
      <UIcon name="i-lucide-book-open" class="size-16 text-muted mx-auto" />
      <div>
        <p class="text-lg font-medium text-highlighted">
          {{ search || mealType || difficulty ? 'No hay recetas con estos filtros' : 'Agrega tu primera receta' }}
        </p>
        <p class="text-muted text-sm mt-1">
          {{ search || mealType || difficulty ? 'Intenta cambiar los filtros' : 'Empieza agregando tus recetas favoritas' }}
        </p>
      </div>
      <UButton
        v-if="!search && !mealType && !difficulty"
        to="/recetas/nueva"
        icon="i-lucide-plus"
        label="Agregar receta"
      />
    </div>
  </div>
</template>
