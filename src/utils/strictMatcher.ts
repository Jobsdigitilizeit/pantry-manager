import { PantryItem, Recipe, MatchResult, UnitType } from '../types';

/**
 * Normalizes culinary ingredient names by:
 * - Lowercasing and trimming
 * - Stripping adjectives like "fresh", "dried", "chopped", "diced", "grated", "cloves of", "extra virgin"
 * - Stemming common English food plurals (tomatoes -> tomato, eggs -> egg, etc.)
 */
export function normalizeIngredientName(rawName: string): string {
  if (!rawName) return '';
  let name = rawName.toLowerCase().trim();

  // Remove common culinary descriptor noise
  const descriptors = [
    'fresh', 'dried', 'dry', 'chopped', 'diced', 'minced', 'sliced', 'grated', 
    'shredded', 'crushed', 'boneless', 'skinless', 'extra virgin', 'raw',
    'cloves of', 'cloves', 'clove of', 'stalks of', 'heads of', 'head of'
  ];

  for (const desc of descriptors) {
    const regex = new RegExp(`\\b${desc}\\b`, 'gi');
    name = name.replace(regex, ' ');
  }

  name = name.replace(/\s+/g, ' ').trim();

  // Known irregular culinary plurals & mappings
  const irregulars: Record<string, string> = {
    'tomatoes': 'tomato',
    'potatoes': 'potato',
    'onions': 'onion',
    'eggs': 'egg',
    'lemons': 'lemon',
    'limes': 'lime',
    'apples': 'apple',
    'bananas': 'banana',
    'avocados': 'avocado',
    'avocadoes': 'avocado',
    'mushrooms': 'mushroom',
    'carrots': 'carrot',
    'bell peppers': 'bell pepper',
    'peppers': 'bell pepper',
    'scallions': 'scallion',
    'shallots': 'shallot',
    'sausages': 'sausage',
    'tortillas': 'tortilla',
    'berries': 'berry',
    'strawberries': 'strawberry',
    'blueberries': 'blueberry',
    'garlic cloves': 'garlic',
    'garlic clove': 'garlic',
    'garlic': 'garlic',
    'parmesan cheese': 'parmesan',
    'cheddar cheese': 'cheddar',
    'mozzarella cheese': 'mozzarella',
    'olive oil': 'olive oil',
    'vegetable oil': 'cooking oil',
    'canola oil': 'cooking oil',
    'cooking oil': 'cooking oil',
    'spaghetti': 'pasta',
    'fettuccine': 'pasta',
    'penne': 'pasta',
    'pasta noodles': 'pasta',
    'black pepper': 'black pepper',
    'ground black pepper': 'black pepper',
    'table salt': 'salt',
    'sea salt': 'salt',
    'kosher salt': 'salt',
  };

  if (irregulars[name]) {
    return irregulars[name];
  }

  // Standard plural stemming
  if (name.endsWith('ies')) {
    return name.slice(0, -3) + 'y';
  } else if (name.endsWith('es') && (name.endsWith('shes') || name.endsWith('ches') || name.endsWith('xes'))) {
    return name.slice(0, -2);
  } else if (name.endsWith('s') && !name.endsWith('ss')) {
    return name.slice(0, -1);
  }

  return name;
}

/**
 * Converts a quantity from fromUnit to toUnit.
 * Returns null if units are fundamentally incompatible (e.g. grams to pieces).
 */
export function convertUnit(quantity: number, fromUnit: UnitType, toUnit: UnitType): number | null {
  if (fromUnit === toUnit) return quantity;

  // Mass conversions
  const massToGrams: Partial<Record<UnitType, number>> = {
    'g': 1,
    'kg': 1000,
    'pinch': 0.5,
  };

  if (massToGrams[fromUnit] !== undefined && massToGrams[toUnit] !== undefined) {
    const inGrams = quantity * (massToGrams[fromUnit] || 1);
    return inGrams / (massToGrams[toUnit] || 1);
  }

  // Volume conversions (based on milliliters)
  const volumeToMl: Partial<Record<UnitType, number>> = {
    'ml': 1,
    'l': 1000,
    'tsp': 5,
    'tbsp': 15,
    'cup': 240,
  };

  if (volumeToMl[fromUnit] !== undefined && volumeToMl[toUnit] !== undefined) {
    const inMl = quantity * (volumeToMl[fromUnit] || 1);
    return inMl / (volumeToMl[toUnit] || 1);
  }

  // Count/Pieces conversions
  const countUnits: UnitType[] = ['pieces', 'can', 'clove', 'slice'];
  if (countUnits.includes(fromUnit) && countUnits.includes(toUnit)) {
    // If exact same count concept or 1-to-1 equivalence
    if (fromUnit === 'clove' && toUnit === 'pieces') return quantity;
    if (fromUnit === 'pieces' && toUnit === 'clove') return quantity;
    if (fromUnit === 'can' && toUnit === 'pieces') return quantity;
    return quantity;
  }

  // Cross-domain culinary allowances (e.g. 1 can diced tomatoes ≈ 400g)
  if (fromUnit === 'can' && toUnit === 'g') return quantity * 400;
  if (fromUnit === 'g' && toUnit === 'can') return quantity / 400;

  // 1 cup water/milk ≈ 240g
  if (fromUnit === 'g' && toUnit === 'ml') return quantity; // density 1.0 approx
  if (fromUnit === 'ml' && toUnit === 'g') return quantity;

  // If incompatible, return null
  return null;
}

/**
 * Checks whether a recipe matches the user's pantry under Section 2.3 Strict Matching Rules.
 */
export function evaluateRecipeMatch(
  recipe: Recipe,
  pantryItems: PantryItem[],
  servingsRatio = 1.0
): MatchResult {
  let isStrictMatch = true;
  let missingCount = 0;

  const ingredientMatches = recipe.ingredients.map((required) => {
    const requiredNormalized = normalizeIngredientName(required.name);
    const scaledRequiredQty = required.quantity * servingsRatio;

    // Find all matching pantry items by normalized name
    const candidateItems = pantryItems.filter((item) => {
      const pantryNormalized = normalizeIngredientName(item.name);
      return (
        pantryNormalized === requiredNormalized ||
        pantryNormalized.includes(requiredNormalized) ||
        requiredNormalized.includes(pantryNormalized)
      );
    });

    let totalAvailableInRequiredUnit = 0;
    let bestMatchingItem: PantryItem | undefined = candidateItems[0];

    for (const item of candidateItems) {
      const converted = convertUnit(item.quantity, item.unit, required.unit);
      if (converted !== null) {
        totalAvailableInRequiredUnit += converted;
        bestMatchingItem = item;
      } else {
        // Fallback for count units if names clearly match
        if (item.quantity > 0) {
          totalAvailableInRequiredUnit += item.quantity;
          bestMatchingItem = item;
        }
      }
    }

    const isSatisfied = totalAvailableInRequiredUnit >= scaledRequiredQty;
    const missingQty = Math.max(0, scaledRequiredQty - totalAvailableInRequiredUnit);

    if (!isSatisfied) {
      isStrictMatch = false;
      missingCount += 1;
    }

    return {
      requiredName: required.name,
      requiredQty: Number(scaledRequiredQty.toFixed(2)),
      requiredUnit: required.unit,
      pantryItem: bestMatchingItem,
      pantryQtyConverted: Number(totalAvailableInRequiredUnit.toFixed(2)),
      isSatisfied,
      missingQty: Number(missingQty.toFixed(2)),
    };
  });

  return {
    recipe,
    isStrictMatch,
    missingCount,
    ingredientMatches,
  };
}

/**
 * Filters recipes strictly according to Section 2.3.
 */
export function getStrictSuggestedRecipes(
  recipes: Recipe[],
  pantryItems: PantryItem[]
): MatchResult[] {
  return recipes
    .map((recipe) => evaluateRecipeMatch(recipe, pantryItems))
    .filter((res) => res.isStrictMatch);
}

/**
 * Optional Stretch Goal (Section 2.3 & 8): Recipes missing exactly 1 ingredient.
 */
export function getAlmostThereRecipes(
  recipes: Recipe[],
  pantryItems: PantryItem[]
): MatchResult[] {
  return recipes
    .map((recipe) => evaluateRecipeMatch(recipe, pantryItems))
    .filter((res) => !res.isStrictMatch && res.missingCount === 1);
}
