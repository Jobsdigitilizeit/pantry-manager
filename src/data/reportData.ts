export interface AcademicReportSection {
  id: string;
  number: string;
  title: string;
  content: string;
}

export const ACADEMIC_REPORT_SECTIONS: AcademicReportSection[] = [
  {
    id: 'cover',
    number: '1',
    title: 'Cover Page',
    content: `
# SMART PANTRY MANAGER
### A Strict-Matching Mobile Application to Reduce Domestic Food Waste

**Course Module:** Mobile App Development 700 (MAD700)  
**Assessment:** Practical Assessment - Android Application Development  
**Student Name:** Alexander Morgan (Sample Student Submission)  
**Student Number:** MAD-700-2026-8842  
**Lecturer / Marker:** Practical Assessment Panel  
**Date of Submission:** September 29, 2026  
**Implementation Language:** Pure Java (Android SDK 34 / Java 17)  
**Repository Status:** Public GitHub Repository (14 Verified Commits)  
`,
  },
  {
    id: 'toc',
    number: '2',
    title: 'Table of Contents',
    content: `
1. Cover Page ............................................................................ Page 1
2. Table of Contents .................................................................... Page 2
3. Introduction & Problem Statement ..................................................... Page 3
   3.1 The Food Waste Challenge
   3.2 Target Audience & User Persona
   3.3 Value Proposition & Strict Matching
4. System Design & Architectural Modeling .............................................. Page 4
   4.1 Screen Navigation Flow
   4.2 Entity Relationship (ER) Diagram
   4.3 Activity & Intent Contract Structure
5. Output Demonstration & Screen Verification ........................................... Page 6
   5.1 Pantry Inventory Screen (RecyclerView)
   5.2 Add & Edit Ingredient Form (Input Validation)
   5.3 Suggested Recipes (Strict Matching Rule Verification)
   5.4 Recipe Detail & Pantry Quantity Deduction
   5.5 Settings & Threshold Customization
6. Key Code Snippets & Technical Commentary ............................................ Page 9
   6.1 Strict Matching Engine (StrictRecipeMatcher.java)
   6.2 Database Persistence Layer (DatabaseHelper.java)
   6.3 Dynamic List Binding (IngredientAdapter.java)
   6.4 Inter-Activity Communication (Intents & Result Contracts)
7. Development Challenges & Technical Solutions ......................................... Page 12
   7.1 Challenge 1: Unit Discrepancies & Dimensional Analysis
   7.2 Challenge 2: Singular vs. Plural Lemmatization in Natural Language
   7.3 Challenge 3: Activity Lifecycle State Synchronization
8. Conclusion & Critical Reflection .................................................... Page 14
   8.1 Project Achievements Against Requirements
   8.2 Future Enhancements (Barcode Scanner, OCR Expiry Detection)
9. Reference List & Academic Citations ................................................. Page 15
`,
  },
  {
    id: 'intro',
    number: '3',
    title: 'Introduction & Problem Statement',
    content: `
### 3.1 The Food Waste Challenge
According to the United Nations Environment Programme (UNEP) Food Waste Index, over one billion meals are squandered in domestic households every single day worldwide. In domestic settings, this waste is rarely intentional; rather, it stems from two systematic cognitive bottlenecks:
1. **Pantry Blindness**: Consumers lose track of perishables pushed to the back of refrigerators and cupboards, resulting in forgotten expiration dates.
2. **Recipe Impasse**: Traditional recipe websites and apps recommend dishes that require purchasing two or three missing novelty ingredients, triggering further unnecessary shopping trips and perpetuating the waste cycle.

### 3.2 Target Audience & Use Case
The *Smart Pantry Manager* is designed for students, busy professionals, and eco-conscious home cooks who wish to minimize domestic waste and grocery expenditures. The application acts as a zero-friction kitchen companion that maintains a digital mirror of household provisions.

### 3.3 Core Value Proposition: The Strict-Matching Rule
Unlike commercial recipe aggregators that prioritize advertising or sponsored grocery deliveries, the primary business logic of this application is governed by the **Strict-Matching Rule (Section 2.3 of the brief)**:
*A recipe may only be recommended if 100% of its required ingredients are already present in the user's pantry in at least the required quantity.*
If a recipe requires 5 items and the user possesses 4, the recipe is rigorously excluded from the suggestions list. This guarantees that the user can prepare any suggested meal immediately without stepping out of the front door.
`,
  },
  {
    id: 'design',
    number: '4',
    title: 'System Design & Architectural Modeling',
    content: `
### 4.1 Screen Navigation Flow
The application is structured into four primary Activities/Fragments anchored by an Android Material 3 navigation system:

\`\`\`
                       [ MainActivity (Host) ]
                                 │
     ┌───────────────────┬───────┴───────────┬───────────────────┐
     ▼                   ▼                   ▼                   ▼
[Pantry List]   [Suggested Recipes]   [All Recipes]       [Settings]
  (Fragment)         (Fragment)          (Fragment)       (Fragment)
     │                   │                   │
     │ (FAB / Edit)      │ (Select Recipe)   │ (Select Recipe)
     ▼                   ▼                   ▼
[AddEditActivity]   [RecipeDetailActivity] ◄─┘
 (Form Validation)   (Steps + Deduct Qty)
\`\`\`

### 4.2 Entity Relationship (ER) Diagram
The local database consists of two normalized tables managed via SQLiteOpenHelper:

\`\`\`
+-----------------------------------+        +-----------------------------------+
|         PANTRY_ITEMS              |        |             RECIPES               |
+-----------------------------------+        +-----------------------------------+
| _id          INTEGER (PK, AUTO)   |        | _id          INTEGER (PK, AUTO)   |
| name         TEXT NOT NULL        |        | title        TEXT NOT NULL        |
| quantity     REAL NOT NULL        |        | category     TEXT NOT NULL        |
| unit         TEXT NOT NULL        |        | prep_time    INTEGER              |
| category     TEXT NOT NULL        |        | cook_time    INTEGER              |
| expiry_date  TEXT (ISO 8601)      |        | servings     INTEGER              |
| notes        TEXT                 |        | difficulty   TEXT                 |
| created_at   INTEGER (Timestamp)  |        | description  TEXT                 |
+-----------------------------------+        | ingredients  TEXT (JSON Array)    |
                                             | steps        TEXT (JSON Array)    |
                                             +-----------------------------------+
\`\`\`

### 4.3 Activity & Intent Contract Structure
Data exchange between Activities adheres strictly to modern Android Intent protocols. When navigating to \`AddEditIngredientActivity\`, item parameters are bundled via \`intent.putExtra()\`. The editing Activity returns its state through \`setResult(RESULT_OK)\`, enabling the parent Fragment's \`onResume()\` to refresh the \`RecyclerView\` without database desynchronization.
`,
  },
  {
    id: 'screenshots',
    number: '5',
    title: 'Screenshots of Every Output & Core Function',
    content: `
*(Every output described below corresponds directly to live components running in the emulator demonstration)*

- **Figure 5.1: Pantry List Screen (\`PantryListFragment\`)**: Displays all stored ingredients in a dynamic \`RecyclerView\` bound to SQLite via \`IngredientAdapter\`. Badges visually highlight items nearing expiry (e.g. eggs expiring within 48 hours).
- **Figure 5.2: Add Ingredient Form with Input Validation (\`AddEditIngredientActivity\`)**: Demonstrates real-time \`TextInputLayout\` validation error triggered when attempting to save with a blank name or quantity $\\le 0$.
- **Figure 5.3: Suggested Recipes Screen with Strict Matching (\`SuggestedRecipesFragment\`)**: Displays only recipes where $100\\%$ of required ingredients are present in the pantry. Shows "3 Recipes Ready to Cook Now".
- **Figure 5.4: Basic Feedback When Zero Recipes Match**: Screen demonstration showing friendly actionable message: *"No recipes match your pantry yet - add more ingredients"*, accompanied by 1-tap staple recommendations.
- **Figure 5.5: Optional Stretch Tab: "Almost There" Recipes**: Demonstrates recipes missing exactly 1 ingredient, with a distinct visual chip denoting what is missing (e.g. *"Missing: 1 Bell Pepper"*).
- **Figure 5.6: Recipe Detail Screen (\`RecipeDetailActivity\`)**: In-depth breakdown with servings scaler, ingredient checklist matching user inventory, step-by-step instructions, and *"Cook This Recipe"* button that automatically deducts ingredients from SQLite.
- **Figure 5.7: Settings Screen (\`SettingsFragment\`)**: Expiry warning threshold slider, metric/imperial unit toggle, and SQLite sample data reset/backup controls.
`,
  },
  {
    id: 'code',
    number: '6',
    title: 'Key Code Snippets & Technical Commentary',
    content: `
### 6.1 Strict Matching Engine (\`StrictRecipeMatcher.java\`)
The centerpiece of the application is the algorithmic implementation of the strict-matching rule:

\`\`\`java
public static boolean isStrictMatch(Recipe recipe, List<PantryItem> pantry) {
    if (recipe == null || recipe.getIngredients() == null) return false;

    for (Ingredient required : recipe.getIngredients()) {
        String normReq = normalizeName(required.getName());
        double totalAvailable = 0.0;

        for (PantryItem item : pantry) {
            String normPantry = normalizeName(item.getName());
            if (normPantry.equals(normReq) || normPantry.contains(normReq)) {
                Double converted = convertUnit(item.getQuantity(), item.getUnit(), required.getUnit());
                if (converted != null) {
                    totalAvailable += converted;
                } else if (item.getQuantity() > 0) {
                    totalAvailable += item.getQuantity();
                }
            }
        }

        // Strict condition: if ANY single ingredient is under-supplied, reject immediately
        if (totalAvailable < required.getQuantity()) {
            return false;
        }
    }
    return true; // All required ingredients are fully satisfied
}
\`\`\`
*Commentary:* This snippet reflects the zero-tolerance requirement of Section 2.3. The loop evaluates each required ingredient sequentially; if total inventory fails to meet or exceed \`required.getQuantity()\`, the method terminates immediately, minimizing time complexity to $\\mathcal{O}(I \\times P)$ where $I$ is ingredients count and $P$ is pantry size.

### 6.2 SQLiteOpenHelper CRUD Implementation (\`DatabaseHelper.java\`)
The database helper encapsulates atomic data operations:

\`\`\`java
public long insertPantryItem(PantryItem item) {
    SQLiteDatabase db = this.getWritableDatabase();
    ContentValues cv = new ContentValues();
    cv.put(COL_NAME, item.getName());
    cv.put(COL_QUANTITY, item.getQuantity());
    cv.put(COL_UNIT, item.getUnit());
    cv.put(COL_CATEGORY, item.getCategory());
    cv.put(COL_EXPIRY, item.getExpiryDate());
    cv.put(COL_NOTES, item.getNotes());
    cv.put(COL_CREATED_AT, System.currentTimeMillis());
    return db.insert(TABLE_PANTRY, null, cv);
}
\`\`\`
*Commentary:* Standard \`ContentValues\` mapping prevents SQL injection attacks and provides typed column bindings consistent with the native Android persistent storage API.
`,
  },
  {
    id: 'challenges',
    number: '7',
    title: 'Challenges Encountered & Engineering Solutions',
    content: `
### 7.1 Challenge 1: Measurement Unit Incompatibilities
**Problem:** In culinary contexts, recipes frequently express quantities in volume (\`ml\`, \`tbsp\`, \`cups\`) while packaging uses mass (\`g\`, \`kg\`), or discrete counts (\`pieces\`). A naive equality check (\`item.unit.equals(req.unit)\`) led to false negative rejections, where a user with 500g of flour was rejected from a recipe requiring 0.5kg.
**Solution:** Developed a dedicated \`UnitConverter\` class with dimensional classification (Mass, Volume, Count). Mass is converted to a baseline gram scale ($1\\text{kg} = 1000\\text{g}$), volume to milliliters ($1\\text{tbsp} = 15\\text{ml}$, $1\\text{cup} = 240\\text{ml}$). Cross-conversions between count and weight are handled for common produce items (e.g. 1 can diced tomatoes $\\approx$ 400g).

### 7.2 Challenge 2: Singular vs. Plural Lexical Divergence
**Problem:** Users naturally input ingredients in varying lexical forms ("2 Tomatoes", "1 Tomato", "Egg", "Eggs", "Garlic cloves"). Strict string comparison (\`String.equals\`) failed to match "tomato" with "tomatoes", causing the strict matcher to erroneously disqualify valid recipes.
**Solution:** Implemented culinary lemmatization in \`StrictRecipeMatcher.normalizeName()\`. The algorithm strips adjectives ("fresh", "diced", "extra virgin") and normalizes suffixes using English grammatical rules (\`-ies\` $\\rightarrow$ \`-y\`, \`-es\` $\\rightarrow$ \`""\`, \`-s\` $\\rightarrow$ \`""\`), supplemented by a dictionary of irregular culinary terms.

### 7.3 Challenge 3: Activity Lifecycle Data Synchronization
**Problem:** When returning from \`AddEditIngredientActivity\` after updating an ingredient, the parent \`PantryListFragment\` occasionally retained stale data if queried solely in \`onCreateView()\`.
**Solution:** Migrated database reads to \`onResume()\` and registered an \`ActivityResultLauncher\` contract. This ensures that whenever the Activity returns to the foreground of the Android back stack, the \`RecyclerView\` adapter re-queries SQLite, guaranteeing instant UI consistency.
`,
  },
  {
    id: 'conclusion',
    number: '8',
    title: 'Conclusion & Reflection',
    content: `
### 8.1 Summary of Deliverables
The *Smart Pantry Manager* satisfies every technical and functional requirement specified in the Mobile App Development 700 brief:
- **100% Java Implementation**: Developed cleanly in Android Studio using Java 17 and Android SDK 34.
- **Genuine Persistence**: Utilizes native SQLite via \`SQLiteOpenHelper\`, preserving data across device reboots and app restarts.
- **Strict Matching Core Rule**: Enforces zero-tolerance leftover matching, eliminating recipe frustration.
- **Multi-Screen Navigation**: Features 5 distinct screens, dynamic \`RecyclerView\` with custom adapters, and Intent contracts.
- **Zero Disallowed APIs**: Contains strictly zero GPS or Google Maps SDK dependencies.

### 8.2 Future Enhancements
Given additional development time, the following features would extend the application:
1. **Barcode / UPC Scanner**: Integrating ML Kit Barcode Scanning to allow users to scan food packaging directly into the SQLite database.
2. **On-Device OCR Expiry Extraction**: Using CameraX to capture text from expiration labels and parse dates automatically.
`,
  },
  {
    id: 'references',
    number: '9',
    title: 'Reference List & Academic Citations',
    content: `
1. Android Developers. (2024). *Save data using SQLite*. Google LLC. Available at: https://developer.android.com/training/data-storage/sqlite (Accessed 24 September 2026).
2. Android Developers. (2024). *Create dynamic lists with RecyclerView*. Google LLC. Available at: https://developer.android.com/develop/ui/views/layout/recyclerview (Accessed 25 September 2026).
3. Android Developers. (2024). *The Activity Lifecycle*. Google LLC. Available at: https://developer.android.com/guide/components/activities/activity-lifecycle (Accessed 26 September 2026).
4. Bloch, J. (2018). *Effective Java*. 3rd ed. Boston: Addison-Wesley Professional.
5. Deitel, P. and Deitel, H. (2017). *Android How to Program with an Introduction to Java*. 3rd ed. Pearson Education.
6. United Nations Environment Programme (UNEP). (2024). *Food Waste Index Report 2024: Think Eat Save*. Nairobi: UNEP.
`,
  },
];

export const VIDEO_DEMO_SCRIPT = [
  {
    phase: '1. GitHub Walkthrough',
    targetDuration: '0:00 - 1:00 (1 min)',
    goal: 'Show GitHub repository, scroll through 10+ meaningful commits, and show README.md with database justification.',
    talkingPoints: [
      '"Hello, this is my video demonstration for Mobile App Development 700: Smart Pantry Manager, built in Java."',
      '"Starting here on GitHub, you can see our public repository with 14 genuine, incremental commits over the development lifecycle."',
      '"Each commit has a clear, descriptive message—from initializing Gradle and models, to building the SQLiteOpenHelper, to implementing the strict recipe matching rule."',
      '"The README.md documents the project architecture, setup instructions, and justifies our choice of local SQLite for zero-latency kitchen access and privacy."',
    ],
  },
  {
    phase: '2. Live App Demonstration (CRUD & Strict Matching)',
    targetDuration: '1:00 - 3:30 (2.5 mins)',
    goal: 'Demonstrate full CRUD cycle on pantry items and PROVE the strict-matching rule by adding/removing 1 ingredient on screen.',
    talkingPoints: [
      '"Now let\'s launch the live app. Here is our Pantry List screen showing current ingredients bound to SQLite via RecyclerView."',
      '"First, let\'s demonstrate the full CRUD cycle. To CREATE, I tap the Floating Action Button to launch AddEditIngredientActivity."',
      '"Let\'s test input validation: if I try to save an empty name or negative quantity, notice the clear error messages. Let\'s add 2 Bell Peppers, unit pieces, and save. It immediately appears in the list."',
      '"To READ and UPDATE, let\'s tap Bell Pepper to edit it: change quantity from 2 to 1 and save."',
      '"Now let\'s demonstrate the core value of the app: the Strict-Matching Rule (Section 2.3). Let\'s switch to Suggested Recipes."',
      '"Currently, Garden Vegetable Stir Fry requires 2 Bell Peppers, but our pantry only has 1. Because of strict matching, it does NOT appear in the suggestions list!"',
      '"Now let\'s go back to Pantry, edit Bell Pepper to 2 pieces, and return to Suggested Recipes: immediately, Garden Vegetable Stir Fry appears as ready to cook! This proves the strict-matching rule works dynamically."',
      '"Let\'s also demonstrate DELETE: swipe or tap delete on an item, and it is cleanly removed from the database."',
      '"Closing and reopening the app verifies that all changes persist genuinely in the SQLite database."',
    ],
  },
  {
    phase: '3. Concept Explanation (Code Walkthrough)',
    targetDuration: '3:30 - 5:45 (2.25 mins)',
    goal: 'Explain 3 core concepts in code: Activity Lifecycle, SQLite Database end-to-end, and the Strict-Matching Algorithm.',
    talkingPoints: [
      '"Now with the Java source code open, let\'s examine three key concepts:"',
      '"Concept 1: The Activity Lifecycle. In MainActivity and PantryListFragment, we re-query SQLite in onResume(). When the user finishes adding an ingredient in AddEditIngredientActivity, the fragment lifecycle transitions through onResume(), ensuring our list is automatically refreshed without stale state."',
      '"Concept 2: Database end-to-end. In DatabaseHelper.java, we extend SQLiteOpenHelper. onCreate() runs DDL statements to create our pantry_items and recipes tables. Our insert, query, update, and delete methods use ContentValues and Cursor to safely manage database rows."',
      '"Concept 3: The Strict-Matching Algorithm. Looking at StrictRecipeMatcher.java, the isStrictMatch() method loops through each required ingredient. It applies normalizeName() for singular/plural lemmatization and convertUnit() for volume and weight conversions. If even a single ingredient fails the condition totalAvailable >= required.quantity, the method returns false immediately. Only 100% matches are returned."',
    ],
  },
  {
    phase: '4. Database Justification',
    targetDuration: '5:45 - 6:30 (45 secs)',
    goal: 'Explain why SQLite was chosen over Firebase or PostgreSQL.',
    talkingPoints: [
      '"Finally, let\'s justify our database selection: We chose on-device SQLite via SQLiteOpenHelper."',
      '"Kitchen food management demands instantaneous, offline responsiveness without reliance on mobile data or wifi."',
      '"SQLite provides atomic ACID transactions when deducting recipe ingredients, guarantees total user privacy by keeping domestic grocery data on-device, and aligns seamlessly with native Android architecture without third-party cloud billing or API latency."',
      '"Thank you for watching the Smart Pantry Manager demonstration!"',
    ],
  },
];
