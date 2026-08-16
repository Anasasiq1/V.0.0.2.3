import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Image as ImageIcon, 
  UploadCloud, 
  Grid, 
  Sparkles, 
  Percent, 
  Tag, 
  Check, 
  DollarSign, 
  SlidersHorizontal,
  Store,
  Layers,
  ShoppingBag as BagIcon,
  Package
} from 'lucide-react';
import { AppData, MarketCategory, MarketBanner, MarketSettings, Product } from '../types';

interface AdminMarketManagementProps {
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error') => void;
  handleImageFileRead: (file: File, onSuccess: (base64Url: string) => void) => void;
}

export const AdminMarketManagement: React.FC<AdminMarketManagementProps> = ({
  data,
  onUpdateData,
  showToast,
  handleImageFileRead,
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'categories' | 'products' | 'banners' | 'settings'>('dashboard');

  // Categories form state
  const [editingCategory, setEditingCategory] = useState<Partial<MarketCategory> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Products filter/form state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [filterMarketCat, setFilterMarketCat] = useState<string>('all');

  // Banners form state
  const [editingBanner, setEditingBanner] = useState<Partial<MarketBanner> | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);

  // Market settings state
  const [marketSettings, setMarketSettings] = useState<MarketSettings>(
    data.market_settings || {
      currency_symbol: '₹',
      show_deals_of_day: true,
      show_trending: true,
      show_your_vibe: true,
      show_brand_showcases: true,
      custom_hero_title: 'Market',
    }
  );

  const marketCategories = data.market_categories || [];
  const marketBanners = data.market_banners || [];
  const marketProducts = data.products.filter(
    (p) => p.is_market || p.market_category_id || p.is_deal_of_the_day || p.is_trending
  );

  // ---------------- CATEGORIES CRUD ----------------
  const handleSaveCategory = async () => {
    if (!editingCategory?.name?.trim()) return showToast('Category name is required', 'error');

    let updated = [...marketCategories];
    if (isNewCategory) {
      const newCat: MarketCategory = {
        id: 'mcat-' + Date.now(),
        name: editingCategory.name.trim(),
        image: editingCategory.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
        description: editingCategory.description || '',
        tag: editingCategory.tag || '',
        order: updated.length + 1,
        enabled: editingCategory.enabled !== false,
      };
      updated.push(newCat);
    } else {
      updated = updated.map((c) =>
        c.id === editingCategory.id ? ({ ...c, ...editingCategory } as MarketCategory) : c
      );
    }

    await onUpdateData({ ...data, market_categories: updated });
    setEditingCategory(null);
    showToast('Market category saved successfully!');
  };

  const handleToggleCategory = async (id: string) => {
    const updated = marketCategories.map((c) =>
      c.id === id ? { ...c, enabled: c.enabled === false } : c
    );
    await onUpdateData({ ...data, market_categories: updated });
    showToast('Market category status updated');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this Market category? Products will remain safely in their stores.')) {
      const updated = marketCategories.filter((c) => c.id !== id);
      await onUpdateData({ ...data, market_categories: updated });
      showToast('Market category deleted');
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= marketCategories.length) return;

    const list = [...marketCategories];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    await onUpdateData({ ...data, market_categories: reordered });
  };

  // ---------------- BANNERS CRUD ----------------
  const handleSaveBanner = async () => {
    if (!editingBanner?.title?.trim()) return showToast('Banner title is required', 'error');

    let updated = [...marketBanners];
    if (isNewBanner) {
      const newBan: MarketBanner = {
        id: 'mban-' + Date.now(),
        title: editingBanner.title.trim(),
        subtitle: editingBanner.subtitle || '',
        image: editingBanner.image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        btn_text: editingBanner.btn_text || 'Shop Now',
        badge: editingBanner.badge || '',
        order: updated.length + 1,
        enabled: editingBanner.enabled !== false,
      };
      updated.push(newBan);
    } else {
      updated = updated.map((b) =>
        b.id === editingBanner.id ? ({ ...b, ...editingBanner } as MarketBanner) : b
      );
    }

    await onUpdateData({ ...data, market_banners: updated });
    setEditingBanner(null);
    showToast('Market banner saved successfully!');
  };

  const handleToggleBanner = async (id: string) => {
    const updated = marketBanners.map((b) =>
      b.id === id ? { ...b, enabled: b.enabled === false } : b
    );
    await onUpdateData({ ...data, market_banners: updated });
    showToast('Banner status updated');
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Delete this banner from Market carousel?')) {
      const updated = marketBanners.filter((b) => b.id !== id);
      await onUpdateData({ ...data, market_banners: updated });
      showToast('Banner deleted');
    }
  };

  // ---------------- PRODUCTS CRUD IN MARKET ----------------
  const handleSaveMarketProduct = async () => {
    if (!editingProduct?.name?.trim()) return showToast('Product name is required', 'error');
    if (!editingProduct?.price || Number(editingProduct.price) <= 0) return showToast('Valid price is required', 'error');

    let updatedProducts = [...data.products];
    if (isNewProduct) {
      const newProd: Product = {
        id: 'prod-m-' + Date.now(),
        name: editingProduct.name.trim(),
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        discount_percent: editingProduct.discount_percent ? Number(editingProduct.discount_percent) : undefined,
        brand: editingProduct.brand || '',
        rating: editingProduct.rating ? Number(editingProduct.rating) : 4.8,
        rating_count: editingProduct.rating_count ? Number(editingProduct.rating_count) : 12,
        deliveryTime: editingProduct.deliveryTime || 'Same Day',
        free_delivery: editingProduct.free_delivery || false,
        badge: editingProduct.badge || '',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        description: editingProduct.description || '',
        available: editingProduct.available !== false,
        stock: editingProduct.stock ? Number(editingProduct.stock) : 20,
        stock_alert_threshold: 3,
        categoryId: editingProduct.categoryId || data.categories[0]?.id || 'cat-grocery',
        moduleId: editingProduct.moduleId || data.modules[0]?.id || 'mod-supermarket',
        store_id: editingProduct.store_id || data.stores?.[0]?.id,
        is_market: true,
        market_category_id: editingProduct.market_category_id,
        is_deal_of_the_day: editingProduct.is_deal_of_the_day || false,
        is_trending: editingProduct.is_trending || false,
      };
      updatedProducts.push(newProd);
    } else {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...editingProduct, is_market: true } as Product) : p
      );
    }

    await onUpdateData({ ...data, products: updatedProducts });
    setEditingProduct(null);
    showToast('Market product saved successfully!');
  };

  const handleToggleProductStatus = async (id: string) => {
    const updated = data.products.map((p) =>
      p.id === id ? { ...p, available: p.available === false } : p
    );
    await onUpdateData({ ...data, products: updated });
    showToast('Product availability toggled');
  };

  const handleToggleMarketDeal = async (id: string) => {
    const updated = data.products.map((p) =>
      p.id === id ? { ...p, is_deal_of_the_day: !p.is_deal_of_the_day } : p
    );
    await onUpdateData({ ...data, products: updated });
    showToast('Deal of the day status updated');
  };

  const handleSaveMarketSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateData({ ...data, market_settings: marketSettings });
    showToast('Market layout and settings saved!');
  };

  return (
    <div className="space-y-6">
      {/* Sub Header & Sub Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Market & E-Commerce Central Management
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-full">
                  Marketplace
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Market Categories, Hero Banners, Deals of the Day, Marketplace Products & Live Layout.
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Overview', icon: Grid },
              { id: 'categories', label: `Categories (${marketCategories.length})`, icon: Tag },
              { id: 'products', label: `Products (${marketProducts.length})`, icon: Package },
              { id: 'banners', label: `Banners (${marketBanners.length})`, icon: Sparkles },
              { id: 'settings', label: 'Display Settings', icon: SlidersHorizontal },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------- SUB-TAB 1: OVERVIEW DASHBOARD ---------------- */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Market Products</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>{marketProducts.length}</span>
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 block">
                {marketProducts.filter((p) => p.available !== false).length} Active in Marketplace
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Market Categories</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>{marketCategories.length}</span>
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-600 block">
                {marketCategories.filter((c) => c.enabled !== false).length} Active & Visible
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deals of the Day</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>{marketProducts.filter((p) => p.is_deal_of_the_day).length}</span>
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-600 block">Live on Market Top Carousel</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Promo Banners</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>{marketBanners.filter((b) => b.enabled !== false).length}</span>
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-600 block">Rotating on Market Header</span>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => {
                setSubTab('categories');
                setIsNewCategory(true);
                setEditingCategory({ enabled: true });
              }}
              className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-3xl shadow-lg shadow-rose-500/20 cursor-pointer hover:scale-[1.01] transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <Tag className="w-6 h-6" />
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black">Add Market Category</h3>
              <p className="text-xs text-rose-100 leading-relaxed">
                Create new shopping collections like Fashion, Gadgets, Korean Beauty, or Grocery.
              </p>
            </div>

            <div 
              onClick={() => {
                setSubTab('products');
                setIsNewProduct(true);
                setEditingProduct({ available: true, is_market: true });
              }}
              className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg shadow-orange-500/20 cursor-pointer hover:scale-[1.01] transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <Package className="w-6 h-6" />
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black">Add Marketplace Product</h3>
              <p className="text-xs text-orange-100 leading-relaxed">
                List new items with sale prices, discount badges, and associate with merchant stores.
              </p>
            </div>

            <div 
              onClick={() => {
                setSubTab('banners');
                setIsNewBanner(true);
                setEditingBanner({ enabled: true, btn_text: 'Shop Now' });
              }}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-3xl shadow-lg shadow-purple-600/20 cursor-pointer hover:scale-[1.01] transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <Sparkles className="w-6 h-6" />
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black">Add Promo Banner</h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                Upload eye-catching campaign banners for seasonal discounts and top brands.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: MARKET CATEGORIES ---------------- */}
      {subTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-600" /> Market Categories Management ({marketCategories.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure icons, images, tags and order for category discovery in Market.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCategory({ enabled: true });
                setIsNewCategory(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Market Category
            </button>
          </div>

          {/* Category Edit / Create Modal/Card */}
          {editingCategory && (
            <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {isNewCategory ? 'Create New Market Category' : 'Edit Market Category'}
                </h4>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:bg-slate-300"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="e.g. Korean Beauty or Fresh Meat"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Tag / Badge</label>
                  <input
                    type="text"
                    value={editingCategory.tag || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, tag: e.target.value })}
                    placeholder="e.g. Your Vibe, Popular, Hot"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="e.g. Glow serums, collagen masks & trending beauty essentials"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Category Image Upload */}
                <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-600" /> Category Circular Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {editingCategory.image ? (
                        <img src={editingCategory.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3.5 py-1.5 rounded-xl font-extrabold cursor-pointer inline-flex items-center gap-1.5 text-xs">
                        <UploadCloud className="w-4 h-4" /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFileRead(file, (b64) => setEditingCategory({ ...editingCategory, image: b64 }));
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingCategory.image || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-mono text-[11px] text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:col-span-2 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Visible in Market</span>
                    <span className="text-[11px] text-slate-400">Toggle to show or hide from customers in Market view</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingCategory.enabled !== false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                >
                  Save Category
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search market categories..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category List */}
          <div className="space-y-2.5">
            {marketCategories
              .filter((c) => !categorySearch.trim() || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
              .map((cat, index) => {
                const isEnabled = cat.enabled !== false;
                return (
                  <div
                    key={`admin-mcat-${cat.id}-${index}`}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                          <span className="truncate">{cat.name}</span>
                          {cat.tag && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              {cat.tag}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cat.description || 'Market category collection'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleMoveCategory(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(index, 'down')}
                        disabled={index === marketCategories.length - 1}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                        title={isEnabled ? 'Disable Category' : 'Enable Category'}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsNewCategory(false);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: MARKET PRODUCTS ---------------- */}
      {subTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" /> Marketplace Products Catalog ({marketProducts.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Products listed directly in the Market view, linked with stores, tags and discounts.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProduct({ available: true, is_market: true });
                setIsNewProduct(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Marketplace Product
            </button>
          </div>

          {/* Product Edit / Form Card */}
          {editingProduct && (
            <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {isNewProduct ? 'Add Marketplace Product' : 'Edit Product'}
                </h4>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:bg-slate-300"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Apple iPhone 17 Pro 256GB Cosmic Orange"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. Apple, Nike, Tefal"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Market Category</label>
                  <select
                    value={editingProduct.market_category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, market_category_id: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- None / General --</option>
                    {marketCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Merchant Store</label>
                  <select
                    value={editingProduct.store_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, store_id: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {data.stores?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹ / QAR) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    placeholder="4399"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original Price (Strikeout)</label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                    placeholder="4699"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Discount Badge Text</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="e.g. 10% OFF or S+ Free Delivery"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    placeholder="20"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Flags Checkboxes */}
                <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_deal_of_the_day || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_deal_of_the_day: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">🔥 Deal of the Day</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_trending || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">✨ Trending in Market</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.free_delivery || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, free_delivery: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">🚚 Free Delivery</span>
                  </label>
                </div>

                {/* Product Image */}
                <div className="sm:col-span-2 md:col-span-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-600" /> Product Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {editingProduct.image ? (
                        <img src={editingProduct.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3.5 py-1.5 rounded-xl font-extrabold cursor-pointer inline-flex items-center gap-1.5 text-xs">
                        <UploadCloud className="w-4 h-4" /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFileRead(file, (b64) => setEditingProduct({ ...editingProduct, image: b64 }));
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingProduct.image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-mono text-[11px] text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Product highlights, specifications, material and details..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMarketProduct}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                >
                  Save Product
                </button>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or brand..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <select
              value={filterMarketCat}
              onChange={(e) => setFilterMarketCat(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none shrink-0"
            >
              <option value="all">All Market Categories</option>
              {marketCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketProducts
              .filter((p) => {
                if (filterMarketCat !== 'all' && p.market_category_id !== filterMarketCat) return false;
                if (productSearch.trim()) {
                  const q = productSearch.toLowerCase();
                  if (!p.name.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q)) return false;
                }
                return true;
              })
              .map((prod) => {
                const store = data.stores?.find((s) => s.id === prod.store_id);
                const marketCat = marketCategories.find((c) => c.id === prod.market_category_id);
                const isAvailable = prod.available !== false;

                return (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-3xl border flex flex-col justify-between space-y-3 transition-all ${
                      isAvailable
                        ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 border-dashed border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        {prod.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-lg shadow-sm">
                            {prod.badge}
                          </span>
                        )}
                        {prod.is_deal_of_the_day && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-lg shadow-sm flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" /> Deal
                          </span>
                        )}
                      </div>

                      <div>
                        {prod.brand && (
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">
                            {prod.brand}
                          </span>
                        )}
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            ₹{prod.price}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-xs text-slate-400 line-through">₹{prod.oldPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{marketCat?.name || 'Market'}</span> • <span>{store?.name || 'Local Store'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleToggleMarketDeal(prod.id)}
                        className={`text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer ${
                          prod.is_deal_of_the_day ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {prod.is_deal_of_the_day ? '★ Deal Active' : '+ Make Deal'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleProductStatus(prod.id)}
                          className={`p-1.5 rounded-xl cursor-pointer ${
                            isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}
                          title={isAvailable ? 'Disable Product' : 'Enable Product'}
                        >
                          {isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsNewProduct(false);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 4: PROMO BANNERS ---------------- */}
      {subTab === 'banners' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" /> Market Hero Promo Banners ({marketBanners.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rotating top banners for high-impact brand promotions and discounts.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingBanner({ enabled: true, btn_text: 'Shop Now' });
                setIsNewBanner(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Promo Banner
            </button>
          </div>

          {/* Banner Edit Modal/Card */}
          {editingBanner && (
            <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {isNewBanner ? 'Create Promo Banner' : 'Edit Promo Banner'}
                </h4>
                <button
                  onClick={() => setEditingBanner(null)}
                  className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:bg-slate-300"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Banner Main Title *</label>
                  <input
                    type="text"
                    value={editingBanner.title || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. Top-Up Today or 50% OFF Beast Mode"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    placeholder="e.g. Gaming Special, 50% OFF"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subtitle / Deal Hook</label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    placeholder="e.g. Xbox, PlayStation & Digital Gift Cards instant code delivery"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Button Call to Action</label>
                  <input
                    type="text"
                    value={editingBanner.btn_text || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, btn_text: e.target.value })}
                    placeholder="e.g. Get Cards or Shop Now"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Banner Image */}
                <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-600" /> Banner Background Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {editingBanner.image ? (
                        <img src={editingBanner.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Sparkles className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3.5 py-1.5 rounded-xl font-extrabold cursor-pointer inline-flex items-center gap-1.5 text-xs">
                        <UploadCloud className="w-4 h-4" /> Upload Banner Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFileRead(file, (b64) => setEditingBanner({ ...editingBanner, image: b64 }));
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingBanner.image || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-mono text-[11px] text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                >
                  Save Banner
                </button>
              </div>
            </div>
          )}

          {/* Banner List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketBanners.map((banner) => {
              const isEnabled = banner.enabled !== false;
              return (
                <div
                  key={banner.id}
                  className={`rounded-3xl overflow-hidden border transition-all ${
                    isEnabled
                      ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-xs'
                      : 'bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="relative h-36 bg-slate-800">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                      {banner.badge && (
                        <span className="self-start px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md mb-1">
                          {banner.badge}
                        </span>
                      )}
                      <h4 className="font-black text-sm">{banner.title}</h4>
                      <p className="text-[11px] text-slate-200 line-clamp-1">{banner.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isEnabled ? 'Live on Market Carousel' : 'Hidden'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBanner(banner.id)}
                        className={`p-1.5 rounded-xl cursor-pointer ${
                          isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setIsNewBanner(false);
                        }}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 5: DISPLAY SETTINGS ---------------- */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveMarketSettings} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-rose-600" /> Market Marketplace Experience & Display Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control which sections appear on the customer-facing Market page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={marketSettings.currency_symbol || '₹'}
                onChange={(e) => setMarketSettings({ ...marketSettings, currency_symbol: e.target.value })}
                placeholder="₹ or QAR"
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Header Title</label>
              <input
                type="text"
                value={marketSettings.custom_hero_title || 'Market'}
                onChange={(e) => setMarketSettings({ ...marketSettings, custom_hero_title: e.target.value })}
                placeholder="Market"
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Show "Deals of the Day" Section</span>
                  <span className="text-[11px] text-slate-400">Displays hot discounted product carousel on top</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketSettings.show_deals_of_day !== false}
                  onChange={(e) => setMarketSettings({ ...marketSettings, show_deals_of_day: e.target.checked })}
                  className="w-5 h-5 rounded text-rose-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Show "Your Vibe / Top Brands" Section</span>
                  <span className="text-[11px] text-slate-400">Displays brand showcases like Tefal, Apple, Nike and curated collections</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketSettings.show_brand_showcases !== false}
                  onChange={(e) => setMarketSettings({ ...marketSettings, show_brand_showcases: e.target.checked })}
                  className="w-5 h-5 rounded text-rose-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Show "Trending in Market" Section</span>
                  <span className="text-[11px] text-slate-400">Displays popular items with high customer reviews and ratings</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketSettings.show_trending !== false}
                  onChange={(e) => setMarketSettings({ ...marketSettings, show_trending: e.target.checked })}
                  className="w-5 h-5 rounded text-rose-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Market Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
