import React from 'react';
import { Module } from '../types';

interface CategoryTabsProps {
  modules: Module[];
  activeModuleId: string;
  onSelectModule: (moduleId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
}) => {
  const enabledModules = (modules || []).filter((m) => m.enabled !== false);
  const sortedModules = [...enabledModules].sort((a, b) => a.order - b.order);

  return (
    <div className="px-4 pt-1 pb-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {/* Home Tab */}
        <button
          onClick={() => onSelectModule('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 shadow-2xs border ${
            activeModuleId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 scale-102'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Home
        </button>

        {/* Dynamic Module Tabs */}
        {sortedModules.map((mod) => {
          const isActive = activeModuleId === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mod.image ? (
                <img src={mod.image} alt="" className="w-4 h-4 object-contain rounded-xs" />
              ) : mod.icon && (mod.icon.startsWith('http') || mod.icon.startsWith('data:') || mod.icon.startsWith('/')) ? (
                <img src={mod.icon} alt="" className="w-4 h-4 object-contain rounded-xs" />
              ) : (
                <span>{mod.icon || '📦'}</span>
              )}
              <span>{mod.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
