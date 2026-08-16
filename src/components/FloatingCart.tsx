import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

export interface FloatingCartProps {
  cart: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ cart, onOpenCart }) => {
  if (!cart || cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Take up to 3 item preview thumbnails
  const previewItems = cart.slice(0, 3);

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-30 animate-in slide-in-from-bottom-5 duration-300">
      <div
        onClick={onOpenCart}
        className="bg-slate-900/95 hover:bg-slate-900 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md border border-slate-800 flex items-center justify-between cursor-pointer group transition-all"
      >
        {/* Left: Thumbnail previews & Item count */}
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2 overflow-hidden">
            {previewItems.map((item, idx) => (
              <img
                key={item.cartId + idx}
                src={item.image}
                alt={item.name}
                className="inline-block h-8 w-8 rounded-lg ring-2 ring-slate-900 object-cover bg-slate-800"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
              {cart.map((i) => i.name).join(', ')}
            </span>
          </div>
        </div>

        {/* Right: Total Amount & Checkout Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Total</span>
            <span className="text-sm font-black text-white">₹{totalAmount}</span>
          </div>

          <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white p-2 rounded-xl flex items-center gap-1 font-extrabold text-xs shadow-md transition-colors">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
