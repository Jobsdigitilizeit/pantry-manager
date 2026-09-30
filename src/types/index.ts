export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'tbsp' | 'tsp' | 'cup' | 'pieces' | 'can' | 'clove' | 'slice' | 'pinch';

export type IngredientCategory = 
  | 'Produce' 
  | 'Dairy & Eggs' 
  | 'Meat & Seafood' 
  | 'Pantry Staples' 
  | 'Grains & Pasta'
  | 'Spices & Condiments' 
  | 'Bakery' 
  | 'Canned Goods';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  category: IngredientCategory;
  expiryDate?: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: UnitType;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: RecipeIngredient[];
  steps: string[];
  imageUrl?: string;
  description: string;
}

export interface MatchResult {
  recipe: Recipe;
  isStrictMatch: boolean;
  missingCount: number;
  ingredientMatches: {
    requiredName: string;
    requiredQty: number;
    requiredUnit: UnitType;
    pantryItem?: PantryItem;
    pantryQtyConverted: number;
    isSatisfied: boolean;
    missingQty: number;
  }[];
}

export interface AppSettings {
  expiryWarningDays: number;
  measurementSystem: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  enableAlerts: boolean;
  autoDeductOnCook: boolean;
}

export interface GitCommit {
  hash: string;
  date: string;
  author: string;
  message: string;
  tag?: string;
  summary: string;
  diffSummary: string;
  filesChanged: string[];
}

export interface IntentLog {
  id: string;
  timestamp: string;
  fromActivity: string;
  toActivity: string;
  action: string;
  extras: Record<string, any>;
}
