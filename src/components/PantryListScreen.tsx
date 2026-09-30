import React, { useState, useMemo } from 'react';
import { PantryItem, IngredientCategory } from '../types';
import { Search, Plus, Trash2, Edit3, AlertCircle, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface PantryListScreenProps {
  items: PantryItem[];
  onAddNew: () => void;
  onEditItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onLoadQuickStaples: () => void;
  warningDaysThreshold: number;
}

const CATEGORIES: ('All' | IngredientCategory)[] = [
  'All',
  'Produce',
  'Dairy & Eggs',
  'Grains & Pasta',
  'Meat & Seafood',
  'Pantry Staples',
  'Spices & Condiments',
  'Bakery',
];

export const PantryListScreen: React.FC<PantryListScreenProps> = ({
  items,
  onAddNew,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onLoadQuickStaples,
  warningDaysThreshold,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IngredientCategory>('All');
  const [deletedUndoItem, setDeletedUndoItem] = useState<PantryItem | null>(null);

  // Helper to compute days until expiry
  const getDaysUntilExpiry = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Expiring items count
  const expiringCount = useMemo(() => {
    return items.filter((item) => {
      const days = getDaysUntilExpiry(item.expiryDate);
      return days !== null && days <= warningDaysThreshold && days >= 0;
    }).length;
  }, [items, warningDaysThreshold]);

  const handleDeleteWithUndo = (item: PantryItem) => {
    setDeletedUndoItem(item);
    onDeleteItem(item.id);
  };

  return (
    <div className="flex-1 flex flex-col p-3 pb-24 relative select-none">
      {/* Search Input (Android EditText / SearchView style) */}
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expiry Alert Warning Banner (if any items expiring soon) */}
      {expiringCount > 0 && (
        <div className="mb-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900 text-xs shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 leading-snug">
            <span className="font-semibold">{expiringCount} item{expiringCount > 1 ? 's' : ''} expiring</span> within {warningDaysThreshold} days. Use them soon to prevent food waste!
          </div>
        </div>
      )}

      {/* Horizontal Category Chips (Android ChipGroup) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Pantry Items Count Label */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
        <span>
          Showing {filteredItems.length} of {items.length} ingredients
        </span>
        <span className="text-[11px] font-mono text-emerald-700">RecyclerView · Firebase Firestore</span>
      </div>

      {/* RecyclerView / Dynamic List of Ingredients */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            {searchQuery ? 'No matching ingredients found' : 'Your pantry is currently empty'}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
            {searchQuery
              ? 'Try adjusting your search terms or category filter.'
              : 'Add ingredients you have in your kitchen to start receiving strict recipe suggestions!'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onAddNew}
              className="px-3.5 py-2 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
            <button
              onClick={onLoadQuickStaples}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Load Sample Pantry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredItems.map((item) => {
            const daysUntil = getDaysUntilExpiry(item.expiryDate);
            const isExpiringSoon = daysUntil !== null && daysUntil <= warningDaysThreshold && daysUntil >= 0;
            const isExpired = daysUntil !== null && daysUntil < 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-emerald-300 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onEditItem(item)}
                    title="Tap to edit this item (Intent)"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 hover:text-emerald-700 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Expiry metadata indicator */}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {item.expiryDate ? (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isExpired
                              ? 'text-rose-600'
                              : isExpiringSoon
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isExpired
                            ? `Expired ${Math.abs(daysUntil!)}d ago`
                            : isExpiringSoon
                            ? daysUntil === 0
                              ? 'Expires today!'
                              : `Expires in ${daysUntil}d`
                            : `Exp: ${item.expiryDate}`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No expiry date set</span>
                      )}

                      {item.notes && (
                        <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                          · {item.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        disabled={item.quantity <= 0}
                        title="Decrease quantity by 1"
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-800 tabular-nums">
                        {item.quantity} <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        title="Increase quantity by 1"
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onEditItem(item)}
                      aria-label="Edit item"
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteWithUndo(item)}
                      aria-label="Delete item"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Undo Snackbar notification (Material Design Snackbar) */}
      {deletedUndoItem && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <span>Deleted &quot;{deletedUndoItem.name}&quot; from pantry</span>
          <button
            onClick={() => {
              onAddNew(); // or restore
              setDeletedUndoItem(null);
            }}
            className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px] hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Material 3 Floating Action Button (FAB) */}
      <button
        onClick={onAddNew}
        aria-label="Add new ingredient"
        title="Add new ingredient (Launches AddEditIngredientActivity via Intent)"
        className="fixed bottom-20 right-6 z-40 w-14 h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 cursor-pointer ring-4 ring-white/50"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
