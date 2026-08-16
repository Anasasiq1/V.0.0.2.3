import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, Store as StoreIcon } from 'lucide-react';
import { VendorStore } from '../types';
import { StoreCard } from './StoreCard';

export interface StoresViewProps {
  stores: VendorStore[];
  onSelectStore: (store: VendorStore) => void;
}

export const StoresView: React.FC<StoresViewProps> = ({ stores = [], onSelectStore }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(stores.map((s) => s.category).filter(Boolean)))];

  const filteredStores = stores.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const q = query.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Search & Category Header */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores near you..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <StoreIcon className="w-4 h-4 text-emerald-600" /> Nearby Stores ({filteredStores.length})
          </h2>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6">
            <StoreIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">No stores found</h3>
            <p className="text-xs text-slate-500 font-medium">Try searching for a different area or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} onSelectStore={onSelectStore} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
