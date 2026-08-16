import React, { useState, useMemo } from 'react';
import { Category, Module, Product, CartItem, VendorStore } from '../types';
import { ProductCard } from './ProductCard';
import { SearchBar } from './SearchBar';
import { ArrowLeft, Layers, ShoppingBag, ArrowRight } from 'lucide-react';

export interface CategoryDetailViewProps {
  categoryId?: string;
  category?: Category;
  moduleId?: string;
  parentModule?: Module;
  modules?: Module[];
  allModules?: Module[];
  categories?: Category[];
  allCategories?: Category[];
  products?: Product[];
  stores?: VendorStore[];
  cart?: CartItem[];
  onBack: () => void;
  onSelectModule?: (moduleId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, change: number) => void;
  onOpenDetail: (product: Product) => void;
  onSelectStore?: (store: VendorStore) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  categoryId,
  category,
  moduleId,
  parentModule,
  modules = [],
  allModules = [],
  categories = [],
  allCategories = [],
  products = [],
  stores = [],
  cart = [],
  onBack,
  onSelectModule,
  onSelectCategory,
  onAddToCart,
  onUpdateCartQty,
  onOpenDetail,
  onSelectStore,
}) => {
  const [search, setSearch] = useState('');

  const catList = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    if (allCategories && allCategories.length > 0) return allCategories;
    return [];
  }, [categories, allCategories]);

  const modList = useMemo(() => {
    if (modules && modules.length > 0) return modules;
    if (allModules && allModules.length > 0) return allModules;
    return [];
  }, [modules, allModules]);

  const resolvedCategory = useMemo(() => {
    if (category) return category;
    if (categoryId && categoryId !== 'all') {
      const found = catList.find((c) => c?.id === categoryId);
      if (found) return found;
    }
    return catList[0] || null;
  }, [category, categoryId, catList]);

  const resolvedParentModule = useMemo(() => {
    if (parentModule) return parentModule;
    const targetModId = moduleId && moduleId !== 'all' ? moduleId : resolvedCategory?.moduleId;
    if (targetModId) {
      const found = modList.find((m) => m?.id === targetModId);
      if (found) return found;
    }
    return null;
  }, [parentModule, moduleId, resolvedCategory, modList]);

  // Related sibling categories in same module
  const siblingCategories = useMemo(() => {
    if (!resolvedCategory?.moduleId) return [];
    return catList.filter(
      (c) => c && c.moduleId === resolvedCategory.moduleId && c.id !== resolvedCategory.id && c.enabled !== false
    );
  }, [catList, resolvedCategory]);

  // Filter products for this category
  const categoryProducts = useMemo(() => {
    if (!resolvedCategory) return [];
    return (products || []).filter((p) => {
      if (!p) return false;
      if (p.categoryId !== resolvedCategory.id) return false;
      if (p.enabled === false) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, resolvedCategory, search]);

  if (!resolvedCategory) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 m-4 space-y-3">
        <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">Category not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Categories</span>
          </button>

          {resolvedParentModule && onSelectModule && (
            <button
              onClick={() => onSelectModule(resolvedParentModule.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 text-xs font-extrabold cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Module: {resolvedParentModule.name}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {resolvedCategory.image ? (
              <img src={resolvedCategory.image} alt={resolvedCategory.name} className="w-8 h-8 object-cover rounded-lg" />
            ) : (
              <span>{resolvedCategory.icon || '🏷️'}</span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">{resolvedCategory.name}</h1>
            <p className="text-xs text-emerald-100 font-semibold mt-0.5">
              {categoryProducts.length} Products Available
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search */}
        <SearchBar
          searchQuery={search}
          onSearchChange={setSearch}
          onOpenOverlay={() => {}}
        />

        {/* Sibling Categories in the same module */}
        {siblingCategories.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              More in {resolvedParentModule?.name || 'this module'}
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {siblingCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <span>{c.icon || '🏷️'}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Products
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              {categoryProducts.length} Items
            </span>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categoryProducts.map((product) => {
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
