<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

interface PlanSlot {
  id: number;
  planId: number;
  dayOfWeek: number;
  mealType: string;
  recipeId: number | null;
  recipe: Recipe | null;
}

interface Plan {
  id: number;
  createdAt: string;
  slots: PlanSlot[];
}

const toast = useToast();

const { data: plan, refresh } = await useFetch<Plan | null>("/api/plan");
const { data: recipeCount } = await useFetch<Recipe[]>("/api/recipes", {
  transform: (data) => data,
});

const generating = ref(false);
const swapping = ref<number | null>(null);
const showRegenerateModal = ref(false);

const dayNames = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const hasEnoughRecipes = computed(
  () => recipeCount.value && recipeCount.value.length >= 5
);

function getSlot(dayOfWeek: number, mealType: string) {
  return plan.value?.slots.find(
    (s) => s.dayOfWeek === dayOfWeek && s.mealType === mealType
  );
}

async function generatePlan() {
  generating.value = true;
  try {
    await $fetch("/api/plan/generate", { method: "POST" });
    await refresh();
    toast.add({
      title: "Plan generado",
      description: "Tu plan semanal está listo",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.statusMessage ||
        "No se pudo generar el plan. Intenta de nuevo.",
      color: "error",
    });
  } finally {
    generating.value = false;
    showRegenerateModal.value = false;
  }
}

async function swapSlot(slotId: number) {
  swapping.value = slotId;
  try {
    await $fetch("/api/plan/swap", {
      method: "POST",
      body: { slotId },
    });
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.statusMessage || "No se pudo cambiar la receta",
      color: "error",
    });
  } finally {
    swapping.value = null;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Plan Semanal</h1>
      <UButton
        v-if="plan"
        icon="i-lucide-refresh-cw"
        label="Regenerar"
        variant="soft"
        size="sm"
        @click="showRegenerateModal = true"
      />
    </div>

    <!-- Plan exists -->
    <template v-if="plan">
      <div class="space-y-3">
        <PlanDayCard
          v-for="(dayName, index) in dayNames"
          :key="index"
          :day-name="dayName"
          :lunch-slot="getSlot(index, 'lunch')"
          :dinner-slot="getSlot(index, 'dinner')"
          :swapping="swapping"
          @swap="swapSlot"
        />
      </div>
    </template>

    <!-- No plan -->
    <template v-else>
      <div class="text-center py-16 space-y-4">
        <UIcon name="i-lucide-calendar" class="size-16 text-muted mx-auto" />
        <div>
          <p class="text-lg font-medium text-highlighted">
            Genera tu plan semanal
          </p>
          <p class="text-muted text-sm mt-1">
            {{
              hasEnoughRecipes
                ? "La IA creará un plan balanceado con tus recetas"
                : `Necesitas al menos 5 recetas para generar un plan (tienes ${recipeCount?.length ?? 0})`
            }}
          </p>
        </div>
        <UButton
          icon="i-lucide-sparkles"
          label="Generar plan"
          size="lg"
          :loading="generating"
          :disabled="!hasEnoughRecipes"
          @click="generatePlan"
        />
      </div>
    </template>

    <!-- Regenerate confirmation modal -->
    <UModal v-model:open="showRegenerateModal">
      <template #header>
        <span class="font-semibold">Regenerar plan</span>
      </template>
      <template #body>
        <p>
          ¿Estás segura de que quieres regenerar el plan? El plan actual se
          reemplazará por uno nuevo.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="ghost"
            color="neutral"
            @click="showRegenerateModal = false"
          />
          <UButton
            label="Regenerar"
            icon="i-lucide-sparkles"
            :loading="generating"
            @click="generatePlan"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
