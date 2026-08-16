import React from 'react';
import { Category } from '../types';
import { Grid } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  activeModuleId: string;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeModuleId,
  activeCategoryId,
  onSelectCategory,
}) => {
  // Filter categories for the current module (or all enabled categories if on 'all')
  const enabledCategories = (categories || []).filter((c) => c && c.enabled !== false);
  const relevantCategories = activeModuleId === 'all'
    ? enabledCategories
    : enabledCategories.filter((c) => c && c.moduleId === activeModuleId);

  // Sort by order index
  const sortedCategories = [...relevantCategories].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-b border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
          <Grid className="w-3.5 h-3.5 text-emerald-600" />
          <span>{activeModuleId === 'all' ? 'All Categories' : 'Module Categories'}</span>
        </div>
        {activeCategoryId !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeCategoryId === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Items
        </button>

        {/* Individual Category Pills */}
        {sortedCategories.map((cat, idx) => {
          const isSelected = activeCategoryId === cat.id;
          return (
            <button
              key={`cat-bar-item-${cat.id}-${idx}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-4 h-4 object-contain rounded-xs" />
              ) : (
                <span>{cat.icon || '🏷️'}</span>
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
