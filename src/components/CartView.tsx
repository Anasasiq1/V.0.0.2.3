import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight, Store, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';

export interface CartViewProps {
  cart: CartItem[];
  deliveryAddress: string;
  onUpdateQty: (cartId: string, change: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  deliveryAddress,
  onUpdateQty,
  onClearCart,
  onProceedToCheckout,
  onNavigateTab,
}) => {
  if (!cart || cart.length === 0) {
    return (
      <div className="p-6 text-center py-20 pb-28 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-base font-black text-slate-800 dark:text-white mb-1">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mb-6">
          Explore top products and local merchant stores near you to add items to your cart.
        </p>
        <button
          onClick={() => onNavigateTab('home')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg cursor-pointer transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // Group items by dummy store name or category
  const storeGroups = cart.reduce((acc, item) => {
    const storeName = item.name.toLowerCase().includes('milk') || item.name.toLowerCase().includes('lays') || item.name.toLowerCase().includes('amul')
      ? "Priya's Grocery Mart"
      : "Amit's Beauty Essentials";
    if (!acc[storeName]) acc[storeName] = [];
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="p-4 space-y-4 pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" /> My Cart ({cart.reduce((sum, i) => sum + i.qty, 0)})
        </h1>
        <button
          onClick={onClearCart}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Store Grouped Items */}
      <div className="space-y-4">
        {(Object.entries(storeGroups) as [string, CartItem[]][]).map(([storeName, items]) => (
          <div
            key={storeName}
            className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/40">
              <Store className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">{storeName}</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {items.map((item) => (
                <div key={item.cartId} className="py-3 flex items-center justify-between gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-2xl object-cover bg-slate-50 border border-slate-100 dark:border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                    {item.variantName && (
                      <span className="text-[10px] text-slate-400 font-semibold block">{item.variantName}</span>
                    )}
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      ₹{item.price * item.qty}
                    </span>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-0.5 border border-slate-200 dark:border-slate-600">
                      <button
                        onClick={() => onUpdateQty(item.cartId, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-800 dark:text-slate-100">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.cartId, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onUpdateQty(item.cartId, -item.qty)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Address Confirmation */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider block">Deliver to</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
              {deliveryAddress || 'pathampad, Tirur, Kerala'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('account')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2 cursor-pointer"
        >
          Change
        </button>
      </div>

      {/* Bill Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Bill Summary</h3>
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Item Total</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span>Delivery Fee</span>
          <span>FREE</span>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-baseline font-black">
          <span className="text-xs text-slate-800 dark:text-slate-100">Total Amount</span>
          <span className="text-base text-indigo-600 dark:text-indigo-400">₹{grandTotal}</span>
        </div>
      </div>

      {/* Primary Proceed Button */}
      <button
        onClick={onProceedToCheckout}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
