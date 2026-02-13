<script setup lang="ts">
const navigation = [
  { label: "Recetas", to: "/recetas", icon: "i-lucide-book-open" },
  { label: "Plan", to: "/plan", icon: "i-lucide-calendar" },
  { label: "Sorpresa", to: "/sorpresa", icon: "i-lucide-sparkles" },
];
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <!-- Desktop top nav -->
    <header class="hidden md:block border-b border-default">
      <nav class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <NuxtLink to="/recetas" class="text-lg font-bold text-highlighted">
          Recetas Diarias
        </NuxtLink>
        <div class="flex items-center gap-1">
          <UButton
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            :label="item.label"
            :icon="item.icon"
            variant="ghost"
            color="neutral"
          />
        </div>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full">
      <slot />
    </main>

    <!-- Mobile bottom nav -->
    <nav
      class="md:hidden fixed bottom-0 inset-x-0 bg-default border-t border-default z-50 safe-area-bottom"
    >
      <div class="flex justify-around py-2">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-1 text-xs p-2 text-muted hover:text-highlighted transition-colors"
          active-class="!text-primary"
        >
          <UIcon :name="item.icon" class="size-5" />
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
