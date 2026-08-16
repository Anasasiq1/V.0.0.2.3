import React from 'react';
import { PlatformTemplateProps } from './HMQModernTemplate';
import { ProductCard } from '../../components/ProductCard';
import { BottomNav } from '../../components/BottomNav';
import { Zap, Clock, Search, ShoppingCart, ChevronRight, MapPin } from 'lucide-react';

export const BlinkitStyleTemplate: React.FC<PlatformTemplateProps> = (props) => {
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
    <div className="flex flex-col min-h-screen bg-amber-50/30 dark:bg-slate-950 pb-20 font-sans">
      {/* Blinkit Style Yellow Header */}
      <header className="bg-yellow-400 text-slate-900 sticky top-0 z-30 p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-yellow-400 font-black px-2 py-0.5 rounded-md text-xs uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              10 MINS
            </div>
            <div className="text-xs font-bold truncate max-w-[200px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{deliveryAddress}</span>
            </div>
          </div>

          <button
            onClick={onOpenCartDrawer}
            className="bg-slate-900 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-yellow-400" />
            <span>{totalCartCount} Items</span>
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "milk", "bread", "biryani"...'
            className="w-full bg-white text-slate-900 pl-9 pr-4 py-2 rounded-xl text-xs font-bold border-2 border-slate-900/10 focus:border-slate-900 focus:outline-none shadow-inner"
          />
        </div>
      </header>

      {/* Module Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-amber-200 dark:border-slate-800 p-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => onSelectModule('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeModuleId === 'all'
              ? 'bg-yellow-400 text-slate-900 shadow-xs scale-105'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          ⚡ All Stores
        </button>
        {(appData.modules || [])
          .filter((m) => m.enabled !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeModuleId === m.id
                ? 'bg-yellow-400 text-slate-900 shadow-xs scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

      {/* Quick-Commerce Product Feed */}
      <main className="p-3 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Instant Delivery Items
            </h2>
          </div>
          <button onClick={onOpenFilterSheet} className="text-xs font-bold text-amber-600 dark:text-amber-400 underline">
            Filter
          </button>
        </div>

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
      </main>

      {/* Sticky Bottom Cart Bar for Quick Commerce */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40">
          <div
            onClick={onOpenCartDrawer}
            className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white text-emerald-700 font-extrabold w-8 h-8 rounded-xl flex items-center justify-center text-xs">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide">View Instant Cart</p>
                <p className="text-[10px] text-emerald-100 font-medium">Delivering in 10-15 mins</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-sm">
              <span>Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

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
