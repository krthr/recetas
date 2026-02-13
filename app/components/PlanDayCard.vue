<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

interface Slot {
  id: number;
  dayOfWeek: number;
  mealType: string;
  recipeId: number | null;
  recipe: Recipe | null;
}

defineProps<{
  dayName: string;
  lunchSlot: Slot | undefined;
  dinnerSlot: Slot | undefined;
  swapping: number | null;
}>();

const emit = defineEmits<{
  swap: [slotId: number];
}>();
</script>

<template>
  <div class="rounded-xl border border-default bg-default overflow-hidden">
    <div class="bg-primary/10 px-4 py-2">
      <h3 class="font-semibold text-primary">{{ dayName }}</h3>
    </div>

    <div class="divide-y divide-default">
      <!-- Lunch slot -->
      <div class="p-3 flex items-center gap-3">
        <div class="shrink-0">
          <UBadge color="warning" variant="subtle" size="xs">Almuerzo</UBadge>
        </div>
        <template v-if="lunchSlot?.recipe">
          <NuxtLink
            :to="`/recetas/${lunchSlot.recipe.id}`"
            class="flex-1 min-w-0"
          >
            <div class="flex items-center gap-2">
              <div
                class="size-8 rounded-md bg-muted overflow-hidden shrink-0"
              >
                <img
                  v-if="lunchSlot.recipe.photo"
                  :src="`/api/uploads/${lunchSlot.recipe.photo}`"
                  :alt="lunchSlot.recipe.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <UIcon name="i-lucide-utensils" class="size-4 text-muted" />
                </div>
              </div>
              <span class="text-sm truncate text-highlighted">
                {{ lunchSlot.recipe.name }}
              </span>
            </div>
          </NuxtLink>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            color="neutral"
            size="xs"
            :loading="swapping === lunchSlot.id"
            @click="emit('swap', lunchSlot.id)"
          />
        </template>
        <template v-else>
          <span class="flex-1 text-sm text-muted italic">Sin receta</span>
          <UButton
            v-if="lunchSlot"
            icon="i-lucide-refresh-cw"
            variant="ghost"
            color="neutral"
            size="xs"
            :loading="swapping === lunchSlot.id"
            @click="emit('swap', lunchSlot.id)"
          />
        </template>
      </div>

      <!-- Dinner slot -->
      <div class="p-3 flex items-center gap-3">
        <div class="shrink-0">
          <UBadge color="info" variant="subtle" size="xs">Cena</UBadge>
        </div>
        <template v-if="dinnerSlot?.recipe">
          <NuxtLink
            :to="`/recetas/${dinnerSlot.recipe.id}`"
            class="flex-1 min-w-0"
          >
            <div class="flex items-center gap-2">
              <div
                class="size-8 rounded-md bg-muted overflow-hidden shrink-0"
              >
                <img
                  v-if="dinnerSlot.recipe.photo"
                  :src="`/api/uploads/${dinnerSlot.recipe.photo}`"
                  :alt="dinnerSlot.recipe.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <UIcon name="i-lucide-utensils" class="size-4 text-muted" />
                </div>
              </div>
              <span class="text-sm truncate text-highlighted">
                {{ dinnerSlot.recipe.name }}
              </span>
            </div>
          </NuxtLink>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            color="neutral"
            size="xs"
            :loading="swapping === dinnerSlot.id"
            @click="emit('swap', dinnerSlot.id)"
          />
        </template>
        <template v-else>
          <span class="flex-1 text-sm text-muted italic">Sin receta</span>
          <UButton
            v-if="dinnerSlot"
            icon="i-lucide-refresh-cw"
            variant="ghost"
            color="neutral"
            size="xs"
            :loading="swapping === dinnerSlot.id"
            @click="emit('swap', dinnerSlot.id)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
