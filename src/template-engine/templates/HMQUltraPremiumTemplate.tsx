import React from 'react';
import { PlatformTemplateProps } from './HMQModernTemplate';
import { ProductCard } from '../../components/ProductCard';
import { StoreCard } from '../../components/StoreCard';
import { BottomNav } from '../../components/BottomNav';
import {
  Crown,
  Sparkles,
  MapPin,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  Diamond,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Store,
  Star,
  Zap,
} from 'lucide-react';

export const HMQUltraPremiumTemplate: React.FC<PlatformTemplateProps> = (props) => {
  const {
    appData,
    activeModuleId,
    activeCategoryId,
    searchQuery,
    cart = [],
    sortedProducts = [],
    deliveryAddress = 'Tirur, Kerala',
    isWhatsappLoggedIn = false,
    navTab = 'home',
    onSelectModule,
    onSelectCategory,
    onSearchChange,
    onOpenSearchOverlay,
    onOpenFilterSheet,
    onOpenStoreDetail: onOpenStoreDetailProp,
    onAddToCart,
    onUpdateCartQty,
    onOpenCartDrawer,
    onToggleTheme,
    onOpenLinkModal,
  } = props;

  const handleNavigateTab = (tab: string) => {
    if (typeof props.onNavigateTab === 'function') {
      props.onNavigateTab(tab);
    } else if (typeof props.onSelectTab === 'function') {
      props.onSelectTab(tab);
    } else if (typeof props.onChangeTab === 'function') {
      props.onChangeTab(tab);
    }
  };

  const onOpenDetailProduct = props.onOpenDetailProduct || props.onOpenDetail || (() => {});
  const onOpenStoreDetail = onOpenStoreDetailProp || props.onSelectStore || (() => {});
  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.qty || (item as any).quantity || 0), 0);
  const cartTotalAmount = (cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || (item as any).quantity || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0C] text-[#F3F4F6] pb-24 selection:bg-[#D4AF37] selection:text-black">
      {/* 1. Ultra Premium Luxe Obsidian Header */}
      <header className="sticky top-0 z-30 bg-[#0F0F14]/90 backdrop-blur-xl border-b border-[#2A2A38] px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#997A15] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0A0A0C] rounded-[14px] flex items-center justify-center text-[#F5D77F]">
                <Diamond className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1">
                  {appData.settings?.store_name || 'HM-Q Luxe'}
                </h1>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#D4AF37]/20 text-[#F5D77F] rounded-full border border-[#D4AF37]/40 tracking-wider">
                  ULTRA PREMIER
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                {deliveryAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-[#171720] border border-[#2A2A38] text-[#D4AF37] transition-colors"
              title="Toggle Theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            <button
              onClick={onOpenCartDrawer}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#B38F1E] text-black font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>₹{cartTotalAmount}</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-[#F5D77F] border border-[#D4AF37] rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Ultra Premium Search & Filter */}
        <div className="mt-3 flex items-center gap-2">
          <div
            onClick={onOpenSearchOverlay}
            className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-[#14141C] border border-[#2A2A38] rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
          >
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs text-zinc-400 truncate">
              {searchQuery || 'Search luxury brands, gourmet delicacies & stores...'}
            </span>
          </div>

          {onOpenFilterSheet && (
            <button
              onClick={onOpenFilterSheet}
              className="p-2.5 bg-[#14141C] border border-[#2A2A38] hover:border-[#D4AF37] rounded-xl text-[#F5D77F] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Luxury Canvas */}
      <div className="px-4 py-4 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* VIP Black Gold Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#12121A] via-[#1A1A26] to-[#252538] border border-[#D4AF37]/30 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[10px] font-black text-[#F5D77F] tracking-widest uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 fill-current" /> ROYAL CLUB PRIVILEGE
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">15-Min Express Dispatch</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white leading-snug">
              Curated Luxury Hyperlocal Commerce
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Experience hand-selected gourmet meals, high-end electronics, imported confectionery, and premium lifestyle essentials delivered instantly.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Exclusive Boutiques
            </h3>
            <button
              onClick={() => handleNavigateTab('categories')}
              className="text-xs font-bold text-[#F5D77F] hover:underline flex items-center gap-0.5"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategoryId === 'all'
                  ? 'bg-gradient-to-r from-[#F5D77F] to-[#D4AF37] text-black border-[#D4AF37] shadow-md font-black'
                  : 'bg-[#14141C] text-zinc-300 border-[#2A2A38] hover:border-[#D4AF37]/50'
              }`}
            >
              All Boutiques
            </button>
            {(appData.categories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  activeCategoryId === cat.id
                    ? 'bg-gradient-to-r from-[#F5D77F] to-[#D4AF37] text-black border-[#D4AF37] shadow-md font-black'
                    : 'bg-[#14141C] text-zinc-300 border-[#2A2A38] hover:border-[#D4AF37]/50'
                }`}
              >
                <span>{cat.icon || '✨'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Luxury Merchant Stores */}
        {(appData.stores || []).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#D4AF37]" /> Premier Flagship Stores
              </h3>
              <button
                onClick={() => handleNavigateTab('stores')}
                className="text-xs font-bold text-[#F5D77F] hover:underline flex items-center gap-0.5"
              >
                All Flagships <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(appData.stores || []).slice(0, 3).map((store) => (
                <div
                  key={store.id}
                  onClick={() => onOpenStoreDetail(store)}
                  className="bg-[#12121A] border border-[#2A2A38] hover:border-[#D4AF37] rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img
                    src={store.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                    alt={store.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#2A2A38] group-hover:border-[#D4AF37]/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-[#F5D77F] transition-colors">
                      {store.name}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">
                      {store.address || 'Flagship Outlet'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-[#F5D77F] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" /> {store.rating || '5.0'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {store.delivery_time || '20 mins'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ultra Premium Products Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <Diamond className="w-4 h-4 text-[#D4AF37]" /> Curated Collection ({sortedProducts.length})
            </h3>
            <span className="text-[11px] text-zinc-400">
              Direct from Verified Flagships
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {sortedProducts.map((product) => {
              const inCart = (cart || []).find((c) => c.id === product.id);
              const qty = inCart ? inCart.qty : 0;

              return (
                <div
                  key={product.id}
                  className="bg-[#12121A] border border-[#2A2A38] hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div
                    onClick={() => onOpenDetailProduct(product)}
                    className="cursor-pointer p-3 pb-0"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#181824] mb-2 border border-[#252535]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 text-[9px] font-black bg-black/80 text-[#F5D77F] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-white line-clamp-2 min-h-[32px] group-hover:text-[#F5D77F] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {product.unit || '1 Unit'}
                    </p>
                  </div>

                  <div className="p-3 pt-2 flex items-center justify-between border-t border-[#1F1F2C] mt-2">
                    <div>
                      <span className="text-xs font-black text-[#F5D77F]">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-zinc-500 line-through ml-1">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#F5D77F] to-[#D4AF37] text-black px-2 py-1 rounded-xl text-xs font-black shadow-md">
                        <button
                          onClick={() => onUpdateCartQty(product.id, -1)}
                          className="hover:opacity-80 px-1"
                        >
                          -
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => onUpdateCartQty(product.id, 1)}
                          className="hover:opacity-80 px-1"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => (onAddToCart ? onAddToCart(product) : onUpdateCartQty(product.id, 1))}
                        className="px-3 py-1 bg-[#1C1C28] hover:bg-gradient-to-r hover:from-[#F5D77F] hover:to-[#D4AF37] text-[#F5D77F] hover:text-black border border-[#D4AF37]/40 rounded-xl text-xs font-black transition-all"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
