import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Search, ShieldCheck } from 'lucide-react';
import { VendorStore, Product, CartItem } from '../types';
import { ProductCard } from './ProductCard';

export interface StoreDetailViewProps {
  store: VendorStore;
  products: Product[];
  cart: CartItem[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, change: number) => void;
  onOpenDetail?: (product: Product) => void;
}

export const StoreDetailView: React.FC<StoreDetailViewProps> = ({
  store,
  products = [],
  cart,
  onBack,
  onAddToCart,
  onUpdateQty,
  onOpenDetail,
}) => {
  const [search, setSearch] = useState('');

  if (store.status === 'SUSPENDED' || store.status === 'ARCHIVED' || store.active === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl font-black">
          ⚠️
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {store.name} - നിലവിൽ പ്രവർത്തിക്കുന്നില്ല (Store Currently Inactive)
        </h2>
        <p className="text-xs text-slate-500 max-w-sm font-medium">
          This store is currently suspended or inactive. Please explore other active partner stores.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
        >
          മറ്റു കടകൾ കാണുക (Return to Stores)
        </button>
      </div>
    );
  }

  const storeProducts = products.filter((p) => {
    if (p.enabled === false) return false;
    const isStoreMatch = p.store_id ? p.store_id === store.id : (store.id === 'store-ajmeeri' || store.id === 'STR-DEFAULT');
    const q = search.toLowerCase();
    const isSearchMatch = p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    return isStoreMatch && isSearchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src={store.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80'}
          alt={store.name}
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center cursor-pointer hover:bg-black/70 z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Store Title Info */}
        <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
              {store.category}
            </span>
            <span className="bg-emerald-500/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Partner
            </span>
          </div>

          <h1 className="text-xl font-black text-white">{store.name}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-200 mt-1">
            <span className="flex items-center gap-1 text-amber-400 font-extrabold">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> 4.9 (120+ ratings)
            </span>
            <span className="flex items-center gap-1 font-semibold truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {store.address}
            </span>
          </div>
        </div>
      </div>

      {/* Main Store Search & Products */}
      <div className="p-4 space-y-4">
        {/* Search inside store */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${store.name}...`}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">
            Available Products ({storeProducts.length})
          </h2>

          {storeProducts.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-500 font-bold">No products match your search in this store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {storeProducts.map((product) => {
                const cartItem = cart.find((i) => i.productId === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItem={cartItem}
                    onAddToCart={onAddToCart}
                    onUpdateQty={onUpdateQty}
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
