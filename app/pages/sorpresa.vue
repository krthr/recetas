<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

const mealType = ref<string | undefined>(undefined);
const difficulty = ref<string | undefined>(undefined);
const selectedRecipe = ref<Recipe | null>(null);
const noResults = ref(false);
const revealKey = ref(0);

const mealTypeOptions = [
  { label: "Cualquiera", value: undefined },
  { label: "Desayuno", value: "breakfast" },
  { label: "Almuerzo", value: "lunch" },
  { label: "Cena", value: "dinner" },
  { label: "Merienda", value: "snack" },
];

const difficultyOptions = [
  { label: "Cualquiera", value: undefined },
  { label: "Fácil", value: "easy" },
  { label: "Media", value: "medium" },
  { label: "Difícil", value: "hard" },
];

async function surprise() {
  const params: Record<string, string> = {};
  if (mealType.value) params.mealType = mealType.value;
  if (difficulty.value) params.difficulty = difficulty.value;

  const recipes = await $fetch<Recipe[]>("/api/recipes", { query: params });

  if (recipes.length === 0) {
    selectedRecipe.value = null;
    noResults.value = true;
    return;
  }

  noResults.value = false;

  // Pick a random recipe (try to avoid the same one)
  let candidates = recipes.filter((r) => r.id !== selectedRecipe.value?.id);
  if (candidates.length === 0) candidates = recipes;

  selectedRecipe.value =
    candidates[Math.floor(Math.random() * candidates.length)];
  revealKey.value++;
}
</script>

<template>
  <div class="space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold">Sorpresa</h1>
      <p class="text-muted text-sm">
        No sabes qué cocinar? Deja que el destino decida
      </p>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 justify-center flex-wrap">
      <USelect
        v-model="mealType"
        :items="mealTypeOptions"
        value-key="value"
        placeholder="Tipo"
        size="sm"
        class="w-36"
      />
      <USelect
        v-model="difficulty"
        :items="difficultyOptions"
        value-key="value"
        placeholder="Dificultad"
        size="sm"
        class="w-36"
      />
    </div>

    <!-- Surprise button -->
    <div class="text-center">
      <UButton
        icon="i-lucide-sparkles"
        label="Sorpréndeme"
        size="xl"
        @click="surprise"
      />
    </div>

    <!-- No results -->
    <div v-if="noResults" class="text-center py-8 space-y-2">
      <UIcon name="i-lucide-search-x" class="size-12 text-muted mx-auto" />
      <p class="text-muted">No hay recetas con estos filtros</p>
      <p class="text-xs text-muted">Intenta cambiar los filtros o agrega más recetas</p>
    </div>

    <!-- Result -->
    <div v-if="selectedRecipe" class="mt-6">
      <RandomReveal
        :key="revealKey"
        :recipe="selectedRecipe"
        @again="surprise"
      />
    </div>
  </div>
</template>
