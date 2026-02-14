<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  initialData?: {
    name: string;
    ingredients: string[];
    time: number;
    difficulty: string;
    mealType: string;
    photo: string | null;
    notes: string | null;
  };
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [data: FormData];
}>();

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  ingredients: z
    .array(z.string().min(1, "El ingrediente no puede estar vacío"))
    .min(1, "Agrega al menos un ingrediente"),
  time: z.number().int().min(1, "El tiempo debe ser al menos 1 minuto"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  notes: z.string().optional(),
});

type Schema = z.input<typeof schema>;

const state = reactive<Schema>({
  name: props.initialData?.name ?? "",
  ingredients: props.initialData?.ingredients?.length
    ? [...props.initialData.ingredients]
    : [""],
  time: props.initialData?.time ?? 30,
  difficulty: props.initialData?.difficulty ?? "medium",
  mealType: props.initialData?.mealType ?? "lunch",
  notes: props.initialData?.notes ?? "",
});

const { data: availableIngredients, status: ingredientsStatus } =
  useFetch<string[]>("/api/ingredients", { default: () => [] });
const ingredientsLoading = computed(
  () => ingredientsStatus.value === "pending"
);

function onCreateIngredient(item: string, index: number) {
  const normalized = item.trim().toLowerCase();
  if (normalized && !availableIngredients.value.includes(normalized)) {
    availableIngredients.value.push(normalized);
    availableIngredients.value.sort((a, b) => a.localeCompare(b, "es"));
  }
  state.ingredients[index] = normalized;
}

const photoFile = ref<File | null>(null);
const existingPhoto = ref(props.initialData?.photo ?? null);
const photoPreview = computed(() => {
  if (photoFile.value) {
    return URL.createObjectURL(photoFile.value);
  }
  if (existingPhoto.value) {
    return `/api/uploads/${existingPhoto.value}`;
  }
  return null;
});

const submitting = ref(false);

function addIngredient() {
  state.ingredients.push("");
}

function removeIngredient(index: number) {
  if (state.ingredients.length > 1) {
    state.ingredients.splice(index, 1);
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    photoFile.value = input.files[0];
  }
}

function removePhoto() {
  photoFile.value = null;
  existingPhoto.value = null;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitting.value = true;
  try {
    let photoFilename = existingPhoto.value;

    if (photoFile.value) {
      const formData = new FormData();
      formData.append("image", photoFile.value);
      const uploadResult = await $fetch<{ filename: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });
      photoFilename = uploadResult.filename;
    }

    const data = {
      ...event.data,
      ingredients: event.data.ingredients
        .map((i) => i.trim().toLowerCase())
        .filter((i) => i !== ""),
      photo: photoFilename,
      notes: event.data.notes || null,
    };

    emit("submit", data as any);
  } finally {
    submitting.value = false;
  }
}

const difficultyOptions = [
  { label: "Fácil", value: "easy" },
  { label: "Media", value: "medium" },
  { label: "Difícil", value: "hard" },
];

const mealTypeOptions = [
  { label: "Desayuno", value: "breakfast" },
  { label: "Almuerzo", value: "lunch" },
  { label: "Cena", value: "dinner" },
  { label: "Merienda", value: "snack" },
];
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField label="Nombre" name="name" required>
      <UInput v-model="state.name" placeholder="Ej: Tortilla de patatas" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Tiempo (min)" name="time" required>
        <UInput v-model.number="state.time" type="number" :min="1" class="w-full" />
      </UFormField>

      <UFormField label="Dificultad" name="difficulty" required>
        <USelect
          v-model="state.difficulty"
          :items="difficultyOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField label="Tipo de comida" name="mealType" required>
      <USelect
        v-model="state.mealType"
        :items="mealTypeOptions"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Ingredientes" name="ingredients" required>
      <div class="space-y-2">
        <div
          v-for="(_, index) in state.ingredients"
          :key="index"
          class="flex gap-2"
        >
          <UInputMenu
            v-model="state.ingredients[index]"
            :items="availableIngredients"
            :loading="ingredientsLoading"
            create-item
            :placeholder="`Ingrediente ${index + 1}`"
            class="flex-1"
            @create="onCreateIngredient($event, index)"
          />
          <UButton
            v-if="state.ingredients.length > 1"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="removeIngredient(index)"
          />
        </div>
        <UButton
          icon="i-lucide-plus"
          label="Agregar ingrediente"
          variant="soft"
          color="neutral"
          size="sm"
          block
          @click="addIngredient"
        />
      </div>
    </UFormField>

    <UFormField label="Foto" name="photo">
      <div class="space-y-3">
        <div v-if="photoPreview" class="relative">
          <img
            :src="photoPreview"
            alt="Preview"
            class="w-full h-48 object-cover rounded-lg"
          />
          <UButton
            icon="i-lucide-x"
            color="error"
            variant="solid"
            size="xs"
            class="absolute top-2 right-2"
            @click="removePhoto"
          />
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          @change="handleFileChange"
        />
        <p class="text-xs text-muted">JPG, PNG o WebP (máx. 5MB)</p>
      </div>
    </UFormField>

    <UFormField label="Notas" name="notes">
      <UTextarea
        v-model="state.notes"
        placeholder="Consejos, variaciones, notas personales..."
        class="w-full"
      />
    </UFormField>

    <UButton
      type="submit"
      :label="submitLabel ?? 'Guardar receta'"
      icon="i-lucide-save"
      block
      size="lg"
      :loading="submitting"
    />
  </UForm>
</template>
