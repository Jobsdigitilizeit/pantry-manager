/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PantryItem, Recipe, AppSettings } from './types';
import { FirestorePantryService } from './services/firestoreDatabase';
import { evaluateRecipeMatch } from './utils/strictMatcher';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { AndroidBottomNav, ScreenTab } from './components/AndroidBottomNav';
import { PantryListScreen } from './components/PantryListScreen';
import { AddEditIngredientScreen } from './components/AddEditIngredientScreen';
import { SuggestedRecipesScreen } from './components/SuggestedRecipesScreen';
import { RecipeDetailScreen } from './components/RecipeDetailScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DEFAULT_SETTINGS } from './utils/database';
import { 
  Smartphone, 
  CheckCircle2,
  Cloud
} from 'lucide-react';

export default function App() {
  const firestoreService = FirestorePantryService.getInstance();

  const [deviceFullscreen, setDeviceFullscreen] = useState(false);

  // Android Mobile App State
  const [currentTab, setCurrentTab] = useState<ScreenTab>('pantry');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);

  // Sub-Activity State (Simulating Activity Stacks via Intents)
  const [activeSubActivity, setActiveSubActivity] = useState<
    'none' | 'add_ingredient' | 'edit_ingredient' | 'recipe_detail'
  >('none');
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and connect to Firebase Firestore
  useEffect(() => {
    let unsubscribePantry: (() => void) | undefined;
    let unsubscribeRecipes: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const setupFirestore = async () => {
      try {
        await firestoreService.initializeDatabase();
        setIsFirebaseSynced(true);

        unsubscribePantry = firestoreService.subscribeToPantry((items) => {
          setPantryItems(items);
        });

        unsubscribeRecipes = firestoreService.subscribeToRecipes((recs) => {
          setRecipes(recs);
        });

        unsubscribeSettings = firestoreService.subscribeToSettings((cfg) => {
          setSettings(cfg);
        });
      } catch (err) {
        console.error('Failed to setup Firebase listeners:', err);
      }
    };

    setupFirestore();

    return () => {
      if (unsubscribePantry) unsubscribePantry();
      if (unsubscribeRecipes) unsubscribeRecipes();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- CRUD: CREATE / UPDATE IN FIRESTORE ---
  const handleSaveIngredient = async (
    itemData: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    try {
      if (id) {
        const existing = pantryItems.find((i) => i.id === id);
        if (existing) {
          await firestoreService.updatePantryItem({ ...existing, ...itemData });
          showToast(`Updated "${itemData.name}" in Firebase`);
        }
      } else {
        await firestoreService.insertPantryItem(itemData);
        showToast(`Added "${itemData.name}" to Firebase Pantry`);
      }
      setActiveSubActivity('none');
      setEditingItem(null);
    } catch (err) {
      showToast('Error saving to Firebase');
      console.error(err);
    }
  };

  // --- CRUD: DELETE IN FIRESTORE ---
  const handleDeleteIngredient = async (id: string) => {
    try {
      const item = pantryItems.find((i) => i.id === id);
      await firestoreService.deletePantryItem(id);
      if (item) {
        showToast(`Deleted "${item.name}" from Firebase`);
      }
      if (activeSubActivity === 'edit_ingredient') {
        setActiveSubActivity('none');
        setEditingItem(null);
      }
    } catch (err) {
      showToast('Error deleting from Firebase');
      console.error(err);
    }
  };

  // --- CRUD: UPDATE QUANTITY DIRECTLY IN FIRESTORE ---
  const handleUpdateQuantity = async (id: string, newQty: number) => {
    const item = pantryItems.find((i) => i.id === id);
    if (!item) return;
    try {
      await firestoreService.updatePantryItem({ ...item, quantity: newQty });
    } catch (err) {
      console.error('Failed to update quantity in Firebase:', err);
    }
  };

  // --- NAVIGATION / INTENTS ---
  const handleOpenAdd = () => {
    setActiveSubActivity('add_ingredient');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: PantryItem) => {
    setActiveSubActivity('edit_ingredient');
    setEditingItem(item);
  };

  const handleOpenRecipeDetail = (recipe: Recipe) => {
    setActiveSubActivity('recipe_detail');
    setSelectedRecipe(recipe);
  };

  const handleBackToMain = () => {
    setActiveSubActivity('none');
    setEditingItem(null);
    setSelectedRecipe(null);
  };

  // --- COOKING & DEDUCTION IN FIRESTORE ---
  const handleCookRecipe = async (recipe: Recipe, servingsRatio: number) => {
    try {
      const success = await firestoreService.deductRecipeIngredients(recipe, pantryItems, servingsRatio);
      if (success) {
        showToast(`Cooked "${recipe.title}"! Deducted from Firebase Pantry.`);
        setActiveSubActivity('none');
        setSelectedRecipe(null);
      }
    } catch (err) {
      showToast('Failed to deduct from Firebase');
      console.error(err);
    }
  };

  // --- PRESETS & TEST SCENARIOS IN FIRESTORE ---
  const handleLoadScenario = async (scenario: 'default' | 'empty' | 'restock_pepper') => {
    try {
      if (scenario === 'default') {
        await firestoreService.resetToSampleData();
        showToast('Reset Firebase Pantry to Seed Data');
      } else if (scenario === 'empty') {
        await firestoreService.clearAllPantryItems();
        await firestoreService.insertPantryItem({
          name: 'Apple',
          quantity: 1,
          unit: 'pieces',
          category: 'Produce',
        });
        showToast('Loaded Zero-Match Pantry in Firebase');
      } else if (scenario === 'restock_pepper') {
        const existing = pantryItems.find((i) => i.name.toLowerCase().includes('bell pepper'));
        if (existing) {
          await firestoreService.updatePantryItem({ ...existing, quantity: 2 });
        } else {
          await firestoreService.insertPantryItem({
            name: 'Bell Pepper',
            quantity: 2,
            unit: 'pieces',
            category: 'Produce',
          });
        }
        showToast('Added Bell Pepper to Firebase! Stir Fry qualified!');
      }
    } catch (err) {
      console.error('Failed to load scenario in Firebase:', err);
    }
  };

  const handleQuickAddStaple = async (name: string, qty: number, unit: any, category: any) => {
    try {
      await firestoreService.insertPantryItem({ name, quantity: qty, unit, category });
      showToast(`Added ${qty} ${unit} of ${name} to Firebase!`);
    } catch (err) {
      console.error('Failed to quick add staple to Firebase:', err);
    }
  };

  const handleExportPantry = () => {
    const json = JSON.stringify(pantryItems, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase_pantry_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Firebase pantry backup JSON!');
  };

  // Strict match count calculation
  const strictRecipesCount = useMemo(() => {
    return recipes.filter((r) => evaluateRecipeMatch(r, pantryItems).isStrictMatch).length;
  }, [recipes, pantryItems]);

  const expiringCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return pantryItems.filter((i) => {
      if (!i.expiryDate) return false;
      const exp = new Date(i.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= settings.expiryWarningDays && diffDays >= 0;
    }).length;
  }, [pantryItems, settings.expiryWarningDays]);

  // Current screen title & activity for Android top bar
  const activeScreenInfo = useMemo(() => {
    if (activeSubActivity === 'add_ingredient') {
      return { title: 'Add Ingredient', activity: 'AddEditIngredientActivity.java' };
    }
    if (activeSubActivity === 'edit_ingredient') {
      return { title: `Edit: ${editingItem?.name || 'Item'}`, activity: 'AddEditIngredientActivity.java' };
    }
    if (activeSubActivity === 'recipe_detail') {
      return { title: selectedRecipe?.title || 'Recipe Details', activity: 'RecipeDetailActivity.java' };
    }

    switch (currentTab) {
      case 'pantry':
        return { title: 'Pantry Inventory', activity: 'PantryListFragment.java' };
      case 'suggested':
        return { title: 'Strict Suggestions', activity: 'SuggestedRecipesFragment.java' };
      case 'settings':
        return { title: 'App Settings', activity: 'SettingsFragment.java' };
    }
  }, [activeSubActivity, editingItem, selectedRecipe, currentTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar: Just App Name and Live Android App */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-50">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white">
            Smart Pantry Manager
          </span>
          {isFirebaseSynced && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Firebase</span>
            </span>
          )}
        </div>

        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white shadow-xs flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Live Android App</span>
        </span>
      </header>

      {/* Main Viewport: Centered Android Device without UX clutter */}
      <main className="flex-1 flex items-center justify-center overflow-hidden p-2 md:p-4">
        <div className="w-full flex items-center justify-center">
          <AndroidDeviceFrame
            activeScreenTitle={activeScreenInfo.title}
            currentActivityName={activeScreenInfo.activity}
            showBack={activeSubActivity !== 'none'}
            onBack={handleBackToMain}
            isFullscreen={deviceFullscreen}
            onToggleFullscreen={() => setDeviceFullscreen(!deviceFullscreen)}
          >
            {/* Active Sub-Activity Screens vs Primary Tabs */}
            {activeSubActivity === 'add_ingredient' && (
              <AddEditIngredientScreen
                onSave={handleSaveIngredient}
                onCancel={handleBackToMain}
              />
            )}

            {activeSubActivity === 'edit_ingredient' && (
              <AddEditIngredientScreen
                initialItem={editingItem}
                onSave={handleSaveIngredient}
                onDelete={handleDeleteIngredient}
                onCancel={handleBackToMain}
              />
            )}

            {activeSubActivity === 'recipe_detail' && selectedRecipe && (
              <RecipeDetailScreen
                recipe={selectedRecipe}
                pantryItems={pantryItems}
                onCookRecipe={handleCookRecipe}
                onBack={handleBackToMain}
              />
            )}

            {activeSubActivity === 'none' && (
              <>
                {currentTab === 'pantry' && (
                  <PantryListScreen
                    items={pantryItems}
                    onAddNew={handleOpenAdd}
                    onEditItem={handleOpenEdit}
                    onDeleteItem={handleDeleteIngredient}
                    onUpdateQuantity={handleUpdateQuantity}
                    onLoadQuickStaples={() => handleLoadScenario('default')}
                    warningDaysThreshold={settings.expiryWarningDays}
                  />
                )}

                {currentTab === 'suggested' && (
                  <SuggestedRecipesScreen
                    recipes={recipes}
                    pantryItems={pantryItems}
                    onSelectRecipe={handleOpenRecipeDetail}
                    onQuickAddStaple={handleQuickAddStaple}
                    onNavigateToPantry={() => setCurrentTab('pantry')}
                  />
                )}

                {currentTab === 'settings' && (
                  <SettingsScreen
                    settings={settings}
                    onUpdateSettings={async (newS) => {
                      await firestoreService.updateSettings(newS);
                      setSettings((prev) => ({ ...prev, ...newS }));
                    }}
                    onResetPantry={() => handleLoadScenario('default')}
                    onClearPantry={() => handleLoadScenario('empty')}
                    onLoadScenario={handleLoadScenario}
                    onExportPantry={handleExportPantry}
                    totalPantryCount={pantryItems.length}
                  />
                )}

                {/* Bottom Navigation Bar (Pantry, Suggested, Settings) */}
                <AndroidBottomNav
                  currentTab={currentTab}
                  onTabChange={(tab) => {
                    setCurrentTab(tab);
                  }}
                  strictRecipesCount={strictRecipesCount}
                  expiringItemsCount={expiringCount}
                />
              </>
            )}
          </AndroidDeviceFrame>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
