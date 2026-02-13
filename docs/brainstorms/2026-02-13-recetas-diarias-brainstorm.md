# Recetas Diarias - Brainstorm

**Date:** 2026-02-13
**Status:** Draft

## What We're Building

A personal, mobile-first webapp for managing recipes and meal planning. The app helps the user (single user, no auth needed) stop stressing about what to cook by:

1. **Recipe management** — Add, edit, and browse recipes with details like time, ingredients, difficulty, meal type, photo, and personal notes.
2. **Weekly meal plan generation** — Use Gemini AI to generate a balanced weekly plan from the user's recipe collection, considering variety, difficulty, and meal types.
3. **Random recipe picker** — A fun "what should I cook?" button that picks a random recipe when you just need a quick suggestion.

**Language:** All UI in Spanish.
**Primary device:** Phone (mobile-first design, also works on desktop).

## Why This Approach

**Full-stack Nuxt 4 + SQLite (Approach A):**

- **Single deployable unit** — One Nuxt app handles both frontend and backend via server routes. No separate API to maintain.
- **SQLite via Drizzle ORM** — Simple file-based database. No external DB service needed. Perfect for a single-user personal app.
- **Gemini API (server-side)** — Weekly plan generation calls Gemini from Nuxt server routes. API key stays safe on the server.
- **Nuxt UI + Tailwind CSS** — Already installed. Provides beautiful, accessible components out of the box. Mobile-first responsive design.
- **Minimal infrastructure** — Can be deployed to any VPS, Railway, Coolify, or similar. Low cost, low maintenance.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Users | Single user, no auth | Personal app for one person. No login needed. |
| Storage | SQLite + Drizzle ORM | Simple, reliable, no external dependencies. |
| AI provider | Gemini | User preference. Used server-side for plan generation. |
| UI language | Spanish | User's girlfriend's primary language. |
| Device priority | Mobile-first | She'll use it mostly from her phone in the kitchen. |
| Architecture | Full-stack Nuxt | Single app, server routes for API, simplest to build and deploy. |

## Recipe Data Model

| Field | Type | Notes |
|---|---|---|
| id | auto-increment | Primary key |
| name | string | Recipe name |
| ingredients | text/JSON | List of ingredients |
| time | integer | Prep/cook time in minutes |
| difficulty | enum | Easy / Medium / Hard |
| mealType | enum | Breakfast / Lunch / Dinner / Snack |
| photo | string (file path) | Optional uploaded photo of the dish |
| notes | text | Optional personal notes/tips |
| createdAt | timestamp | When it was added |

## Core Features

### 1. Recipe CRUD
- Add new recipes with all fields (name, time, ingredients, difficulty, meal type, photo, notes)
- Edit existing recipes
- Delete recipes
- Browse/search recipe list

### 2. Weekly Plan Generation (AI)
- Button to generate a new weekly plan (Monday-Sunday)
- Covers **lunch and dinner** each day (14 meals per week). Breakfast excluded — usually simple/routine.
- Sends recipe list to Gemini API with a prompt asking for a balanced week
- Considers: meal types, difficulty distribution, variety
- Displays the plan in a clear weekly calendar view
- Ability to regenerate the entire plan or tap a single meal slot to get a different suggestion

### 3. Random Recipe Picker
- Fun "surprise me" button
- Optionally filter by meal type or difficulty before randomizing
- Shows the selected recipe with a nice animation/reveal

## Resolved Questions

1. **Photo storage** — File upload from her phone, stored on the server. More convenient for kitchen use.
2. **Plan history** — Just the current plan. One active plan at a time, she can regenerate anytime. Keeps things simple.
3. **Plan structure** — Lunch + Dinner per day (14 meals/week). Breakfast excluded as it's usually simple/routine.

## Out of Scope (for now)

- User authentication / multi-user
- Shopping list generation from the weekly plan
- Recipe import from URLs
- Internationalization (i18n)
- Offline/PWA support
