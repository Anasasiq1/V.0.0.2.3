import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  Plus, 
  Minus, 
  Star, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  Zap,
  ShoppingBag,
  Check,
  Percent,
  Truck,
  Utensils,
  Clock,
  Store as StoreIcon,
  Tag,
  Layers,
  Sparkle
} from 'lucide-react';
import { Product, MarketCategory, MarketBanner, MarketSettings, CartItem, Module, Category, VendorStore } from '../types';

export interface MarketViewProps {
  products: Product[];
  categories: MarketCategory[];
  foodCategories?: Category[];
  modules?: Module[];
  stores?: VendorStore[];
  banners?: MarketBanner[];
  settings?: MarketSettings;
  cart: CartItem[];
  wishlist: string[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateCartQty: (productId: string, change: number) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectStore?: (store: VendorStore) => void;
  onSelectModule?: (moduleId: string) => void;
  onBack: () => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  products,
  categories,
  foodCategories = [],
  modules = [],
  stores = [],
  banners = [],
  settings,
  cart,
  wishlist,
  onAddToCart,
  onUpdateCartQty,
  onToggleWishlist,
  onSelectProduct,
  onSelectStore,
  onSelectModule,
  onBack,
  onOpenCart,
  onOpenWishlist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categoryPageIndex, setCategoryPageIndex] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const moduleScrollRef = useRef<HTMLDivElement>(null);

  // Super Admin Enabled Platform Modules in configured order
  const enabledModules = useMemo(() => {
    return (modules || [])
      .filter((m) => m && m.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [modules]);

  // Available Modules Bar list (combining All Market + enabled platform modules from Super Admin)
  const availableModules = useMemo(() => {
    return [
      { id: 'all', name: 'All Market', icon: '✨', tag: 'All' },
      ...enabledModules.map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon || '🛍️',
        tag: m.badge || (m.id === 'mod-food' ? 'Hot' : undefined),
      })),
    ];
  }, [enabledModules]);

  // Helper to resolve category or module name
  const getCategoryName = (catId: string | null) => {
    if (!catId) return '';
    const mCat = (categories || []).find((c) => c.id === catId);
    if (mCat) return mCat.name;
    const fCat = (foodCategories || []).find((c) => c.id === catId);
    if (fCat) return fCat.name;
    const mod = enabledModules.find((m) => m.id === catId);
    if (mod) return mod.name;
    return 'Category';
  };

  // Active Promo Banners
  const activeBanners = useMemo(() => {
    const list = (banners && banners.length > 0 ? banners : [])
      .filter((b) => b.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // If banners are empty or to ensure food promotions are visible
    if (list.length === 0) {
      return [
        {
          id: 'ban-food-combo',
          title: 'Hot Food Delights & Combos',
          subtitle: 'Crispy broast, dum biryani & gourmet burgers delivered warm in 20 mins',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
          badge: 'Chef Special',
          order: 1,
          enabled: true,
        },
        {
          id: 'ban-market-gadgets',
          title: 'Top Gadgets & Mobiles',
          subtitle: 'iPhone 17 Pro, Apple Watches & Gaming Gift Cards',
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
          badge: 'Top Deals',
          order: 2,
          enabled: true,
        }
      ];
    }

    // Add a hot food banner to the rotation if in "all" or "mod-food" mode
    return [
      {
        id: 'ban-chef-specials',
        title: 'Sizzling Kitchen & Fast Food',
        subtitle: 'Malabar Biryani, Smash Burgers & Stonebaked Pizzas at your doorstep',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
        badge: 'FLAT 25% OFF',
        order: 0,
        enabled: true,
      },
      ...list,
    ];
  }, [banners]);

  // Auto-rotate hero promo banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // Handle category carousel scroll indicator
  const handleCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = categoryScrollRef.current;
      const progress = scrollLeft / (scrollWidth - clientWidth || 1);
      setCategoryPageIndex(progress > 0.5 ? 1 : 0);
    }
  };

  // Harmonious Product Pool: All food dishes + market products + groceries (deduplicated by id)
  const allMixedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const seen = new Set<string>();
    return products.filter((p) => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [products]);

  // Chef's Hot Food Picks (from mod-food or food category)
  const hotFoodItems = useMemo(() => {
    return allMixedProducts.filter(
      (p) =>
        p.moduleId === 'mod-food' ||
        p.categoryId?.startsWith('cat-food') ||
        p.deliveryTime?.includes('min') ||
        p.badge?.toLowerCase().includes('chef') ||
        p.badge?.toLowerCase().includes('seller')
    );
  }, [allMixedProducts]);

  // Flash Deals of the Day (Mix of food deals and market items)
  const dealsOfTheDay = useMemo(() => {
    const deals = allMixedProducts.filter(
      (p) => p.is_deal_of_the_day || (p.discount_percent && p.discount_percent >= 15)
    );
    return deals.length > 0 ? deals : allMixedProducts.slice(0, 6);
  }, [allMixedProducts]);

  // Trending Products (Mix of viral beauty, gadget & popular dishes)
  const trendingProducts = useMemo(() => {
    const trending = allMixedProducts.filter((p) => p.is_trending || (p.rating && p.rating >= 4.85));
    return trending.length > 0 ? trending : allMixedProducts.slice(2, 10);
  }, [allMixedProducts]);

  // Brand / Kitchen Showcase (e.g. Tefal or Gourmet Burger Joint)
  const brandProducts = useMemo(() => {
    return allMixedProducts.filter((p) => p.brand?.toLowerCase().includes('tefal') || p.brand?.toLowerCase().includes('apple'));
  }, [allMixedProducts]);

  // Filtered product listing based on selected module, category, and search query
  const filteredProducts = useMemo(() => {
    return allMixedProducts.filter((p) => {
      // 1. Search Query
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryId?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Module Filter
      let matchesModule = true;
      if (selectedModuleId !== 'all') {
        if (selectedModuleId === 'mod-food') {
          matchesModule = p.moduleId === 'mod-food' || p.categoryId?.startsWith('cat-food');
        } else {
          matchesModule = p.moduleId === selectedModuleId || (selectedModuleId === 'market' && p.is_market);
        }
      }

      // 3. Category Filter
      let matchesCategory = true;
      if (selectedCategoryId) {
        matchesCategory =
          p.market_category_id === selectedCategoryId ||
          p.categoryId === selectedCategoryId;
      }

      return matchesSearch && matchesModule && matchesCategory;
    });
  }, [allMixedProducts, searchQuery, selectedModuleId, selectedCategoryId]);

  // Curated "Your Vibe" collection tiles (mixing food vibes and market vibes)
  const yourVibeTiles = useMemo(
    () => [
      {
        id: 'vibe-burgers',
        name: 'Juicy Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
        categoryId: 'cat-food-burger',
        moduleId: 'mod-food',
        isFood: true,
      },
      {
        id: 'vibe-biryani',
        name: 'Dum Biryani',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
        categoryId: 'cat-food',
        moduleId: 'mod-food',
        isFood: true,
      },
      {
        id: 'vibe-mobiles',
        name: 'Mobiles & Tech',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
        categoryId: 'mcat-electronics',
        moduleId: 'mod-electronics',
        isFood: false,
      },
      {
        id: 'vibe-perfumes',
        name: 'Arabic Scents',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80',
        categoryId: 'mcat-beauty',
        moduleId: 'mod-beauty',
        isFood: false,
      },
    ],
    []
  );

  const getProductCartQty = (productId: string) => {
    const item = cart.find((c) => c.productId === productId || (c as any).product?.id === productId);
    return item ? (item.qty ?? (item as any).quantity ?? 0) : 0;
  };

  const currencySymbol = settings?.currency_symbol || '₹';

  return (
    <div id="market-section-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100">
      {/* 1. TOP APP BAR & SEARCH */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 pt-3 pb-2 transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            id="market-btn-back"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{settings?.custom_hero_title || 'Market & Food Hall'}</span>
            </h1>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
              Food • Groceries • Lifestyle Hub
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="market-btn-wishlist"
              onClick={onOpenWishlist}
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar matching modern quick commerce */}
        <div className="max-w-md mx-auto mt-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              id="market-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, biryani, phones, perfumes..."
              className="w-full bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 pl-11 pr-10 py-2.5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 border border-transparent dark:border-slate-700/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. INTERACTIVE MODULE SELECTOR TABS (Food, Grocery, Electronics, Beauty, etc.) */}
        <div className="max-w-md mx-auto mt-2.5">
          <div
            ref={moduleScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {availableModules.map((mod) => {
              const isSelected = selectedModuleId === mod.id;
              const isFoodMod = mod.id === 'mod-food';

              return (
                <button
                  key={mod.id}
                  id={`market-module-tab-${mod.id}`}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setSelectedCategoryId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? isFoodMod
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-102'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <span className="text-sm">{mod.icon}</span>
                  <span>{mod.name}</span>
                  {mod.tag && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {mod.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-3 space-y-5">
        {/* 3. PLATFORM MODULES LIST / EXPLORE CATEGORIES (USING SAME PLATFORM MODULE DATA) */}
        <section id="market-categories-carousel" className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Explore Categories</span>
            </span>
            {selectedModuleId !== 'all' && (
              <button
                onClick={() => setSelectedModuleId('all')}
                className="text-[11px] font-black text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div
            ref={categoryScrollRef}
            onScroll={handleCategoryScroll}
            className="flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {enabledModules.map((mod, idx) => {
              const isSelected = selectedModuleId === mod.id;
              return (
                <button
                  key={`market-module-pill-${mod.id}-${idx}`}
                  id={`market-mod-${mod.id}`}
                  onClick={() => {
                    if (onSelectModule) {
                      onSelectModule(mod.id);
                    } else {
                      setSelectedModuleId(isSelected ? 'all' : mod.id);
                    }
                  }}
                  className="flex flex-col items-center flex-shrink-0 w-[74px] snap-start group cursor-pointer"
                >
                  <div
                    style={{ background: mod.bgColor || undefined }}
                    className={`relative w-16 h-16 rounded-2xl p-1 flex items-center justify-center overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'ring-2.5 ring-rose-600 bg-rose-50 dark:bg-rose-950/50 scale-105 shadow-md'
                        : !mod.bgColor
                        ? 'bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 group-hover:scale-105'
                        : 'shadow-xs group-hover:scale-105'
                    }`}
                  >
                    {mod.image ? (
                      <img
                        src={mod.image}
                        alt={mod.name}
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : mod.icon && (mod.icon.startsWith('http') || mod.icon.startsWith('data:')) ? (
                      <img
                        src={mod.icon}
                        alt={mod.name}
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-2xl">{mod.icon || '🛍️'}</span>
                    )}

                    {mod.time && (
                      <span className="absolute bottom-1 bg-black/60 backdrop-blur-xs text-white text-[7px] font-black px-1 rounded shadow-xs">
                        {mod.time}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-bold text-center leading-tight line-clamp-2 px-0.5 ${
                      isSelected ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mod.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Pagination Dots */}
          <div className="flex justify-center items-center gap-1.5 pt-0.5">
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                categoryPageIndex === 0 ? 'w-4 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                categoryPageIndex === 1 ? 'w-4 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          </div>
        </section>

        {/* ACTIVE CATEGORY FILTER CHIP */}
        {selectedCategoryId && (
          <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl px-3.5 py-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                Filtered by:{' '}
                <span className="font-black">
                  {getCategoryName(selectedCategoryId)}
                </span>
              </span>
            </div>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs text-rose-600 dark:text-rose-400 font-extrabold hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* 4. HERO PROMO BANNERS / ROTATING CAROUSEL */}
        {activeBanners.length > 0 && !searchQuery && !selectedCategoryId && (
          <section id="market-hero-banners" className="relative space-y-2 pt-1">
            <div className="relative w-full aspect-[2.4/1] rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800 bg-slate-900">
              {activeBanners.map((ban, idx) => (
                <div
                  key={ban.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={ban.image}
                    alt={ban.title}
                    className="w-full h-full object-cover brightness-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                    {ban.badge && (
                      <span className="inline-block self-start text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full mb-1 shadow-sm">
                        {ban.badge}
                      </span>
                    )}
                    <h3 className="text-white text-base font-black tracking-tight leading-snug drop-shadow-md">
                      {ban.title}
                    </h3>
                    {ban.subtitle && (
                      <p className="text-white/85 text-[11px] font-medium line-clamp-1 drop-shadow">
                        {ban.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Pagination Dots */}
            {activeBanners.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-0.5">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentBannerIndex
                        ? 'w-5 bg-slate-900 dark:bg-white'
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. HOT FROM THE KITCHEN & QUICK BITES (EXCLUSIVE FOOD SHOWCASE IN MARKET) */}
        {(!selectedCategoryId && !searchQuery && hotFoodItems.length > 0 && (selectedModuleId === 'all' || selectedModuleId === 'mod-food')) && (
          <section id="market-hot-kitchen-section" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                    <span>Hot Kitchen & Quick Bites</span>
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                      Fast 20m
                    </span>
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedModuleId('mod-food')}
                className="text-xs font-black text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Full Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {hotFoodItems.slice(0, 8).map((food) => {
                const inCartQty = getProductCartQty(food.id);
                const isFavorite = wishlist.includes(food.id);

                return (
                  <div
                    key={food.id}
                    id={`hot-food-${food.id}`}
                    onClick={() => onSelectProduct(food)}
                    className="flex-shrink-0 w-44 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md p-2.5 cursor-pointer flex flex-col justify-between transition-all"
                  >
                    <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-800/40 rounded-2xl overflow-hidden flex items-center justify-center">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {/* Delivery Time Badge */}
                      <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span>{food.deliveryTime || '20 min'}</span>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(food.id);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                        {food.name}
                      </h4>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {currencySymbol}{food.price}
                          </span>
                          {food.oldPrice && food.oldPrice > food.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {currencySymbol}{food.oldPrice}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {inCartQty === 0 ? (
                            <button
                              id={`add-food-btn-${food.id}`}
                              onClick={() => onAddToCart(food, 1)}
                              className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          ) : (
                            <div className="flex items-center bg-rose-600 text-white rounded-full p-0.5 shadow-sm">
                              <button
                                onClick={() => onUpdateCartQty(food.id, -1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-rose-700 cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5 stroke-[3]" />
                              </button>
                              <span className="text-[10px] font-black px-1 min-w-[14px] text-center">
                                {inCartQty}
                              </span>
                              <button
                                onClick={() => onUpdateCartQty(food.id, 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-rose-700 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. "INSPIRED BY YOUR CHOICES" & "YOUR VIBE" TILES (MIXED FOOD + MARKET) */}
        {(!selectedCategoryId && !searchQuery && settings?.show_your_vibe !== false && selectedModuleId === 'all') && (
          <section id="market-your-vibe-section" className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">
                Inspired by your choices
              </h2>
              <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>Your Vibe</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {yourVibeTiles.map((tile) => (
                <button
                  key={tile.id}
                  id={`vibe-tile-${tile.id}`}
                  onClick={() => {
                    if (tile.moduleId) setSelectedModuleId(tile.moduleId);
                    if (tile.categoryId) setSelectedCategoryId(tile.categoryId);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 shadow-sm group-hover:scale-105 transition-all overflow-hidden relative">
                    <img
                      src={tile.image}
                      alt={tile.name}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    {tile.isFood && (
                      <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[8px] font-black px-1 rounded shadow-xs">
                        FOOD
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1.5 font-bold text-center text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">
                    {tile.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 7. DEALS OF THE DAY / MEGA SAVINGS (MIXED FOOD + MARKET) */}
        {(!selectedCategoryId && !searchQuery && settings?.show_deals_of_day !== false && dealsOfTheDay.length > 0) && (
          <section id="market-deals-of-the-day" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Deals of the Day</span>
              </h2>
              <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                Up to 30% OFF
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {dealsOfTheDay.slice(0, 6).map((deal) => {
                const isFood = deal.moduleId === 'mod-food' || deal.categoryId?.startsWith('cat-food');

                return (
                  <div
                    key={deal.id}
                    id={`deal-card-${deal.id}`}
                    onClick={() => onSelectProduct(deal)}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md overflow-hidden cursor-pointer flex flex-col transition-all duration-200"
                  >
                    <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 p-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {/* Price Tag bottom-left */}
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-950/85 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm tracking-tight">
                        {currencySymbol}{deal.price}
                      </div>

                      {/* Food / Tech Tag top-right */}
                      {isFood ? (
                        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[8px] font-black px-1 rounded shadow-xs">
                          FOOD
                        </div>
                      ) : deal.discount_percent ? (
                        <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[8px] font-black px-1 rounded shadow-xs">
                          {deal.discount_percent}%
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 8. MAIN 2-COLUMN MIXED PRODUCT GRID */}
        <section id="market-products-grid-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {selectedCategoryId
                  ? getCategoryName(selectedCategoryId) || 'Filtered Products'
                  : selectedModuleId !== 'all'
                  ? availableModules.find((m) => m.id === selectedModuleId)?.name || 'Module Catalog'
                  : searchQuery
                  ? `Results for "${searchQuery}"`
                  : 'Market & Food Hall Collection'}
              </h2>
              <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items available'}
              </span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                No items found in this section
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try searching for another dish, burger, gadget or clear your active filters.
              </p>
              {(selectedCategoryId || selectedModuleId !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSelectedModuleId('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-black bg-rose-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-rose-700 transition-colors shadow-sm"
                >
                  View All Market Items
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((prod) => {
                const inCartQty = getProductCartQty(prod.id);
                const isFavorite = wishlist.includes(prod.id);
                const isFood = prod.moduleId === 'mod-food' || prod.categoryId?.startsWith('cat-food');

                return (
                  <div
                    key={prod.id}
                    id={`market-prod-card-${prod.id}`}
                    className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Image Area */}
                    <div 
                      onClick={() => onSelectProduct(prod)}
                      className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/30 p-2.5 flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Wishlist Heart Top Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(prod.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all cursor-pointer shadow-xs"
                        aria-label="Favorite"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Category Type & Discount Badge Top Left */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {isFood ? (
                          <div className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            <Utensils className="w-2.5 h-2.5" />
                            <span>FOOD</span>
                          </div>
                        ) : prod.discount_percent ? (
                          <div className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            {prod.discount_percent}% OFF
                          </div>
                        ) : prod.badge ? (
                          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            {prod.badge}
                          </div>
                        ) : null}
                      </div>

                      {/* Floating Add to Cart Button Bottom Right */}
                      <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                        {inCartQty === 0 ? (
                          <button
                            id={`add-market-prod-${prod.id}`}
                            onClick={() => onAddToCart(prod, 1)}
                            className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            aria-label="Add to cart"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        ) : (
                          <div className="flex items-center bg-rose-600 text-white rounded-full p-0.5 shadow-md">
                            <button
                              onClick={() => onUpdateCartQty(prod.id, -1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span className="text-[11px] font-black px-1.5 min-w-[16px] text-center">
                              {inCartQty}
                            </span>
                            <button
                              onClick={() => onUpdateCartQty(prod.id, 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Details Area */}
                    <div 
                      onClick={() => onSelectProduct(prod)}
                      className="p-3 pt-2 space-y-1.5 cursor-pointer flex-1 flex flex-col justify-between"
                    >
                      <div>
                        {/* Price & Free Delivery Tag */}
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {currencySymbol}{prod.price}
                          </span>
                          {prod.oldPrice && prod.oldPrice > prod.price && (
                            <span className="text-[11px] text-slate-400 line-through font-medium">
                              {currencySymbol}{prod.oldPrice}
                            </span>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          {isFood ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-[9px]">
                              <Clock className="w-3 h-3" />
                              <span>{prod.deliveryTime || '20-25 min'}</span>
                            </div>
                          ) : prod.free_delivery ? (
                            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black text-[9px]">
                              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-1 py-0.2 rounded font-black">
                                S+
                              </span>
                              <span>Free Delivery</span>
                            </div>
                          ) : (
                            <span>{prod.deliveryTime || 'Fast Delivery'}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mt-1">
                          {prod.name}
                        </h4>
                      </div>

                      {/* Star Rating & Reviews */}
                      <div className="flex items-center gap-1 pt-1 border-t border-slate-50 dark:border-slate-800/40">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {prod.rating || 4.8}
                        </span>
                        <div className="flex text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                        {prod.rating_count && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ({prod.rating_count})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 9. TRENDING PRODUCTS HORIZONTAL ROW */}
        {(!selectedCategoryId && !searchQuery && trendingProducts.length > 0 && settings?.show_trending !== false && selectedModuleId === 'all') && (
          <section id="market-trending-section" className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Trending Across Food & Market</span>
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {trendingProducts.map((trend) => {
                const inCartQty = getProductCartQty(trend.id);
                return (
                  <div
                    key={trend.id}
                    onClick={() => onSelectProduct(trend)}
                    className="flex-shrink-0 w-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-2 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                      <img
                        src={trend.image}
                        alt={trend.name}
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      {trend.discount_percent && (
                        <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                          {trend.discount_percent}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {currencySymbol}{trend.price}
                      </span>
                      <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                        {trend.name}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
