<script setup lang="ts">
import type { Recipe } from "~~/server/db/schema";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { data: recipe } = await useFetch<Recipe>(`/api/recipes/${route.params.id}`);

if (!recipe.value) {
  throw createError({ statusCode: 404, statusMessage: "Receta no encontrada" });
}

const showDeleteModal = ref(false);
const deleting = ref(false);

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

const ingredients = computed(() => {
  if (!recipe.value) return [];
  try {
    return JSON.parse(recipe.value.ingredients as string);
  } catch {
    return [];
  }
});

async function deleteRecipe() {
  deleting.value = true;
  try {
    await $fetch(`/api/recipes/${route.params.id}`, { method: "DELETE" });
    toast.add({
      title: "Receta eliminada",
      description: `"${recipe.value!.name}" se eliminó correctamente`,
      color: "success",
    });
    router.push("/recetas");
  } catch {
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la receta",
      color: "error",
    });
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
}
</script>

<template>
  <div v-if="recipe" class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton
        to="/recetas"
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
      />
      <h1 class="text-2xl font-bold flex-1 truncate">{{ recipe.name }}</h1>
      <div class="flex gap-2">
        <UButton
          :to="`/recetas/${recipe.id}/editar`"
          icon="i-lucide-pencil"
          variant="ghost"
          color="neutral"
          size="sm"
        />
        <UButton
          icon="i-lucide-trash-2"
          variant="ghost"
          color="error"
          size="sm"
          @click="showDeleteModal = true"
        />
      </div>
    </div>

    <!-- Photo -->
    <div class="aspect-video rounded-xl overflow-hidden bg-muted">
      <img
        v-if="recipe.photo"
        :src="`/api/uploads/${recipe.photo}`"
        :alt="recipe.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted">
        <UIcon name="i-lucide-utensils" class="size-16" />
      </div>
    </div>

    <!-- Badges -->
    <div class="flex items-center gap-3 flex-wrap">
      <UBadge :color="difficultyColors[recipe.difficulty]" variant="subtle">
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

    <!-- Ingredients -->
    <div>
      <h2 class="text-lg font-semibold mb-3">Ingredientes</h2>
      <ul class="space-y-2">
        <li
          v-for="(ingredient, index) in ingredients"
          :key="index"
          class="flex items-start gap-2 text-sm"
        >
          <UIcon name="i-lucide-circle-dot" class="size-4 mt-0.5 text-primary shrink-0" />
          {{ ingredient }}
        </li>
      </ul>
    </div>

    <!-- Notes -->
    <div v-if="recipe.notes">
      <h2 class="text-lg font-semibold mb-3">Notas</h2>
      <p class="text-sm text-muted whitespace-pre-wrap">{{ recipe.notes }}</p>
    </div>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <span class="font-semibold">Eliminar receta</span>
      </template>
      <template #body>
        <p>
          ¿Estás segura de que quieres eliminar
          <strong>"{{ recipe.name }}"</strong>?
          Esta acción no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="ghost"
            color="neutral"
            @click="showDeleteModal = false"
          />
          <UButton
            label="Eliminar"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            @click="deleteRecipe"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
