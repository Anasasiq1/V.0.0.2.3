import React, { useState, useMemo } from 'react';
import { Module, Category, Product, VendorStore, CartItem } from '../types';
import { ModuleSwitcher } from './ModuleSwitcher';
import { ProductCard } from './ProductCard';
import { StoreCard } from './StoreCard';
import { SearchBar } from './SearchBar';
import { ArrowLeft, Clock, ShoppingBag, Store } from 'lucide-react';

export interface ModuleDetailViewProps {
  moduleId?: string;
  module?: Module;
  modules?: Module[];
  allModules?: Module[];
  categories?: Category[];
  products?: Product[];
  stores?: VendorStore[];
  cart?: CartItem[];
  activeCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, change: number) => void;
  onOpenDetail: (product: Product) => void;
  onSelectStore: (store: VendorStore) => void;
  onOpenFilterSheet?: () => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  moduleId,
  module,
  modules = [],
  allModules = [],
  categories = [],
  products = [],
  stores = [],
  cart = [],
  activeCategoryId = 'all',
  onSelectCategory,
  onSelectModule,
  onBack,
  onAddToCart,
  onUpdateCartQty,
  onOpenDetail,
  onSelectStore,
  onOpenFilterSheet,
}) => {
  const [search, setSearch] = useState('');

  const modList = useMemo(() => {
    if (modules && modules.length > 0) return modules;
    if (allModules && allModules.length > 0) return allModules;
    return [];
  }, [modules, allModules]);

  const resolvedModule = useMemo(() => {
    if (module) return module;
    if (moduleId && moduleId !== 'all') {
      const found = modList.find((m) => m?.id === moduleId);
      if (found) return found;
    }
    return modList[0] || null;
  }, [module, moduleId, modList]);

  // Categories belonging to this module
  const moduleCategories = useMemo(() => {
    if (!resolvedModule) return [];
    return (categories || []).filter(
      (c) => c && c.moduleId === resolvedModule.id && c.enabled !== false
    );
  }, [categories, resolvedModule]);

  // Stores belonging to this module
  const moduleStores = useMemo(() => {
    if (!resolvedModule) return [];
    return (stores || []).filter(
      (s) =>
        s &&
        (s.status === 'ACTIVE' || s.status === undefined || (s as any).active === true) &&
        Array.isArray(s.modules) &&
        s.modules.includes(resolvedModule.id)
    );
  }, [stores, resolvedModule]);

  // Products belonging to this module
  const moduleProducts = useMemo(() => {
    if (!resolvedModule) return [];
    return (products || []).filter((p) => {
      if (!p) return false;
      if (p.moduleId !== resolvedModule.id) return false;
      if (p.enabled === false) return false;
      if (activeCategoryId !== 'all' && p.categoryId !== activeCategoryId) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        return nameMatch || descMatch;
      }
      return true;
    });
  }, [products, resolvedModule, activeCategoryId, search]);

  if (!resolvedModule) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 m-4 space-y-3">
        <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">Module not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Modules</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Top Banner with Back & Persistent Module Switcher */}
      <div
        style={{ background: resolvedModule.bgColor || '#059669' }}
        className="p-4 sm:p-6 text-slate-900 shadow-md relative overflow-hidden"
      >
        {/* Navigation & Switcher Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-black hover:bg-white shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modules</span>
          </button>

          {/* Persistent Quick Module Switcher */}
          <ModuleSwitcher
            modules={modList}
            activeModuleId={resolvedModule.id}
            onSelectModule={onSelectModule}
            variant="compact"
          />
        </div>

        {/* Module Title & Info */}
        <div className="flex items-center gap-3 mt-2">
          <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-xs flex items-center justify-center text-3xl shadow-sm shrink-0">
            {resolvedModule.image ? (
              <img src={resolvedModule.image} alt={resolvedModule.name} className="w-10 h-10 object-contain" />
            ) : resolvedModule.icon && (resolvedModule.icon.startsWith('http') || resolvedModule.icon.startsWith('data:')) ? (
              <img src={resolvedModule.icon} alt={resolvedModule.name} className="w-10 h-10 object-contain" />
            ) : (
              <span>{resolvedModule.icon || '📦'}</span>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900 leading-tight truncate">
              {resolvedModule.name}
            </h1>
            {resolvedModule.description && (
              <p className="text-xs text-slate-800 font-semibold line-clamp-1 opacity-90 mt-0.5">
                {resolvedModule.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {resolvedModule.time && (
                <span className="bg-white/95 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> {resolvedModule.time} Delivery
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-800">
                • {moduleStores.length} Stores • {moduleProducts.length} Items
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search Bar for this Module */}
        <div className="relative">
          <SearchBar
            searchQuery={search}
            onSearchChange={setSearch}
            onOpenOverlay={() => {}}
            onOpenFilter={onOpenFilterSheet}
          />
        </div>

        {/* Category Horizontal Pills */}
        {moduleCategories.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                Categories in {resolvedModule.name}
              </span>
              {activeCategoryId !== 'all' && (
                <button
                  onClick={() => onSelectCategory('all')}
                  className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Show All Items
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => onSelectCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategoryId === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                All ({moduleProducts.length})
              </button>

              {moduleCategories.map((cat, idx) => {
                const isSelected = activeCategoryId === cat.id;
                const count = (products || []).filter(
                  (p) => p && p.categoryId === cat.id && p.enabled !== false
                ).length;
                return (
                  <button
                    key={`module-cat-pill-${cat.id}-${idx}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon || '🏷️'}</span>
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75 font-semibold">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stores Section if available */}
        {moduleStores.length > 0 && activeCategoryId === 'all' && !search && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" /> Stores in {resolvedModule.name}
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {moduleStores.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moduleStores.map((st) => (
                <StoreCard
                  key={st.id}
                  store={st}
                  onSelectStore={onSelectStore}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              {activeCategoryId !== 'all'
                ? moduleCategories.find((c) => c.id === activeCategoryId)?.name || 'Products'
                : `Items in ${resolvedModule.name}`}
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              {moduleProducts.length} Items
            </span>
          </div>

          {moduleProducts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold">
              No products found in this selection.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {moduleProducts.map((product) => {
                const inCart = cart.find((i) => i.productId === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onUpdateQty={onUpdateCartQty}
                    qty={inCart ? inCart.qty : 0}
                    onOpenDetail={onOpenDetail}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
