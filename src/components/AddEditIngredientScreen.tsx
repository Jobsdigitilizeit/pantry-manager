import React, { useState, useEffect } from 'react';
import { PantryItem, UnitType, IngredientCategory } from '../types';
import { Save, Trash2, ArrowLeft, Calendar, AlertTriangle, Check, Sparkles } from 'lucide-react';

interface AddEditIngredientScreenProps {
  initialItem?: PantryItem | null;
  onSave: (itemData: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const COMMON_UNITS: { value: UnitType; label: string }[] = [
  { value: 'g', label: 'g (grams)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'l', label: 'l (liters)' },
  { value: 'tbsp', label: 'tbsp (tablespoons)' },
  { value: 'tsp', label: 'tsp (teaspoons)' },
  { value: 'cup', label: 'cup (cups)' },
  { value: 'pieces', label: 'pieces (count)' },
  { value: 'can', label: 'can' },
  { value: 'clove', label: 'clove (garlic)' },
  { value: 'slice', label: 'slice (bread)' },
];

const CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Grains & Pasta',
  'Meat & Seafood',
  'Pantry Staples',
  'Spices & Condiments',
  'Bakery',
  'Canned Goods',
];

const QUICK_SUGGESTIONS = [
  { name: 'Eggs', unit: 'pieces' as UnitType, category: 'Dairy & Eggs' as IngredientCategory },
  { name: 'Garlic', unit: 'clove' as UnitType, category: 'Produce' as IngredientCategory },
  { name: 'Butter', unit: 'g' as UnitType, category: 'Dairy & Eggs' as IngredientCategory },
  { name: 'Spaghetti', unit: 'g' as UnitType, category: 'Grains & Pasta' as IngredientCategory },
  { name: 'Olive Oil', unit: 'ml' as UnitType, category: 'Pantry Staples' as IngredientCategory },
  { name: 'Tomato', unit: 'pieces' as UnitType, category: 'Produce' as IngredientCategory },
  { name: 'Bell Pepper', unit: 'pieces' as UnitType, category: 'Produce' as IngredientCategory },
  { name: 'Potato', unit: 'g' as UnitType, category: 'Produce' as IngredientCategory },
  { name: 'Cheddar', unit: 'g' as UnitType, category: 'Dairy & Eggs' as IngredientCategory },
];

export const AddEditIngredientScreen: React.FC<AddEditIngredientScreenProps> = ({
  initialItem,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isEditMode = Boolean(initialItem);

  const [name, setName] = useState(initialItem?.name || '');
  const [quantity, setQuantity] = useState(initialItem ? String(initialItem.quantity) : '');
  const [unit, setUnit] = useState<UnitType>(initialItem?.unit || 'g');
  const [category, setCategory] = useState<IngredientCategory>(initialItem?.category || 'Produce');
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiryDate || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');

  // Validation error states (mimicking Android TextInputLayout.setError)
  const [nameError, setNameError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // Validate on field change
  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError && val.trim().length > 0) {
      setNameError(null);
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    if (quantityError) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setQuantityError(null);
      }
    }
  };

  const handleSelectQuickSuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    setName(sug.name);
    setUnit(sug.unit);
    setCategory(sug.category);
    if (nameError) setNameError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // Validate Name
    if (!name.trim()) {
      setNameError('Ingredient name cannot be empty (Section 3.1 validation)');
      hasError = true;
    } else {
      setNameError(null);
    }

    // Validate Quantity
    const parsedQty = parseFloat(quantity);
    if (!quantity || isNaN(parsedQty) || parsedQty <= 0) {
      setQuantityError('Quantity must be a valid number strictly greater than 0');
      hasError = true;
    } else {
      setQuantityError(null);
    }

    if (hasError) return;

    onSave(
      {
        name: name.trim(),
        quantity: parsedQty,
        unit,
        category,
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
      },
      initialItem?.id
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 pb-20 select-none overflow-y-auto">
      {/* Activity Context Header */}
      <div className="mb-4 flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {isEditMode ? 'Edit Pantry Item' : 'Add New Ingredient'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEditMode
              ? `Item ID: ${initialItem?.id}`
              : 'Add item to Firebase Firestore pantry database'}
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
          AddEditIngredientActivity
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Ingredient Name with TextInputLayout Style */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ingredient Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Bell Pepper, Spaghetti, Eggs..."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition-all shadow-xs ${
              nameError
                ? 'border-rose-500 ring-2 ring-rose-100'
                : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent'
            }`}
          />
          {nameError && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {nameError}
            </p>
          )}

          {/* Quick suggestions if empty */}
          {!isEditMode && !name && (
            <div className="mt-2">
              <span className="text-[11px] text-slate-500 block mb-1">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1">
                {QUICK_SUGGESTIONS.slice(0, 6).map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => handleSelectQuickSuggestion(sug)}
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                  >
                    + {sug.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantity & Unit Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 500 or 2"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition-all shadow-xs tabular-nums ${
                quantityError
                  ? 'border-rose-500 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent'
              }`}
            />
            {quantityError && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {quantityError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit <span className="text-rose-500">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitType)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
            >
              {COMMON_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IngredientCategory)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Date (DatePicker Dialog) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Expiry Date (Optional)</span>
            <span className="text-[11px] text-slate-400 font-normal">Helps alert for food waste</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {expiryDate && (
            <button
              type="button"
              onClick={() => setExpiryDate('')}
              className="text-[11px] text-slate-500 hover:text-rose-600 mt-1 inline-block"
            >
              Clear date
            </button>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Storage Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. In crisper drawer, opened on Monday..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isEditMode ? 'Update Ingredient' : 'Save to Pantry'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {isEditMode && onDelete && (
              <button
                type="button"
                onClick={() => initialItem && onDelete(initialItem.id)}
                className="py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
