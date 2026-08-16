import React, { useState } from 'react';
import { Star, MapPin, Clock, Heart, ShieldCheck } from 'lucide-react';
import { VendorStore } from '../types';

export interface StoreCardProps {
  store: VendorStore;
  onSelectStore?: (store: VendorStore) => void;
}

export const StoreCard: React.FC<StoreCardProps> = React.memo(({ store, onSelectStore }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isOpen = store.active !== false;

  const mockCover = store.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelectStore?.(store)}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col relative"
    >
      {/* Cover Image */}
      <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
        <img
          src={mockCover}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Heart Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 transition-colors z-10 cursor-pointer shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Circular Logo Badge Overlaid on Cover */}
        <div className="absolute -bottom-3 left-3 w-14 h-14 rounded-full bg-white dark:bg-slate-800 p-1 shadow-md z-10 flex items-center justify-center border-2 border-white dark:border-slate-800">
          <div className="w-full h-full rounded-full bg-slate-900 text-white flex flex-col items-center justify-center p-1 text-center font-black text-[9px] leading-tight overflow-hidden">
            <span className="text-amber-400 text-[8px] font-extrabold uppercase">STORE</span>
            <span className="truncate w-full text-[8px] uppercase">{store.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="pt-5 p-3.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {store.name}
          </h3>
          <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span>4.8</span>
            <span className="text-[10px] text-slate-400 font-medium">(210)</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium truncate">{store.category || 'Beauty & Personal Care'}</p>

        <div className="flex items-center justify-between text-[11px] font-bold pt-1">
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Open • Closes 10:00 PM
          </span>

          <span className="text-slate-400 font-semibold">{store.address.includes('0.') ? store.address : '0.3 km'}</span>
        </div>

        <div className="pt-1.5 flex items-center gap-2">
          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
            Free Delivery
          </span>
        </div>
      </div>
    </div>
  );
});

