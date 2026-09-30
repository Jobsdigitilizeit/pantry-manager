import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, PantryItem, MatchResult } from '../types';
import { evaluateRecipeMatch } from '../utils/strictMatcher';
import { 
  Clock, 
  ChefHat, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  Square,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  pantryItems: PantryItem[];
  onCookRecipe: (recipe: Recipe, servingsRatio: number) => void;
  onBack: () => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  pantryItems,
  onCookRecipe,
  onBack,
}) => {
  const [servings, setServings] = useState<number>(recipe.servings);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Interactive Cooking Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(recipe.cookTimeMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInitial, setTimerInitial] = useState<number>(recipe.cookTimeMinutes * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const servingsRatio = servings / recipe.servings;

  // Evaluate match based on current servings
  const matchEvaluation = useMemo(() => {
    return evaluateRecipeMatch(recipe, pantryItems, servingsRatio);
  }, [recipe, pantryItems, servingsRatio]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-24 select-none overflow-y-auto">
      {/* Recipe Photo Header */}
      {recipe.imageUrl ? (
        <div className="relative h-48 w-full bg-slate-900">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
              {recipe.category}
            </span>
            <h2 className="text-lg font-bold leading-tight drop-shadow-sm">{recipe.title}</h2>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-800 text-white">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
            {recipe.category}
          </span>
          <h2 className="text-lg font-bold">{recipe.title}</h2>
        </div>
      )}

      <div className="p-4 flex flex-col gap-4">
        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          {recipe.description}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
            <span className="text-[11px] text-slate-500 block">Total Time</span>
            <span className="text-xs font-bold text-slate-800">
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <ChefHat className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
            <span className="text-[11px] text-slate-500 block">Difficulty</span>
            <span className="text-xs font-bold text-slate-800">{recipe.difficulty}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <Users className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
            <span className="text-[11px] text-slate-500 block">Servings</span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-700"
              >
                -
              </button>
              <span className="text-xs font-bold text-slate-800 tabular-nums">{servings}</span>
              <button
                onClick={() => setServings((s) => s + 1)}
                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Pantry Match Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-1.5 shadow-xs ${
            matchEvaluation.isStrictMatch
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {matchEvaluation.isStrictMatch ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-xs font-bold">
                {matchEvaluation.isStrictMatch
                  ? 'All Ingredients Available in Pantry!'
                  : `Missing ${matchEvaluation.missingCount} Ingredient${matchEvaluation.missingCount > 1 ? 's' : ''}`}
              </h3>
              <p className="text-[11px] opacity-90">
                {matchEvaluation.isStrictMatch
                  ? 'You have 100% of required quantities in your Firebase Firestore database.'
                  : 'Section 2.3 strict rule excludes this recipe from suggestions until restocked.'}
              </p>
            </div>
          </div>
        </div>

        {/* Ingredients Checklist */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Required Ingredients ({matchEvaluation.ingredientMatches.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Pantry Stock</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {matchEvaluation.ingredientMatches.map((ing, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {ing.isSatisfied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className={ing.isSatisfied ? 'text-slate-800 font-medium' : 'text-rose-700 font-semibold'}>
                    {ing.requiredQty} {ing.requiredUnit} {ing.requiredName}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-[11px] ${
                      ing.isSatisfied ? 'text-emerald-700 font-medium' : 'text-rose-600 font-semibold'
                    }`}
                  >
                    {ing.pantryQtyConverted} {ing.requiredUnit} in stock
                  </span>
                  {!ing.isSatisfied && (
                    <span className="block text-[10px] text-rose-500 font-medium">
                      Short by {ing.missingQty} {ing.requiredUnit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cook & Deduct Action Button */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2">
          <button
            onClick={() => onCookRecipe(recipe, servingsRatio)}
            disabled={!matchEvaluation.isStrictMatch}
            className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              matchEvaluation.isStrictMatch
                ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            {matchEvaluation.isStrictMatch
              ? 'Cook This Recipe (Auto-Deduct from Pantry)'
              : 'Cannot Cook: Missing Required Ingredients'}
          </button>
          <span className="text-[10px] text-center text-slate-400">
            Deducts recipe ingredients from Firebase Firestore database.
          </span>
        </div>

        {/* Interactive Cooking Timer */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Cooking Timer
              </span>
              <span className="text-xl font-mono font-bold tracking-wider text-emerald-300">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerInitial);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step-by-Step Preparation Method */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
            Preparation Steps ({recipe.steps.length})
          </h3>

          <div className="flex flex-col gap-3">
            {recipe.steps.map((step, idx) => {
              const isChecked = Boolean(completedSteps[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-400 line-through'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0 text-emerald-700">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-slate-500 mr-1.5">Step {idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
