import React from 'react';
import { PlatformTemplateProps } from './HMQModernTemplate';
import { ProductCard } from '../../components/ProductCard';
import { StoreCard } from '../../components/StoreCard';
import { BottomNav } from '../../components/BottomNav';
import {
  Compass,
  Sparkles,
  MapPin,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  Award,
  Clock,
  Heart,
  ShoppingBag,
  ArrowRight,
  Store,
  Crown,
} from 'lucide-react';

export const HMQVintageTemplate: React.FC<PlatformTemplateProps> = (props) => {
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F4] dark:bg-[#181512] text-[#3D2E24] dark:text-[#E8DFC8] pb-24 font-serif">
      {/* 1. Vintage Heritage Header */}
      <header className="sticky top-0 z-30 bg-[#F4EDE2]/95 dark:bg-[#201C17]/95 backdrop-blur-md border-b border-[#D8C7B0] dark:border-[#383025] px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C3A27] text-[#FFF6EB] flex items-center justify-center shadow-inner border border-[#6E2A1A]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-[#8C3A27] dark:text-[#E89E73] font-serif">
                  {appData.settings?.store_name || 'HM-Q Heritage'}
                </h1>
                <span className="text-[9px] font-sans font-bold uppercase px-2 py-0.5 bg-[#8C3A27]/10 text-[#8C3A27] dark:bg-[#8C3A27]/30 dark:text-[#E89E73] rounded-full border border-[#8C3A27]/20">
                  Vintage
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#786452] dark:text-[#A89886] flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3.5 h-3.5 text-[#8C3A27] shrink-0" />
                {deliveryAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-[#E8DFC8] dark:bg-[#2D271F] text-[#5A4535] dark:text-[#D8C7B0] transition-colors"
              title="Toggle Theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            <button
              onClick={onOpenCartDrawer}
              className="relative p-2.5 rounded-xl bg-[#8C3A27] text-[#FFF6EB] font-sans font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>₹{cart.reduce((s, i) => s + i.price * i.qty, 0)}</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C98A2C] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Vintage Search & Filter Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div
            onClick={onOpenSearchOverlay}
            className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#25201A] border border-[#D8C7B0] dark:border-[#383025] rounded-xl cursor-pointer shadow-2xs"
          >
            <Search className="w-4 h-4 text-[#8C3A27]" />
            <span className="text-xs font-sans text-[#786452] dark:text-[#A89886]">
              {searchQuery || 'Search artisanal products, spices, sweets & stores...'}
            </span>
          </div>

          {onOpenFilterSheet && (
            <button
              onClick={onOpenFilterSheet}
              className="p-2.5 bg-[#E8DFC8] dark:bg-[#2D271F] border border-[#D8C7B0] dark:border-[#383025] rounded-xl text-[#8C3A27] dark:text-[#E89E73]"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Vintage Canvas */}
      <div className="px-4 py-4 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Heritage Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#5B2317] via-[#8C3A27] to-[#C98A2C] text-[#FFF6EB] p-6 shadow-md border border-[#8C3A27]/40">
          <div className="max-w-md space-y-2">
            <span className="inline-block px-3 py-1 bg-[#FFF6EB]/20 backdrop-blur-sm rounded-full text-[10px] font-sans font-black tracking-wider uppercase border border-[#FFF6EB]/30">
              Est. Malabar Heritage Bazaar
            </span>
            <h2 className="text-2xl font-bold tracking-tight leading-snug">
              Authentic Local Flavours & Timeless Craftsmanship
            </h2>
            <p className="text-xs font-sans opacity-90 leading-relaxed">
              Piping hot Malabar Biryani, traditional spices, handcrafted bakeries, and fresh farm harvests delivered with traditional care.
            </p>
          </div>
        </div>

        {/* Vintage Categories Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-[#8C3A27] dark:text-[#E89E73] flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Artisanal Departments
            </h3>
            <button
              onClick={() => handleNavigateTab('categories')}
              className="text-xs font-sans font-bold text-[#8C3A27] dark:text-[#E89E73] hover:underline flex items-center gap-0.5"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-sans font-bold whitespace-nowrap transition-all border ${
                activeCategoryId === 'all'
                  ? 'bg-[#8C3A27] text-[#FFF6EB] border-[#8C3A27] shadow-sm'
                  : 'bg-white dark:bg-[#25201A] text-[#786452] dark:text-[#A89886] border-[#D8C7B0] dark:border-[#383025] hover:border-[#8C3A27]'
              }`}
            >
              All Specialities
            </button>
            {(appData.categories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-sans font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  activeCategoryId === cat.id
                    ? 'bg-[#8C3A27] text-[#FFF6EB] border-[#8C3A27] shadow-sm'
                    : 'bg-white dark:bg-[#25201A] text-[#786452] dark:text-[#A89886] border-[#D8C7B0] dark:border-[#383025] hover:border-[#8C3A27]'
                }`}
              >
                <span>{cat.icon || '🛍️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Heritage Merchant Stores */}
        {(appData.stores || []).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-[#8C3A27] dark:text-[#E89E73] flex items-center gap-1.5">
                <Store className="w-4 h-4" /> Heritage Merchant Guild
              </h3>
              <button
                onClick={() => handleNavigateTab('stores')}
                className="text-xs font-sans font-bold text-[#8C3A27] dark:text-[#E89E73] hover:underline flex items-center gap-0.5"
              >
                All Merchants <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(appData.stores || []).slice(0, 3).map((store) => (
                <div
                  key={store.id}
                  onClick={() => onOpenStoreDetail(store)}
                  className="bg-white dark:bg-[#25201A] border border-[#D8C7B0] dark:border-[#383025] rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-[#8C3A27] transition-all cursor-pointer flex items-center gap-3.5"
                >
                  <img
                    src={store.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                    alt={store.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#D8C7B0] dark:border-[#383025]"
                  />
                  <div className="flex-1 min-w-0 font-sans">
                    <h4 className="font-serif font-bold text-sm text-[#3D2E24] dark:text-[#E8DFC8] truncate">
                      {store.name}
                    </h4>
                    <p className="text-xs text-[#786452] dark:text-[#A89886] truncate">
                      {store.address || 'Town Centre'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#8C3A27] dark:text-[#E89E73] bg-[#8C3A27]/10 dark:bg-[#8C3A27]/20 px-2 py-0.5 rounded">
                        ★ {store.rating || '4.9'}
                      </span>
                      <span className="text-[10px] text-[#786452] dark:text-[#A89886]">
                        {store.delivery_time || '25 mins'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vintage Catalog Products Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-[#8C3A27] dark:text-[#E89E73] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Handcrafted Catalog ({sortedProducts.length})
            </h3>
            <span className="text-[11px] font-sans text-[#786452] dark:text-[#A89886]">
              Verified Fresh & Guaranteed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {sortedProducts.map((product) => {
              const inCart = (cart || []).find((c) => c.id === product.id);
              const qty = inCart ? inCart.qty : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#25201A] border border-[#D8C7B0] dark:border-[#383025] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#8C3A27] transition-all flex flex-col justify-between group"
                >
                  <div
                    onClick={() => onOpenDetailProduct(product)}
                    className="cursor-pointer p-3 pb-0"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F4EDE2] dark:bg-[#1F1B16] mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 text-[9px] font-sans font-bold bg-[#8C3A27] text-[#FFF6EB] px-2 py-0.5 rounded-full shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-xs text-[#3D2E24] dark:text-[#E8DFC8] line-clamp-2 min-h-[32px]">
                      {product.name}
                    </h4>
                    <p className="text-[10px] font-sans text-[#786452] dark:text-[#A89886] mt-0.5">
                      {product.unit || '1 Portion'}
                    </p>
                  </div>

                  <div className="p-3 pt-2 font-sans flex items-center justify-between border-t border-[#F4EDE2] dark:border-[#302921] mt-2">
                    <div>
                      <span className="text-xs font-bold text-[#8C3A27] dark:text-[#E89E73]">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-zinc-400 line-through ml-1">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-[#8C3A27] text-[#FFF6EB] px-2 py-1 rounded-xl text-xs font-bold shadow-xs">
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
                        className="px-3 py-1 bg-[#8C3A27] hover:bg-[#722E1E] text-[#FFF6EB] rounded-xl text-xs font-bold shadow-xs transition-colors"
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
