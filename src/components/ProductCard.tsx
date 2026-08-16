import React, { useState } from 'react';
import { Plus, Minus, Star, Heart, Clock, AlertCircle } from 'lucide-react';
import { Product, CartItem } from '../types';
import { getCategoryTheme } from '../lib/categoryTheme';

export interface ProductCardProps {
  product: Product;
  categoryName?: string;
  cartItem?: CartItem;
  variant?: 'compact' | 'standard' | 'large' | 'horizontal';
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, change: number) => void;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  categoryName,
  cartItem,
  variant = 'standard',
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onUpdateQty,
  onOpenDetail,
}) => {
  const [wishlist, setWishlist] = useState(isWishlisted);

  if (!product) {
    return null;
  }

  const theme = getCategoryTheme(product.moduleId);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= (product.stock_alert_threshold || 5);
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(!wishlist);
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  // Horizontal Card Variant
  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => onOpenDetail?.(product)}
        className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex items-center gap-3 relative cursor-pointer group"
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {categoryName && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide truncate">
              {categoryName}
            </p>
          )}
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-black">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{product.rating || 4.5}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
              <Clock className="w-3 h-3" />
              <span>{product.deliveryTime}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-sm font-black text-slate-900 dark:text-white">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-[11px] text-slate-400 line-through font-semibold">₹{product.oldPrice}</span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {cartItem ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-2 py-1 shadow-sm"
            >
              <button
                onClick={() => onUpdateQty(product.id, -1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[14px] text-center">{cartItem.qty}</span>
              <button
                onClick={() => onUpdateQty(product.id, 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={isOutOfStock}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shadow-xs transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'ADD +'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Standard Grid Product Card
  return (
    <div
      onClick={() => onOpenDetail?.(product)}
      className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden group cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-900/40 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-500 transition-colors shadow-xs cursor-pointer z-10"
        >
          <Heart className={`w-4 h-4 ${wishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Low Stock or Prescription Alert Tag */}
        {isLowStock && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-amber-500/95 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center justify-center gap-1 shadow-xs">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Only {product.stock} left</span>
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate mb-0.5">
              {categoryName}
            </p>
          )}

          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors min-h-[32px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border border-amber-200/50">
              <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
              <span>{product.rating || 4.8}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {product.deliveryTime}
            </span>
          </div>
        </div>

        {/* Price & Add to Cart Section */}
        <div className="pt-2 mt-2 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white">
              ₹{product.price}
            </div>
            {product.oldPrice && (
              <div className="text-[10px] text-slate-400 line-through font-semibold">
                ₹{product.oldPrice}
              </div>
            )}
          </div>

          {cartItem ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-emerald-600 text-white rounded-xl shadow-xs px-1.5 py-0.5"
            >
              <button
                onClick={() => onUpdateQty(product.id, -1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold min-w-[16px] text-center px-1">{cartItem.qty}</span>
              <button
                onClick={() => onUpdateQty(product.id, 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={isOutOfStock}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'ADD +'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

