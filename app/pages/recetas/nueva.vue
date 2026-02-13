<script setup lang="ts">
const toast = useToast();
const router = useRouter();

async function handleSubmit(data: any) {
  try {
    const recipe = await $fetch("/api/recipes", {
      method: "POST",
      body: data,
    });
    toast.add({
      title: "Receta creada",
      description: `"${data.name}" se agregó correctamente`,
      color: "success",
    });
    router.push(`/recetas/${recipe.id}`);
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.statusMessage || "No se pudo crear la receta",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        to="/recetas"
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
      />
      <h1 class="text-2xl font-bold">Nueva Receta</h1>
    </div>

    <RecipeForm submit-label="Crear receta" @submit="handleSubmit" />
  </div>
</template>
