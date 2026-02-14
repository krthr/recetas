<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

defineProps<{
  recipe: Recipe;
}>();

defineEmits<{
  again: [];
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
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    appear
  >
    <div
      class="rounded-2xl border border-default bg-default overflow-hidden shadow-lg max-w-sm mx-auto"
    >
      <!-- Photo -->
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
          <UIcon name="i-lucide-utensils" class="size-16" />
        </div>
      </div>

      <div class="p-5 space-y-4">
        <h2 class="text-xl font-bold text-highlighted text-center">
          {{ recipe.name }}
        </h2>

        <div class="flex items-center justify-center gap-3 flex-wrap">
          <UBadge
            :color="difficultyColors[recipe.difficulty]"
            variant="subtle"
          >
            {{ difficultyLabels[recipe.difficulty] }}
          </UBadge>
          <UBadge color="neutral" variant="subtle">
            {{ mealTypeLabels[recipe.mealType] }}
          </UBadge>
          <span class="text-sm text-muted flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="size-4" />
            {{ recipe.time }} min
          </span>
        </div>

        <div class="flex gap-2">
          <UButton
            :to="`/recetas/${recipe.id}`"
            label="Ver receta"
            icon="i-lucide-eye"
            variant="soft"
            class="flex-1"
          />
          <UButton
            label="Otra vez"
            icon="i-lucide-shuffle"
            class="flex-1"
            @click="$emit('again')"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
