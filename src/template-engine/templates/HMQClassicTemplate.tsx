import React from 'react';
import { PlatformTemplateProps } from './HMQModernTemplate';
import { ProductCard } from '../../components/ProductCard';
import { BottomNav } from '../../components/BottomNav';
import { Search, ShoppingBag, Sun, Moon, MapPin, Zap } from 'lucide-react';

export const HMQClassicTemplate: React.FC<PlatformTemplateProps> = (props) => {
  const {
    appData,
    activeModuleId,
    searchQuery,
    cart = [],
    sortedProducts = [],
    deliveryAddress = 'Tirur, Kerala',
    navTab = 'home',
    onSelectModule,
    onSearchChange,
    onOpenFilterSheet,
    onAddToCart,
    onUpdateCartQty,
    onOpenCartDrawer,
    onToggleTheme,
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
  const onOpenStoreDetail = props.onOpenStoreDetail || props.onSelectStore || (() => {});

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.qty || (item as any).quantity || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 pb-20 font-sans text-slate-800 dark:text-slate-100">
      {/* Ultra Simple Classic Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">HM-Q Classic</h1>
              <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                {deliveryAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>
            <button
              onClick={onOpenCartDrawer}
              className="relative p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({totalCartCount})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-slate-100 dark:bg-slate-900 pl-9 pr-4 py-1.5 rounded-lg text-xs font-medium border border-transparent focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </header>

      {/* Simple Module Pills */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <button
          onClick={() => onSelectModule('all')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
            activeModuleId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All Items
        </button>
        {(appData.modules || [])
          .filter((m) => m.enabled !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeModuleId === m.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {m.image ? (
              <img src={m.image} alt="" className="w-3.5 h-3.5 object-contain" />
            ) : m.icon && (m.icon.startsWith('http') || m.icon.startsWith('data:') || m.icon.startsWith('/')) ? (
              <img src={m.icon} alt="" className="w-3.5 h-3.5 object-contain" />
            ) : (
              <span>{m.icon || '📦'}</span>
            )}
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      {/* High-speed Compact Product Grid */}
      <main className="px-3 py-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Showing {(sortedProducts || []).length} items
          </span>
          <button
            onClick={onOpenFilterSheet}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
          >
            Sort & Filter
          </button>
        </div>

        {(sortedProducts || []).length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
            <p className="text-xs font-bold text-slate-500">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
      </main>

      {/* Bottom Nav */}
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
