import { PantryItem, Recipe, AppSettings } from '../types';
import { INITIAL_PANTRY_ITEMS } from '../data/initialPantry';
import { SEEDED_RECIPES } from '../data/seedRecipes';

const STORAGE_KEY_PANTRY = 'smart_pantry_db_pantry_items_v1';
const STORAGE_KEY_SETTINGS = 'smart_pantry_db_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  expiryWarningDays: 3,
  measurementSystem: 'metric',
  theme: 'light',
  enableAlerts: true,
  autoDeductOnCook: true,
};

export class DatabaseHelper {
  private static instance: DatabaseHelper;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): DatabaseHelper {
    if (!DatabaseHelper.instance) {
      DatabaseHelper.instance = new DatabaseHelper();
    }
    return DatabaseHelper.instance;
  }

  private ensureInitialized(): void {
    const existing = localStorage.getItem(STORAGE_KEY_PANTRY);
    if (!existing) {
      this.resetToSampleData();
    }
  }

  // --- CRUD: CREATE ---
  public insertIngredient(item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>): PantryItem {
    const items = this.getAllIngredients();
    const newItem: PantryItem = {
      ...item,
      id: `pnt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    items.unshift(newItem);
    this.savePantryItems(items);
    return newItem;
  }

  // --- CRUD: READ ---
  public getAllIngredients(): PantryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PANTRY);
      if (!data) return [];
      return JSON.parse(data) as PantryItem[];
    } catch {
      return INITIAL_PANTRY_ITEMS;
    }
  }

  public getIngredientById(id: string): PantryItem | undefined {
    const items = this.getAllIngredients();
    return items.find((item) => item.id === id);
  }

  public getAllRecipes(): Recipe[] {
    return SEEDED_RECIPES;
  }

  public getRecipeById(id: string): Recipe | undefined {
    return SEEDED_RECIPES.find((rec) => rec.id === id);
  }

  // --- CRUD: UPDATE ---
  public updateIngredient(updated: PantryItem): boolean {
    const items = this.getAllIngredients();
    const index = items.findIndex((i) => i.id === updated.id);
    if (index === -1) return false;

    items[index] = {
      ...updated,
      updatedAt: Date.now(),
    };
    this.savePantryItems(items);
    return true;
  }

  // --- CRUD: DELETE ---
  public deleteIngredient(id: string): boolean {
    const items = this.getAllIngredients();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.savePantryItems(filtered);
    return true;
  }

  // --- BATCH DEDUCT FOR COOKING ---
  public deductRecipeIngredients(recipe: Recipe, servingsRatio = 1.0): { success: boolean; deducted: { name: string; amount: number; unit: string }[] } {
    const items = this.getAllIngredients();
    const deducted: { name: string; amount: number; unit: string }[] = [];

    // Clone array
    const updatedItems = [...items];

    for (const req of recipe.ingredients) {
      const reqAmount = req.quantity * servingsRatio;
      const target = updatedItems.find((p) => p.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(p.name.toLowerCase()));
      if (target) {
        target.quantity = Math.max(0, Number((target.quantity - reqAmount).toFixed(2)));
        target.updatedAt = Date.now();
        deducted.push({ name: target.name, amount: reqAmount, unit: req.unit });
      }
    }

    this.savePantryItems(updatedItems);
    return { success: true, deducted };
  }

  // --- RESET & UTILS ---
  public resetToSampleData(): void {
    this.savePantryItems(INITIAL_PANTRY_ITEMS);
  }

  public clearAllIngredients(): void {
    this.savePantryItems([]);
  }

  private savePantryItems(items: PantryItem[]): void {
    localStorage.setItem(STORAGE_KEY_PANTRY, JSON.stringify(items));
  }

  // Settings
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // SQLite Console Emulator for live inspector
  public executeRawSQL(query: string): { columns: string[]; rows: any[]; error?: string; rowCount: number } {
    const q = query.trim();
    if (!q) {
      return { columns: [], rows: [], rowCount: 0 };
    }

    const lower = q.toLowerCase();

    if (lower.startsWith('select')) {
      const items = this.getAllIngredients();

      if (lower.includes('from pantry_items')) {
        let resultRows = items.map((item, idx) => ({
          _id: idx + 1,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          expiry_date: item.expiryDate || 'NULL',
          created_at: item.createdAt,
        }));

        if (lower.includes('where')) {
          if (lower.includes("category = 'produce'")) {
            resultRows = resultRows.filter((r) => r.category.toLowerCase() === 'produce');
          } else if (lower.includes('quantity >')) {
            resultRows = resultRows.filter((r) => r.quantity > 0);
          }
        }

        const columns = ['_id', 'name', 'quantity', 'unit', 'category', 'expiry_date', 'created_at'];
        return {
          columns,
          rows: resultRows,
          rowCount: resultRows.length,
        };
      }

      if (lower.includes('from recipes')) {
        const recipes = this.getAllRecipes();
        const resultRows = recipes.map((r, idx) => ({
          _id: idx + 1,
          title: r.title,
          category: r.category,
          prep_time: r.prepTimeMinutes,
          cook_time: r.cookTimeMinutes,
          difficulty: r.difficulty,
          ingredients_count: r.ingredients.length,
        }));
        const columns = ['_id', 'title', 'category', 'prep_time', 'cook_time', 'difficulty', 'ingredients_count'];
        return { columns, rows: resultRows, rowCount: resultRows.length };
      }

      if (lower.includes('sqlite_master') || lower.includes('schema')) {
        return {
          columns: ['type', 'name', 'tbl_name', 'sql'],
          rows: [
            {
              type: 'table',
              name: 'pantry_items',
              tbl_name: 'pantry_items',
              sql: 'CREATE TABLE pantry_items (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT NOT NULL, category TEXT NOT NULL, expiry_date TEXT, created_at INTEGER, updated_at INTEGER, notes TEXT);',
            },
            {
              type: 'table',
              name: 'recipes',
              tbl_name: 'recipes',
              sql: 'CREATE TABLE recipes (_id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, prep_time INTEGER, cook_time INTEGER, servings INTEGER, difficulty TEXT, ingredients_json TEXT, steps_json TEXT, image_url TEXT, description TEXT);',
            },
          ],
          rowCount: 2,
        };
      }
    }

    return {
      columns: ['status', 'message'],
      rows: [{ status: 'OK', message: `Query parsed successfully. (1 table affected)` }],
      rowCount: 1,
    };
  }
}
