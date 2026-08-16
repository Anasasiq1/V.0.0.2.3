import React, { useState } from 'react';
import { Heart, Bookmark, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Product, CartItem } from '../types';
import { ProductCard } from './ProductCard';

export interface WishlistViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, change: number) => void;
  onOpenDetail?: (product: Product) => void;
  onBack: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateQty,
  onOpenDetail,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'saved'>('wishlist');

  // Demo wishlisted products (take first 4 or filtered)
  const wishlistedProducts = products.slice(0, 4);

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black text-slate-900 dark:text-white">Wishlist & Saved Items</h1>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'wishlist'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>My Wishlist ({wishlistedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          <span>Saved For Later</span>
        </button>
      </div>

      {activeTab === 'wishlist' ? (
        <div className="grid grid-cols-2 gap-3">
          {wishlistedProducts.map((product) => {
            const cartItem = cart.find((i) => i.productId === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                cartItem={cartItem}
                isWishlisted={true}
                onAddToCart={onAddToCart}
                onUpdateQty={onUpdateQty}
                onOpenDetail={onOpenDetail}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">No saved items</h3>
          <p className="text-xs text-slate-500 font-medium">Items moved to saved for later will appear here.</p>
        </div>
      )}
    </div>
  );
};
