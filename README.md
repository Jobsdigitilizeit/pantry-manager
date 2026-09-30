# 🥫 Smart Pantry Manager

An Android app, written in **Java**, that helps reduce food waste. The user records the ingredients they already have at home, and the app suggests **only the recipes they can cook right now**, with no shopping trip required.

> Built for **Mobile App Development 700** (Practical Assignment).
> Author: **[Your Name]** · Student number: **[Your Student Number]**

---

## Table of Contents

1. [Features](#features)
2. [The strict-matching rule](#the-strict-matching-rule)
3. [Screenshots](#screenshots)
4. [Tech stack](#tech-stack)
5. [Project structure](#project-structure)
6. [Database design](#database-design)
7. [How it was built](#how-it-was-built)
8. [Getting started](#getting-started)
9. [Testing the matching logic](#testing-the-matching-logic)
10. [Known limitations and future work](#known-limitations-and-future-work)
11. [Author and licence](#author-and-licence)

---

## Features

- **Pantry management (full CRUD):** add, view, edit and delete ingredients (name, quantity, unit, optional expiry date).
- **Pantry list screen:** a `RecyclerView` with a custom adapter, bound to the database.
- **Seeded recipe collection:** 15–20 recipes loaded into the database on first launch, each with ingredients and preparation steps.
- **Suggested Recipes screen:** lists only the recipes that pass the strict-matching rule.
- **Recipe Detail screen:** full ingredient list and method for the selected recipe.
- **Settings screen:** expiring-soon alert toggle and preferred units.
- **Empty states:** friendly messages when the pantry is empty or when no recipes match.
- **Input validation** on the Add/Edit form.
- **Persistent storage:** data survives closing and reopening the app.
- **Bottom navigation** between the main screens.

> The app deliberately does **not** use Google Maps, mapping SDKs, or device location/GPS. Its scope is only the user's pantry and recipe matching.

---

## The strict-matching rule

A recipe is suggested **only if every ingredient it needs is in the pantry, in at least the required quantity.**

| Recipe needs | Pantry has | Suggested? |
|---|---|---|
| 5 ingredients | all 5 | ✅ Yes |
| 5 ingredients | 4 of 5 | ❌ No, one missing ingredient means it is excluded |
| 400 g flour | 0.5 kg flour | ✅ Yes, units are converted before comparing |
| 1 tomato | "Tomatoes" | ✅ Yes, singular/plural names are normalised |
| 500 g flour | 200 g flour | ❌ No, not enough quantity |

The matching is tolerant of everyday messiness:

- **Case and spacing:** `" Tomato "` and `"tomato"` are the same ingredient.
- **Plurals:** `tomatoes → tomato`, `berries → berry`, `carrots → carrot`.
- **Units:** `kg ↔ g`, `l ↔ ml`, and `cup / tbsp / tsp → ml` are converted to a base unit. Units of different kinds (mass vs volume vs count) are never compared with each other.
- **Duplicates:** two separate entries of the same ingredient are added together.

---

## Screenshots

> Replace these with your own screenshots from the running app (save them in a `/screenshots` folder).

| Pantry List | Add Ingredient | Validation Error |
|---|---|---|
| ![Pantry list](screenshots/pantry_list.png) | ![Add ingredient](screenshots/add_item.png) | ![Validation error](screenshots/validation.png) |

| Suggested Recipes | Recipe Detail | Settings |
|---|---|---|
| ![Suggested recipes](screenshots/suggested.png) | ![Recipe detail](screenshots/recipe_detail.png) | ![Settings](screenshots/settings.png) |

---

## Tech stack

| Area | Choice |
|---|---|
| Language | Java (no Kotlin) |
| IDE | Android Studio |
| Database | SQLite via the **Room** persistence library (local, on-device) |
| UI | `RecyclerView` + custom adapters, `ConstraintLayout` / `LinearLayout`, Material Components |
| Navigation | Bottom navigation bar + Intents with extras |
| Settings storage | `SharedPreferences` |
| Min SDK | [e.g. API 24 (Android 7.0)] |
| Target SDK | [e.g. API 34] |

---

## Project structure

> Adjust this tree so it matches your actual package and file names.

```
SmartPantryManager/
├── app/
│   └── src/main/
│       ├── java/com/example/smartpantry/
│       │   ├── data/
│       │   │   ├── AppDatabase.java          # Room database + first-run seeding
│       │   │   ├── PantryItem.java           # Entity
│       │   │   ├── PantryDao.java            # CRUD queries
│       │   │   ├── Recipe.java               # Entity
│       │   │   ├── RecipeIngredient.java     # Entity (FK -> Recipe)
│       │   │   ├── RecipeWithIngredients.java# Room relation
│       │   │   └── RecipeDao.java
│       │   ├── logic/
│       │   │   ├── RecipeMatcher.java        # Strict-matching algorithm
│       │   │   ├── UnitUtils.java            # Unit conversion + unit families
│       │   │   └── TextUtils2.java           # Name normalisation
│       │   ├── ui/
│       │   │   ├── MainActivity.java         # Pantry list (home)
│       │   │   ├── AddEditItemActivity.java  # Add / edit form + validation
│       │   │   ├── SuggestedRecipesActivity.java
│       │   │   ├── RecipeDetailActivity.java
│       │   │   ├── SettingsActivity.java
│       │   │   ├── PantryAdapter.java        # RecyclerView adapter
│       │   │   └── RecipeAdapter.java        # RecyclerView adapter
│       ├── res/
│       │   ├── layout/                       # XML layouts for each screen + list rows
│       │   ├── menu/                         # Bottom navigation menu
│       │   └── values/                       # strings, colours, themes
│       └── AndroidManifest.xml
├── screenshots/
├── build.gradle
└── README.md
```

---

## Database design

Three tables, all managed by Room:

**`pantry_items`**

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | Auto-generated |
| `name` | TEXT | As typed by the user |
| `normalizedName` | TEXT | Lower-case singular form, used for matching |
| `quantity` | REAL | Must be greater than 0 |
| `unit` | TEXT | g, kg, ml, l, tsp, tbsp, cup, pcs |
| `expiryDate` | TEXT | Optional, `yyyy-MM-dd` |

**`recipes`**

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | Auto-generated |
| `name` | TEXT | Recipe title |
| `steps` | TEXT | One step per line |

**`recipe_ingredients`**

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | Auto-generated |
| `recipeId` | INTEGER (FK) | References `recipes.id` (cascade delete) |
| `name` / `normalizedName` | TEXT | Display name and matching name |
| `quantity` | REAL | Amount required |
| `unit` | TEXT | Unit of the required amount |

One recipe has many recipe ingredients (1 : N). Pantry items are **not** linked to recipes with a foreign key. They are compared at run time by the matching logic.

---

## How it was built

This is the order the project was developed in, so you can follow (or reproduce) the process.

### 1. Planning
- Read the assignment brief and listed the required screens, CRUD operations and the strict-matching rule.
- Sketched the screen flow (Pantry List → Add/Edit, Suggested Recipes → Recipe Detail, plus Settings) and the data model (three tables).
- Chose SQLite with Room because it is local, needs no server, and matches the module's persistent-data content.

### 2. Project setup
- Created a new Android Studio project (**Empty Views Activity**, language **Java**).
- Added the Room and Material dependencies in `app/build.gradle`:

```groovy
dependencies {
    implementation "androidx.room:room-runtime:2.6.1"
    annotationProcessor "androidx.room:room-compiler:2.6.1"
    implementation "com.google.android.material:material:1.11.0"
    implementation "androidx.recyclerview:recyclerview:1.3.2"
}
```

### 3. Database layer (Room)
- Wrote the entities (`PantryItem`, `Recipe`, `RecipeIngredient`), the relation class `RecipeWithIngredients`, and the DAOs.
- Built `AppDatabase` as a singleton.
- Added first-run seeding: a `RoomDatabase.Callback` inserts the 15–20 recipes the first time the database is created.
- Ran all database calls on a background thread (`ExecutorService`) so the UI never freezes.

### 4. Matching logic (plain Java, no Android dependencies)
- **`TextUtils2.normalise()`** trims, lower-cases and singularises names.
- **`UnitUtils`** converts units to a base unit and groups them into families (mass, volume, count).
- **`RecipeMatcher.findMakeable()`** builds a stock map from the pantry, then keeps a recipe only if every ingredient is covered. One missing or insufficient ingredient rejects the recipe immediately.
- Kept this logic separate from the UI so it is easy to test.

### 5. Screens and layouts
- **Pantry List:** `RecyclerView` + `PantryAdapter`, floating action button to add, tap an item to edit, and delete with a confirmation dialog.
- **Add/Edit Ingredient:** form with name, quantity, unit spinner and optional date picker. Validation shows errors directly on the field with `setError()`.
- **Suggested Recipes:** loads the pantry, runs `RecipeMatcher`, and shows either the list or an empty-state message.
- **Recipe Detail:** receives the recipe ID via an Intent extra and displays ingredients and steps.
- **Settings:** stores the alert toggle and unit preference in `SharedPreferences`.
- **Navigation:** bottom navigation bar for the three main screens; Intents with extras for the detail and edit screens.

### 6. Testing
- Manually tested every CRUD operation, each validation rule, and both empty states.
- Tested the strict-matching rule with edge cases (see the next section).
- Closed and reopened the app to confirm that data persists.
- Took screenshots of every screen and function for the report.

### 7. Documentation
- Wrote the assignment report (cover, introduction, system design with diagrams, screenshots, key code snippets) and this README.

---

## Getting started

### Prerequisites
- [Android Studio](https://developer.android.com/studio) (latest stable)
- JDK 17 (bundled with recent Android Studio)
- An emulator or a physical Android device running API 24 or higher

### Run the app

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/SmartPantryManager.git

# 2. Open the folder in Android Studio
#    File > Open > select SmartPantryManager

# 3. Let Gradle sync finish

# 4. Press Run (green triangle) and pick an emulator or device
```

On first launch the recipe database is seeded automatically. No account, network connection or API key is needed.

---

## Testing the matching logic

Try these scenarios in the running app to verify the strict rule:

1. **Empty pantry:** Suggested Recipes shows the "No recipes match your pantry yet" message.
2. **Complete match:** add every ingredient of one recipe. It appears in the suggestions.
3. **One ingredient missing:** remove one ingredient from step 2. The recipe disappears.
4. **Insufficient quantity:** reduce an ingredient below what the recipe needs. The recipe disappears.
5. **Plural names:** add `Tomatoes` when the recipe needs `tomato`. It still matches.
6. **Unit conversion:** add `0.5 kg` flour for a recipe needing `400 g`. It still matches.
7. **Persistence:** close the app completely and reopen it. All data is still there.

---

## Known limitations and future work

- Plural handling uses simple suffix rules, so irregular plurals (e.g. "leaves", "loaves") may not normalise correctly.
- Unit conversion uses fixed approximations (e.g. 1 cup = 250 ml) and does not convert between mass and volume.
- The recipe collection is fixed. Users cannot add their own recipes yet.
- **Possible improvements:**
  - an "Almost There" list for recipes missing exactly one ingredient, clearly separated from the strict suggestions;
  - expiring-soon notifications using `WorkManager`;
  - deducting used ingredients from the pantry after cooking a recipe;
  - user-created recipes and a search/filter bar.

---

## Author and licence

**[Your Name]** · [Your Student Number] · [Your Institution]
Module: Mobile App Development 700

This project was created for educational purposes as part of a university assessment.
[Add a licence here if you want one, e.g. MIT, or delete this line.]
