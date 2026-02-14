---
title: "feat: Ingredient dropdown with autocomplete"
type: feat
date: 2026-02-14
---

# feat: Ingredient dropdown with autocomplete

## Overview

Replace the plain text inputs for ingredients in the recipe form with `UInputMenu` dropdowns that show existing ingredients from all saved recipes. Users can search/filter existing ingredients and create new ones inline.

## Problem Statement / Motivation

Currently, each ingredient is a free-text `UInput` field. This means:

- Users re-type the same ingredients across recipes (e.g., "tomate", "cebolla")
- Typos and inconsistent casing lead to duplicates ("Tomate" vs "tomate")
- No discoverability of what ingredients already exist in the recipe collection

A searchable dropdown with autocomplete improves speed, consistency, and the overall recipe creation experience — especially on mobile.

## Proposed Solution

Use Nuxt UI's [`UInputMenu`](https://ui.nuxt.com/docs/components/input-menu) component with its `create-item` prop. This gives us:

- Searchable dropdown of existing ingredients
- Ability to type and create new ingredients not yet in the system
- Built-in keyboard navigation and mobile support

No database schema changes needed — ingredients stay as a JSON string array in the `recipes` table. A new API endpoint extracts unique ingredients from all recipes.

## Technical Approach

### 1. New API endpoint: `GET /api/ingredients`

**File:** `server/api/ingredients/index.get.ts`

Extracts unique, normalized ingredients from all saved recipes:

```typescript
import { db } from "~~/server/db";
import { recipes } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  const allRecipes = await db
    .select({ ingredients: recipes.ingredients })
    .from(recipes);

  const ingredientSet = new Set<string>();

  for (const recipe of allRecipes) {
    try {
      const parsed: string[] = JSON.parse(recipe.ingredients);
      for (const ingredient of parsed) {
        const normalized = ingredient.trim().toLowerCase();
        if (normalized) {
          ingredientSet.add(normalized);
        }
      }
    } catch {
      // Skip malformed JSON
    }
  }

  return [...ingredientSet].sort((a, b) => a.localeCompare(b, "es"));
});
```

**Returns:** `string[]` sorted alphabetically in Spanish locale.

**Normalization:** lowercase + trim. This deduplicates "Tomate", "tomate", and " tomate " into a single "tomate".

### 2. Update `RecipeForm.vue`

**File:** `app/components/RecipeForm.vue`

Replace each `UInput` in the ingredients v-for with `UInputMenu`:

```vue
<!-- Before -->
<UInput
  v-model="state.ingredients[index]"
  :placeholder="`Ingrediente ${index + 1}`"
  class="flex-1"
/>

<!-- After -->
<UInputMenu
  v-model="state.ingredients[index]"
  :items="availableIngredients"
  :loading="ingredientsLoading"
  create-item
  :placeholder="`Ingrediente ${index + 1}`"
  class="flex-1"
  @create="onCreateIngredient($event, index)"
/>
```

**Script changes:**

```typescript
// Fetch available ingredients on mount
const { data: availableIngredients, status } = await useFetch<string[]>(
  "/api/ingredients",
  { default: () => [] }
);
const ingredientsLoading = computed(() => status.value === "pending");

// Handle creating new ingredients
function onCreateIngredient(item: string, index: number) {
  const normalized = item.trim().toLowerCase();
  if (normalized && !availableIngredients.value.includes(normalized)) {
    availableIngredients.value.push(normalized);
    availableIngredients.value.sort((a, b) => a.localeCompare(b, "es"));
  }
  state.ingredients[index] = normalized;
}
```

### 3. Normalize ingredients on submission

In the submit handler, normalize before sending to API:

```typescript
const data = {
  ...event.data,
  ingredients: event.data.ingredients
    .map((i: string) => i.trim().toLowerCase())
    .filter((i: string) => i !== ""),
};
```

This ensures consistency regardless of how the ingredient was entered.

## Acceptance Criteria

- [ ] `GET /api/ingredients` returns a sorted, deduplicated list of all ingredients across recipes
- [ ] Recipe form ingredients use `UInputMenu` with search/filter
- [ ] Users can select existing ingredients from the dropdown
- [ ] Users can create new ingredients not in the list via `create-item`
- [ ] Ingredients are normalized (lowercase, trimmed) on save
- [ ] Works on both mobile and desktop
- [ ] Edit recipe form pre-populates with existing ingredient values
- [ ] Empty database (no recipes) allows creating ingredients via `create-item`
- [ ] Form validation still works (at least 1 non-empty ingredient required)

## Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Empty database (first recipe) | Dropdown shows no items; user creates all ingredients via `create-item` |
| Duplicate casing ("Tomate" / "tomate") | Normalized to "tomate" — single entry in dropdown |
| Ingredient with leading/trailing spaces | Trimmed before save and in API response |
| Malformed JSON in a recipe's ingredients | Skipped silently in API; doesn't break endpoint |
| API fetch fails | Form still works — `create-item` lets user type freely; empty dropdown |
| Very long ingredient list (100+) | UInputMenu handles this with built-in search filtering |

## Dependencies & Risks

- **Low risk:** No schema migration. Backward compatible — existing recipes work as-is since ingredients stay as JSON string arrays.
- **Nuxt UI dependency:** `UInputMenu` is available in `@nuxt/ui` v4.4.0 (already installed).
- **Mobile UX:** UInputMenu's dropdown behavior on mobile should be tested. Nuxt UI components are designed mobile-first, but the keyboard + dropdown interaction should be verified.

## Files to Modify

| File | Change |
|---|---|
| `server/api/ingredients/index.get.ts` | **New** — API endpoint |
| `app/components/RecipeForm.vue` | Replace `UInput` with `UInputMenu` for ingredients |

## References

- [UInputMenu docs](https://ui.nuxt.com/docs/components/input-menu) — `create-item` prop, `@create` event
- Brainstorm: `docs/brainstorms/2026-02-13-recetas-diarias-brainstorm.md`
- Current form: `app/components/RecipeForm.vue:154-185`
- Current API pattern: `server/api/recipes/index.post.ts`
- DB schema: `server/db/schema.ts`
