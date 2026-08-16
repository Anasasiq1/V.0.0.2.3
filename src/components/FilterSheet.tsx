import React, { useState } from 'react';
import { X, Filter, Check, RotateCcw } from 'lucide-react';

export interface FilterOptions {
  sortBy: 'relevance' | 'price_low_high' | 'price_high_low' | 'rating' | 'newest';
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
  minRating: number;
}

export interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-md p-5 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 dark:text-white text-base">Filter & Sort</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sort By Section */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
            Sort Products By
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'relevance', label: 'Relevance' },
              { id: 'price_low_high', label: 'Price: Low to High' },
              { id: 'price_high_low', label: 'Price: High to Low' },
              { id: 'rating', label: 'Customer Rating' },
              { id: 'newest', label: 'Newest Arrivals' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilters({ ...filters, sortBy: option.id as any })}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between cursor-pointer transition-colors ${
                  filters.sortBy === option.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{option.label}</span>
                {filters.sortBy === option.id && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">In Stock Items Only</span>
            <p className="text-[10px] text-slate-400">Hide items that are currently sold out</p>
          </div>
          <button
            onClick={() => setFilters({ ...filters, inStockOnly: !filters.inStockOnly })}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              filters.inStockOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                filters.inStockOnly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
            Minimum Rating
          </label>
          <div className="flex gap-2">
            {[0, 3.5, 4.0, 4.5].map((stars) => (
              <button
                key={stars}
                onClick={() => setFilters({ ...filters, minRating: stars })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  filters.minRating === stars
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {stars === 0 ? 'All Ratings' : `${stars}★ & above`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-2 py-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
