import React from 'react';
import { AppData, Product, VendorStore, CartItem } from '../../types';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { CategoryBar } from '../../components/CategoryBar';
import { PromoBanners } from '../../components/PromoBanners';
import { ProductCard } from '../../components/ProductCard';
import { StoreCard } from '../../components/StoreCard';
import { BottomNav } from '../../components/BottomNav';
import { SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';

export interface PlatformTemplateProps {
  appData: AppData;
  activeModuleId: string;
  activeCategoryId: string;
  searchQuery: string;
  cart: CartItem[];
  sortedProducts: Product[];
  deliveryAddress?: string;
  customerPhone?: string;
  customerName?: string;
  isWhatsappLoggedIn?: boolean;
  navTab?: string;
  filterOptions?: any;
  theme?: string;
  onSelectModule: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onSearchChange: (q: string) => void;
  onOpenSearchOverlay: () => void;
  onOpenFilterSheet?: () => void;
  onOpenDetail?: (product: Product) => void;
  onOpenDetailProduct?: (product: Product) => void;
  onOpenStoreDetail?: (store: VendorStore) => void;
  onSelectStore?: (store: VendorStore) => void;
  onSelectBanner?: (banner: any) => void;
  onViewAllStores?: () => void;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onNavigateTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onChangeTab?: (tab: string) => void;
  onOpenCartDrawer?: () => void;
  onToggleTheme?: () => void;
  onOpenLinkModal?: () => void;
}

export const HMQModernTemplate: React.FC<PlatformTemplateProps> = (props) => {
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="px-4 pt-3 pb-2 flex-1">
        {/* 2. Global Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenOverlay={onOpenSearchOverlay}
          onOpenFilter={onOpenFilterSheet}
        />

        {/* 3. Category Horizontal Scroll Bar (Pills) */}
        <CategoryBar
          categories={appData.categories || []}
          activeModuleId={activeModuleId}
          activeCategoryId={activeCategoryId}
          onSelectCategory={onSelectCategory}
        />

        {/* 4. Large Category Cards Grid (as seen in baseline reference UI) */}
        {activeModuleId === 'all' && activeCategoryId === 'all' && !searchQuery && (
          <div className="mt-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                Explore Categories
              </h2>
              <button
                onClick={() => handleNavigateTab('categories')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                See All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(appData.modules || [])
                .filter((m) => m.enabled !== false)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectModule(m.id)}
                  style={{ background: m.bgColor || '#f8fafc' }}
                  className="p-3.5 rounded-2xl shadow-xs border border-black/5 dark:border-white/10 flex flex-col justify-between h-36 cursor-pointer transform transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                >
                  <div className="z-10">
                    <h3 className="text-base font-black text-slate-900 leading-tight line-clamp-1">{m.name}</h3>
                    {m.description && (
                      <p className="text-[11px] font-medium text-slate-700 line-clamp-2 mt-0.5 leading-snug opacity-90">
                        {m.description}
                      </p>
                    )}
                  </div>

                  <div className="z-10 flex items-center justify-between mt-2">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                      ⏱ {m.time || '20-30 min'}
                    </span>
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-10 h-10 object-contain drop-shadow-sm transform hover:scale-110 transition-transform" />
                    ) : m.icon && (m.icon.startsWith('http') || m.icon.startsWith('data:') || m.icon.startsWith('/')) ? (
                      <img src={m.icon} alt={m.name} className="w-10 h-10 object-contain drop-shadow-sm transform hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-3xl filter drop-shadow-sm transform hover:scale-110 transition-transform">
                        {m.icon || '📦'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Promotional Banners */}
        {appData.banners && appData.banners.length > 0 && !searchQuery && (
          <div className="my-4">
            <PromoBanners
              banners={appData.banners}
              onSelectBannerModule={(modId) => onSelectModule(modId || 'all')}
            />
          </div>
        )}

        {/* 6. Product / Store Catalog Grid */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeModuleId !== 'all'
                  ? (appData.modules || []).find((m) => m.id === activeModuleId)?.name || 'Products'
                  : 'Popular Products Near You'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Fastest delivery from local verified merchants
              </p>
            </div>
            <button
              onClick={onOpenFilterSheet}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {(sortedProducts || []).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-500">No products found matching your search.</p>
              <button
                onClick={() => {
                  onSelectModule('all');
                  onSelectCategory('all');
                  onSearchChange('');
                }}
                className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(sortedProducts || []).map((product) => {
                const cartItem = (cart || []).find((i) => i.productId === product.id || (i as any).id === product.id);
                const categoryName = (appData.categories || []).find((c) => c.id === product.categoryId)?.name;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryName}
                    cartItem={cartItem}
                    onAddToCart={onAddToCart}
                    onUpdateQty={onUpdateCartQty}
                    onOpenDetail={onOpenDetailProduct}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Nearby Stores Section */}
        {appData.stores && appData.stores.length > 0 && activeModuleId === 'all' && !searchQuery && (
          <div className="my-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Featured Hyperlocal Stores</h2>
              <button
                onClick={() => handleNavigateTab('stores')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Stores ({(appData.stores || []).length})
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(appData.stores || []).slice(0, 3).map((store) => (
                <StoreCard key={store.id} store={store} onSelectStore={onOpenStoreDetail} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Bottom Navigation Bar */}
      <BottomNav
        activeTab={navTab}
        onChangeTab={handleNavigateTab}
        onSelectTab={handleNavigateTab}
        cartCount={totalCartCount}
        onOpenCartDrawer={onOpenCartDrawer}
      />
    </div>
  );
};
