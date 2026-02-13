<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

defineProps<{
  recipe: Recipe;
}>();

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const difficultyColors: Record<string, string> = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

const mealTypeLabels: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Merienda",
};
</script>

<template>
  <NuxtLink
    :to="`/recetas/${recipe.id}`"
    class="block rounded-xl border border-default bg-default overflow-hidden hover:ring-2 hover:ring-primary transition-all"
  >
    <div class="aspect-video bg-muted relative overflow-hidden">
      <img
        v-if="recipe.photo"
        :src="`/api/uploads/${recipe.photo}`"
        :alt="recipe.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted"
      >
        <UIcon name="i-lucide-utensils" class="size-12" />
      </div>
    </div>
    <div class="p-3 space-y-2">
      <h3 class="font-semibold text-highlighted truncate">{{ recipe.name }}</h3>
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge :color="difficultyColors[recipe.difficulty]" variant="subtle" size="xs">
          {{ difficultyLabels[recipe.difficulty] }}
        </UBadge>
        <UBadge color="neutral" variant="subtle" size="xs">
          {{ mealTypeLabels[recipe.mealType] }}
        </UBadge>
        <span class="text-xs text-muted flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3" />
          {{ recipe.time }} min
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
