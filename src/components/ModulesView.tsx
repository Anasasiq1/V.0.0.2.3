import React, { useState } from 'react';
import { Module, Category, Product, VendorStore } from '../types';
import { Search, Layers, Clock, ArrowRight, Store, Sparkles, Package } from 'lucide-react';

export interface ModulesViewProps {
  modules: Module[];
  categories: Category[];
  products: Product[];
  stores?: VendorStore[];
  onSelectModule: (moduleId: string) => void;
  onSelectCategory?: (moduleId: string, categoryId: string) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  categories,
  products,
  stores = [],
  onSelectModule,
  onSelectCategory,
}) => {
  const [search, setSearch] = useState('');

  const enabledModules = (modules || [])
    .filter((m) => m.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filteredModules = enabledModules.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = m.name.toLowerCase().includes(q);
    const descMatch = (m.description || '').toLowerCase().includes(q);
    const catMatch = (categories || [])
      .filter((c) => c.moduleId === m.id)
      .some((c) => c.name.toLowerCase().includes(q));
    return nameMatch || descMatch || catMatch;
  });

  const getModuleStats = (modId: string) => {
    const modCategories = (categories || []).filter(
      (c) => c.moduleId === modId && c.enabled !== false
    );
    const modProducts = (products || []).filter(
      (p) => p.moduleId === modId && p.enabled !== false
    );
    const modStores = (stores || []).filter(
      (s) =>
        (s.status === 'ACTIVE' || s.status === undefined || (s as any).active === true) &&
        Array.isArray(s.modules) &&
        s.modules.includes(modId)
    );
    return {
      categoryCount: modCategories.length,
      productCount: modProducts.length,
      storeCount: modStores.length,
      categories: modCategories.slice(0, 3),
    };
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 -mx-4 -mt-4 p-5 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-300" /> Platform Modules
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5" /> Explore All Modules
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Select a module to browse specialized stores & verified products
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules & items..."
            className="w-full bg-white text-slate-900 placeholder-slate-400 border-none rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Modules Count Indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-slate-600 dark:text-slate-400">
          Showing {filteredModules.length} of {enabledModules.length} Active Modules
        </span>
        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
          Hyperlocal Delivery
        </span>
      </div>

      {/* Grid of Modules */}
      {filteredModules.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold">
          No matching modules found for "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredModules.map((mod) => {
            const stats = getModuleStats(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                style={{ background: mod.bgColor || '#f8fafc' }}
                className="rounded-3xl p-4.5 border border-black/5 dark:border-white/10 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between relative overflow-hidden group min-h-[160px]"
              >
                {/* Background Icon / Art */}
                <div className="absolute right-2 bottom-1 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none select-none">
                  {mod.image ? (
                    <img src={mod.image} alt={mod.name} className="w-24 h-24 object-contain" />
                  ) : mod.icon && (mod.icon.startsWith('http') || mod.icon.startsWith('data:')) ? (
                    <img src={mod.icon} alt={mod.name} className="w-24 h-24 object-contain" />
                  ) : (
                    <span className="text-7xl block">{mod.icon || '📦'}</span>
                  )}
                </div>

                {/* Top Section: Icon, Title & Time */}
                <div className="z-10">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl filter drop-shadow-xs">{mod.icon || '📦'}</span>
                      <div>
                        <h2 className="text-base font-black text-slate-900 leading-tight group-hover:text-emerald-950 transition-colors">
                          {mod.name}
                        </h2>
                        {mod.time && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> {mod.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {mod.description && (
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 mt-1 pr-12 leading-relaxed opacity-95">
                      {mod.description}
                    </p>
                  )}
                </div>

                {/* Sub-categories Preview Pills */}
                {stats.categories.length > 0 && (
                  <div className="z-10 my-2 flex flex-wrap gap-1">
                    {stats.categories.map((cat) => (
                      <span
                        key={cat.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCategory) {
                            onSelectCategory(mod.id, cat.id);
                          } else {
                            onSelectModule(mod.id);
                          }
                        }}
                        className="text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-lg border border-black/5 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {stats.categoryCount > 3 && (
                      <span className="text-[10px] font-extrabold text-slate-600 bg-white/60 px-1.5 py-0.5 rounded-lg">
                        +{stats.categoryCount - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Footer: Stats & Enter Action */}
                <div className="z-10 pt-2 border-t border-black/5 flex items-center justify-between text-xs mt-auto">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-slate-600" /> {stats.storeCount} Stores
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-600" /> {stats.productCount} Items
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-black text-emerald-800 group-hover:translate-x-1 transition-transform text-xs">
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
