import React from 'react';
import { Category, Module } from '../types';

export interface CategoryCardProps {
  category: Category;
  module?: Module;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'pill' | 'card' | 'compact';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isActive = false,
  onClick,
  variant = 'card',
}) => {
  if (variant === 'pill') {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
          isActive
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <span>{category.icon || '🥬'}</span>
        <span>{category.name}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center group ${
        isActive
          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-md'
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
        {category.icon || '🥬'}
      </div>
      <h3 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
        {category.name}
      </h3>
    </div>
  );
};
