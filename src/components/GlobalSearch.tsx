import React, { useState } from 'react';
import { Search, X, Clock, ArrowRight, Star, Store, ShoppingBag } from 'lucide-react';
import { Product, VendorStore, Category } from '../types';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stores: VendorStore[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  onSelectStore: (store: VendorStore) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  products,
  stores = [],
  categories,
  onSelectProduct,
  onSelectStore,
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Biryani',
    'Organic Milk',
    'Vegetables',
    'Ajmeeri',
  ]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedProducts = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    : [];

  const matchedStores = q
    ? stores.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
    : [];

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200">
      {/* Top Search Input Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, stores & categories..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-xs font-black text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {!query ? (
          /* Recent & Popular Searches */
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectRecent(term)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Popular Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((cat, idx) => (
                  <button
                    key={`search-cat-${cat.id}-${idx}`}
                    onClick={() => handleSelectRecent(cat.name)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-left flex items-center gap-2 cursor-pointer hover:border-emerald-300"
                  >
                    <span className="text-xl">{cat.icon || '🛍️'}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            {/* Stores Results */}
            {matchedStores.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" /> Stores ({matchedStores.length})
                </h3>
                <div className="space-y-2">
                  {matchedStores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => {
                        onSelectStore(store);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-10 h-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{store.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold">{store.category} • {store.address}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Products ({matchedProducts.length})
              </h3>

              {matchedProducts.length === 0 && matchedStores.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400 font-bold">No results found for "{query}".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matchedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{product.deliveryTime}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
