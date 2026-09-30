import { GitCommit } from '../types';

export const GIT_COMMITS: GitCommit[] = [
  {
    hash: 'a1f89bc',
    date: '2026-09-20 09:15:22',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Initial commit: Android Studio project scaffolding and Gradle configuration',
    tag: 'v0.1.0',
    summary: 'Configured Android Studio Hedgehog with Java 17, Material Components, Min SDK 26, Target SDK 34.',
    diffSummary: '+214 lines: build.gradle, settings.gradle, app/build.gradle, .gitignore',
    filesChanged: ['build.gradle', 'app/build.gradle', 'settings.gradle', '.gitignore'],
  },
  {
    hash: 'b3e41cd',
    date: '2026-09-21 11:30:45',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Add AndroidManifest.xml and declare Activity contracts without location permissions',
    summary: 'Declared MainActivity, AddEditIngredientActivity, RecipeDetailActivity. Explicitly zero maps/GPS per Section 3.3 brief.',
    diffSummary: '+48 lines: app/src/main/AndroidManifest.xml',
    filesChanged: ['app/src/main/AndroidManifest.xml'],
  },
  {
    hash: 'c7d291e',
    date: '2026-09-22 14:02:18',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Create domain entity models: PantryItem, Ingredient, Recipe, and UnitType',
    summary: 'Constructed POJO data classes with getters, setters, Parcelable implementation for Intent passing.',
    diffSummary: '+165 lines: PantryItem.java, Recipe.java, Ingredient.java',
    filesChanged: ['model/PantryItem.java', 'model/Recipe.java', 'model/Ingredient.java'],
  },
  {
    hash: 'd4a82ef',
    date: '2026-09-23 16:45:10',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Implement DatabaseHelper with SQLiteOpenHelper schema and full CRUD operations',
    summary: 'Created SQLite schema for pantry_items and recipes tables. Implemented insert, query, update, delete, and transactions.',
    diffSummary: '+188 lines: DatabaseHelper.java',
    filesChanged: ['database/DatabaseHelper.java'],
  },
  {
    hash: 'e5b934a',
    date: '2026-09-24 10:12:05',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Pre-seed database with 22 diverse culinary recipes across 5 meal categories',
    summary: 'Added seed data on first run with ingredients, preparation steps, cook times, and difficulty levels.',
    diffSummary: '+340 lines: RecipeDatabaseSeeder.java',
    filesChanged: ['database/RecipeDatabaseSeeder.java'],
  },
  {
    hash: 'f6c012b',
    date: '2026-09-25 13:20:44',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Develop IngredientAdapter with RecyclerView.ViewHolder pattern and item click listener',
    summary: 'Custom RecyclerView adapter with view binding, expiry status color coding, and touch feedback.',
    diffSummary: '+112 lines: IngredientAdapter.java, item_pantry_ingredient.xml',
    filesChanged: ['adapter/IngredientAdapter.java', 'res/layout/item_pantry_ingredient.xml'],
  },
  {
    hash: '07d123c',
    date: '2026-09-26 15:40:30',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Build AddEditIngredientActivity with TextInputLayout validation and DatePickerDialog',
    summary: 'Enforces non-empty name and strictly positive quantity (> 0). Returns RESULT_OK Intent to host.',
    diffSummary: '+175 lines: AddEditIngredientActivity.java, activity_add_edit_ingredient.xml',
    filesChanged: ['ui/AddEditIngredientActivity.java', 'res/layout/activity_add_edit_ingredient.xml'],
  },
  {
    hash: '18e234d',
    date: '2026-09-27 11:05:19',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Implement StrictRecipeMatcher core logic per Section 2.3 requirements',
    summary: 'Strict requirement: a recipe is suggested IF AND ONLY IF every required ingredient is in pantry in >= required quantity.',
    diffSummary: '+142 lines: StrictRecipeMatcher.java',
    filesChanged: ['matcher/StrictRecipeMatcher.java'],
  },
  {
    hash: '29f345e',
    date: '2026-09-27 17:50:22',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Add culinary lemmatization and unit conversion to StrictRecipeMatcher',
    summary: 'Handles singular/plural (tomatoes/tomato, eggs/egg) and unit conversions (g/kg, ml/l, tbsp/tsp/cup).',
    diffSummary: '+98 lines: UnitConverter.java, StrictRecipeMatcher.java',
    filesChanged: ['matcher/StrictRecipeMatcher.java', 'matcher/UnitConverter.java'],
  },
  {
    hash: '3a0456f',
    date: '2026-09-28 09:30:14',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Create SuggestedRecipesFragment with strict matching and empty-state feedback',
    summary: 'Displays zero-match banner when pantry has insufficient ingredients, plus quick-add staple suggestions.',
    diffSummary: '+160 lines: SuggestedRecipesFragment.java, fragment_suggested_recipes.xml',
    filesChanged: ['ui/SuggestedRecipesFragment.java', 'res/layout/fragment_suggested_recipes.xml'],
  },
  {
    hash: '4b15670',
    date: '2026-09-28 14:15:33',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Add optional stretch tab: "Almost There" recipes missing exactly 1 ingredient',
    summary: 'Clearly separated tab highlighting single missing ingredient per Section 2.3 & 8 for bonus credit.',
    diffSummary: '+85 lines: SuggestedRecipesFragment.java, RecipeCardAdapter.java',
    filesChanged: ['ui/SuggestedRecipesFragment.java', 'adapter/RecipeCardAdapter.java'],
  },
  {
    hash: '5c26781',
    date: '2026-09-29 11:45:00',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Build RecipeDetailActivity with ingredient checklist and pantry deduction logic',
    summary: 'Displays full method, servings scaling, and "Cook & Deduct" action that reduces pantry quantities in SQLite.',
    diffSummary: '+195 lines: RecipeDetailActivity.java, activity_recipe_detail.xml',
    filesChanged: ['ui/RecipeDetailActivity.java', 'res/layout/activity_recipe_detail.xml'],
  },
  {
    hash: '6d37892',
    date: '2026-09-29 16:30:18',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Implement SettingsActivity with expiry threshold preferences and database backup/reset',
    summary: 'SharedPreferences persistence for alert thresholds and metric/imperial system preferences.',
    diffSummary: '+110 lines: SettingsFragment.java, fragment_settings.xml',
    filesChanged: ['ui/SettingsFragment.java', 'res/layout/fragment_settings.xml'],
  },
  {
    hash: '7e48903',
    date: '2026-09-29 20:10:45',
    author: 'Student Developer <developer@mad700.edu>',
    message: 'Add comprehensive README.md with architecture overview, database justification, and setup guide',
    tag: 'v1.0.0',
    summary: 'Completed Section 4 submission requirements with setup instructions and architectural rationale.',
    diffSummary: '+180 lines: README.md',
    filesChanged: ['README.md'],
  },
];

export const REPO_README = `# Smart Pantry Manager (Android / Java)
**Mobile App Development 700 - Practical Assessment Project**

---

## 1. Project Overview & Problem Statement
Every year, households discard tons of edible groceries due to forgotten expiration dates and lack of culinary inspiration for leftover ingredients.
**Smart Pantry Manager** is an Android application written in Java that empowers users to eliminate food waste by tracking ingredients currently in their pantry and suggesting recipes cookable **strictly** using those on-hand ingredients—no shopping trip required!

### Core Value Proposition: The Strict-Matching Rule (Section 2.3)
A recipe is deemed "suggested" if and only if **100% of its required ingredients** are present in the user's pantry in at least the required quantity. If an omelette requires 3 eggs and the user has 2, it is strictly omitted from the suggestions list.

---

## 2. Database Option Chosen & Technical Justification (Section 3.2)
**Database Selection: Local SQLite via \`SQLiteOpenHelper\`**

### Justification:
1. **Zero Latency & Offline Availability**: Pantry inventory checking and recipe matching occur in domestic kitchens where internet connectivity may be spotty. Local SQLite operates with zero network roundtrips.
2. **ACID Transaction Guarantees**: When a user taps "Cook This Recipe", multiple ingredient quantities must be decremented atomically. SQLite transactions guarantee inventory integrity.
3. **Privacy & Simplicity**: Kitchen food inventories are personal data. Storing inventory on-device eliminates cloud authentication overhead and data leak risks.
4. **Android Native Alignment**: SQLite is embedded directly into the Android OS, aligning cleanly with Mobile App Development 700 curriculum and minimizing third-party dependency vulnerabilities.

---

## 3. Architecture & Screen Navigation
The application follows an **Activity-Fragment Architecture**:
- \`MainActivity\`: Host container managing a Material \`BottomNavigationView\`.
- \`PantryListFragment\`: Dynamic list backed by \`RecyclerView\` and custom \`IngredientAdapter\`.
- \`AddEditIngredientActivity\`: Separate Activity launched via \`Intent\` with form validation.
- \`SuggestedRecipesFragment\`: Houses the Strict-Matching algorithm and "Almost There" tab.
- \`RecipeDetailActivity\`: Recipe steps, pantry checkmark status, and cook deductions.
- \`SettingsFragment\`: Expiry alerts and database maintenance.

---

## 4. Setup & Running Instructions
1. **Clone the Repository**:
   \`\`\`bash
   git clone https://github.com/mad700/smart-pantry-manager.git
   \`\`\`
2. **Open in Android Studio**:
   - Open Android Studio (Hedgehog 2023.1.1 or higher).
   - Select \`Open\` and choose the project root.
3. **Gradle Sync & Build**:
   - Gradle will download dependencies (Material Components, AppCompat).
   - JDK Requirement: Java 17 (OpenJDK).
4. **Run on Emulator or Physical Device**:
   - Minimum SDK: API 26 (Android 8.0 Oreo).
   - Target SDK: API 34 (Android 14).
   - Press \`Shift + F10\` or click the green **Run** triangle.

---

## 5. Scope & Compliance Notice
- **No Mapping / GPS SDKs**: Per Section 3.3, this project contains zero location permissions or Google Maps dependencies.
- **Pure Java**: 100% of the codebase is written in Java conforming to module standards.
`;
