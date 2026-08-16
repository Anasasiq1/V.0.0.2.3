import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { X, Star, Heart, Plus, Minus, ShoppingBag, ShieldCheck, Truck, ChevronRight, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number, variantName?: string, priceOverride?: number) => void;
  onOpenStore?: (storeId: string) => void;
  storeName?: string;
  storeWhatsapp?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenStore,
  storeName = 'Hyperlocal Merchant',
  storeWhatsapp,
}) => {
  if (!product) return null;

  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const mockVariants = [
    { name: 'Regular Pack', price: product.price },
    { name: 'Value Pack (2x)', price: Math.round(product.price * 1.85) },
    { name: 'Family Pack (3x)', price: Math.round(product.price * 2.65) },
  ];

  const currentPrice = mockVariants[selectedVariantIdx]?.price || product.price;
  const originalPrice = product.oldPrice ? product.oldPrice : Math.round(currentPrice * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalPrice - currentPrice) / originalPrice) * 100));

  const handleAdd = () => {
    onAddToCart(
      product,
      qty,
      mockVariants[selectedVariantIdx]?.name,
      currentPrice
    );
    onClose();
  };

  const handleWhatsAppInquiry = () => {
    let cleanPhone = (storeWhatsapp || '919876543210').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const msg = `Hi ${storeName}! 👋 I am interested in ordering *${product.name}* (Price: ₹${currentPrice}). Is it available right now?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800">
        {/* Sticky Top Controls */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md pointer-events-auto cursor-pointer hover:bg-white hover:scale-105 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md pointer-events-auto cursor-pointer hover:bg-white hover:scale-105 transition-transform"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Image Gallery Header */}
        <div className="-mt-16 relative h-64 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {product.badge && (
            <div className="absolute top-20 left-4 z-10">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-amber-200/40">
                <Sparkles className="w-3.5 h-3.5" />
                {product.badge}
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <span className="w-3 h-1.5 rounded-full bg-amber-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Title & Merchant Link */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
                {product.category || 'General Essentials'}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> In Stock & Ready
              </span>
            </div>

            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
              {product.name}
            </h1>

            {product.store_id && (
              <button
                onClick={() => onOpenStore && onOpenStore(product.store_id!)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1.5 cursor-pointer"
              >
                <span>Sold by {storeName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rating & Pricing */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{currentPrice}</span>
                {originalPrice > currentPrice && (
                  <span className="text-sm text-slate-400 font-bold line-through">₹{originalPrice}</span>
                )}
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Inclusive of all local taxes</p>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-2xl text-xs font-extrabold border border-amber-200/60 shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9</span>
              <span className="text-slate-400 font-semibold">(140+)</span>
            </div>
          </div>

          {/* Delivery & Assurance Highlights */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 block">15-30 Min Delivery</span>
                <span className="text-[9px] text-slate-400 block font-medium">Hyperlocal dispatch</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 block">100% Quality Checked</span>
                <span className="text-[9px] text-slate-400 block font-medium">Freshness guaranteed</span>
              </div>
            </div>
          </div>

          {/* Select Size/Variant */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Package Option
            </label>
            <div className="grid grid-cols-3 gap-2">
              {mockVariants.map((v, idx) => (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedVariantIdx === idx
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-black shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                  }`}
                >
                  <span className="block text-[11px] truncate">{v.name}</span>
                  <span className="block text-xs font-black mt-0.5">₹{v.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Overview Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Product Details & Highlights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {product.description ||
                `Premium grade ${product.name}, hand-selected and carefully stored to maintain optimal freshness and peak quality for your doorstep delivery.`}
            </p>
          </div>

          {/* Quick WhatsApp Inquiry */}
          <button
            onClick={handleWhatsAppInquiry}
            className="w-full bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Direct WhatsApp Inquiry with Store</span>
          </button>

          {/* Quantity Counter & Add Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-white font-black shadow-xs cursor-pointer hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-black text-sm text-slate-900 dark:text-white">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-white font-black shadow-xs cursor-pointer hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart • ₹{currentPrice * qty}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

