import React, { useState, useMemo } from 'react';
import { Recipe, PantryItem, MatchResult } from '../types';
import { evaluateRecipeMatch } from '../utils/strictMatcher';
import { Clock, ChefHat, CheckCircle2, AlertCircle, Sparkles, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

interface SuggestedRecipesScreenProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  onSelectRecipe: (recipe: Recipe) => void;
  onQuickAddStaple: (name: string, qty: number, unit: any, category: any) => void;
  onNavigateToPantry: () => void;
}

export const SuggestedRecipesScreen: React.FC<SuggestedRecipesScreenProps> = ({
  recipes,
  pantryItems,
  onSelectRecipe,
  onQuickAddStaple,
  onNavigateToPantry,
}) => {
  const [activeTab, setActiveTab] = useState<'strict' | 'almost'>('strict');
  const [selectedMealType, setSelectedMealType] = useState<string>('All');

  // Evaluate all recipes against current pantry state
  const evaluations = useMemo(() => {
    return recipes.map((recipe) => evaluateRecipeMatch(recipe, pantryItems));
  }, [recipes, pantryItems]);

  // Strict matches (100% ingredients satisfied)
  const strictMatches = useMemo(() => {
    return evaluations.filter((res) => res.isStrictMatch);
  }, [evaluations]);

  // "Almost There" matches (missing strictly 1 ingredient)
  const almostThereMatches = useMemo(() => {
    return evaluations.filter((res) => !res.isStrictMatch && res.missingCount === 1);
  }, [evaluations]);

  // Apply meal type filter
  const displayedMatches = useMemo(() => {
    const list = activeTab === 'strict' ? strictMatches : almostThereMatches;
    if (selectedMealType === 'All') return list;
    return list.filter((m) => m.recipe.category === selectedMealType);
  }, [activeTab, strictMatches, almostThereMatches, selectedMealType]);

  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="flex-1 flex flex-col p-3 pb-20 select-none">
      {/* Strict Matching Banner / Notice */}
      <div className="bg-emerald-900 text-white rounded-2xl p-3.5 mb-3 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald-200">
              Section 2.3 Strict Matching Engine
            </span>
          </div>
          <span className="text-[11px] font-mono bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
            {pantryItems.length} items evaluated
          </span>
        </div>
        <p className="text-xs text-emerald-100 leading-snug">
          Recipes are strictly suggested <strong>only if 100% of required ingredients</strong> are present in your pantry in sufficient quantity. No shopping required!
        </p>
      </div>

      {/* Segmented Control Tabs: Strict vs Almost There */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl mb-3">
        <button
          onClick={() => setActiveTab('strict')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'strict'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Suggestions ({strictMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('almost')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'almost'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Almost There ({almostThereMatches.length})</span>
        </button>
      </div>

      {/* Meal Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        {mealTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedMealType(type)}
            className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
              selectedMealType === type
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {displayedMatches.length === 0 ? (
        activeTab === 'strict' ? (
          /* Basic Feedback When Zero Recipes Match (Section 2.2 requirement) */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-5 bg-white rounded-2xl border border-slate-200 shadow-xs my-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
              No recipes match your pantry yet
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
              Every recipe in our catalog requires ingredients currently missing or short in quantity from your pantry.
            </p>

            {/* Actionable quick additions */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left mb-4">
              <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                1-Tap Staples to Unlock Strict Matches:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onQuickAddStaple('Egg', 6, 'pieces', 'Dairy & Eggs')}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <span>+ 6 Eggs</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={() => onQuickAddStaple('Spaghetti', 500, 'g', 'Grains & Pasta')}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <span>+ 500g Spaghetti</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={() => onQuickAddStaple('Garlic', 6, 'clove', 'Produce')}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <span>+ 6 Cloves Garlic</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={() => onQuickAddStaple('Butter', 250, 'g', 'Dairy & Eggs')}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <span>+ 250g Butter</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('almost')}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition-colors border border-emerald-200 flex items-center gap-1.5"
              >
                View Almost There ({almostThereMatches.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateToPantry}
                className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Go to Pantry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs my-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              No recipes missing only 1 ingredient
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add more varied items to your pantry to see close matches.
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {displayedMatches.map((match) => {
            const { recipe, isStrictMatch, ingredientMatches } = match;
            const missingItem = ingredientMatches.find((m) => !m.isSatisfied);

            return (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-400 transition-all cursor-pointer flex flex-col"
              >
                {/* Recipe Photo if available */}
                {recipe.imageUrl ? (
                  <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold drop-shadow-md truncate">{recipe.category}</span>
                      <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {recipe.cookTimeMinutes} mins
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">{recipe.category}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {recipe.cookTimeMinutes} mins
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-3.5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {recipe.description}
                      </p>
                    </div>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Strict Match vs Almost There indicator */}
                  {isStrictMatch ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ready to cook now (All {recipe.ingredients.length} ingredients in pantry)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Missing 1 item: <strong>{missingItem?.missingQty} {missingItem?.requiredUnit} {missingItem?.requiredName}</strong>
                      </span>
                    </div>
                  )}

                  {/* Ingredient pills summary */}
                  <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-slate-500">
                    {ingredientMatches.map((m, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          m.isSatisfied
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                        }`}
                      >
                        {m.isSatisfied ? '✓' : '✗'} {m.requiredName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
