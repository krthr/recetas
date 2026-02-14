import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

export function useGemini(): GoogleGenAI {
  if (!_ai) {
    const config = useRuntimeConfig();
    if (!config.geminiApiKey) {
      throw new Error("NUXT_GEMINI_API_KEY is not set");
    }
    _ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return _ai;
}
