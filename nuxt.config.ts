// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],

  runtimeConfig: {
    geminiApiKey: "", // env: NUXT_GEMINI_API_KEY
  },

  nitro: {
    storage: {
      uploads: {
        driver: "fs",
        base: "./.data/uploads",
      },
    },
  },
});
