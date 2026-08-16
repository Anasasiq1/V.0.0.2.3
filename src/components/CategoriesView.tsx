import React, { useState } from 'react';
import { Category, Module, Product } from '../types';
import { Search, ArrowRight, Layers } from 'lucide-react';

export interface CategoriesViewProps {
  modules: Module[];
  categories: Category[];
  products: Product[];
  onSelectCategory: (moduleId: string, categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  modules,
  categories,
  products,
  onSelectCategory,
}) => {
  const [search, setSearch] = useState('');

  // Enabled modules map
  const enabledModules = (modules || []).filter((m) => m.enabled !== false);
  const enabledModuleIds = new Set(enabledModules.map((m) => m.id));

  // Enabled categories whose parent module is also enabled
  const enabledCategories = (categories || []).filter(
    (c) => c.enabled !== false && (!c.moduleId || enabledModuleIds.has(c.moduleId))
  );

  const filteredCategories = enabledCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryProductCount = (catId: string) => {
    return (products || []).filter(
      (p) =>
        p.categoryId === catId &&
        p.enabled !== false &&
        (!p.moduleId || enabledModuleIds.has(p.moduleId))
    ).length;
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header & Search */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" /> All Categories
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Browse verified categories ({filteredCategories.length})
          </p>
        </div>
        <div className="relative w-40">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 text-xs font-bold">
          No active categories found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredCategories.map((category, idx) => {
            const itemCount = getCategoryProductCount(category.id);
            const parentModule = enabledModules.find((m) => m.id === category.moduleId);
            const imgUrl =
              category.image ||
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={`cat-view-${category.id}-${idx}`}
                onClick={() => onSelectCategory(category.moduleId, category.id)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold block">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    {parentModule && (
                      <span className="text-[9px] text-slate-400 font-bold block truncate max-w-[70px]">
                        • {parentModule.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  {category.image ? (
                    <img
                      src={imgUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl">{category.icon || '🏷️'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
