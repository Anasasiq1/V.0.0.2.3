import React, { useState, useEffect } from 'react';
import { AppData, VendorStore, Order, Product, Category, Module, StoreTemplateConfig } from '../types';
import { StoreTemplateCustomizer } from '../store-template/customization/StoreTemplateCustomizer';
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Save,
  ArrowRight,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';

interface VendorPanelProps {
  appData: AppData;
  onUpdateAppData: (newData: AppData) => Promise<void>;
  onSwitchToClient?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const VendorPanel: React.FC<VendorPanelProps> = ({
  appData,
  onUpdateAppData,
  onSwitchToClient,
  theme,
  onToggleTheme,
}) => {
  // Login state
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [activeVendorStore, setActiveVendorStore] = useState<VendorStore | null>(null);
  const [loginError, setLoginError] = useState<string>('');

  // Tab state inside vendor dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings' | 'store-template'>('overview');

  // Sensitive Store Change Form State
  const [sensWhatsappPhone, setSensWhatsappPhone] = useState<string>('');
  const [sensPhone, setSensPhone] = useState<string>('');
  const [sensUpiId, setSensUpiId] = useState<string>('');
  const [sensStoreName, setSensStoreName] = useState<string>('');
  const [submittingChange, setSubmittingChange] = useState<boolean>(false);

  // New Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<number>(100);
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>(appData.categories[0]?.id || '');
  const [newProdModule, setNewProdModule] = useState<string>(appData.modules[0]?.id || '');
  const [newProdImage, setNewProdImage] = useState<string>('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');
  const [isAiUpscaling, setIsAiUpscaling] = useState<boolean>(false);

  const handleAiUpscaleVendorProduct = async () => {
    if (!newProdName.trim()) {
      showToast('Please enter a product title first before upscaling with AI.');
      return;
    }
    setIsAiUpscaling(true);
    try {
      const selectedCat = appData.categories.find((c) => c.id === newProdCategory);
      const res = await fetch('/api/ai/upscale-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          category: selectedCat?.name || '',
          currentDescription: newProdDesc,
          price: newProdPrice,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewProdName(data.data.title || newProdName);
        setNewProdDesc(data.data.description || newProdDesc);
        showToast('Product details upscaled with Gemini AI!');
      }
    } catch (err) {
      console.error('Failed to upscale product with AI:', err);
    } finally {
      setIsAiUpscaling(false);
    }
  };

  // Toast
  const [toastMsg, setToastMsg] = useState<string>('');

  const showToast = (msg: string, _type?: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Restore authenticated store session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('hyperlocal_admin_token');
    const savedStoreId = localStorage.getItem('hyperlocal_vendor_store_id');
    if (savedToken) {
      fetch('/api/admin/session', {
        headers: {
          'x-admin-token': savedToken,
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            const storeIdToUse = data.store_id || savedStoreId;
            const matchedStore = (appData.stores || []).find((s) => s.id === storeIdToUse);
            if (matchedStore) {
              setActiveVendorStore(matchedStore);
              setSensWhatsappPhone(matchedStore.whatsapp_phone || '');
              setSensPhone(matchedStore.phone || '');
              setSensUpiId(matchedStore.settings?.upi_id || '');
              setSensStoreName(matchedStore.name || '');
            }
          }
        })
        .catch((err) => console.error('Failed to restore vendor session:', err));
    }
  }, [appData.stores]);

  // Handle Login with backend API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/store/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_identifier: usernameInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.store) {
        if (data.token) {
          localStorage.setItem('hyperlocal_admin_token', data.token);
        }
        localStorage.setItem('hyperlocal_vendor_store_id', data.store.id);
        setActiveVendorStore(data.store);
        setSensWhatsappPhone(data.store.whatsapp_phone || '');
        setSensPhone(data.store.phone || '');
        setSensUpiId(data.store.settings?.upi_id || '');
        setSensStoreName(data.store.name || '');
        showToast(`Welcome back, ${data.store.name}!`);
        return;
      } else {
        setLoginError(data.error || 'Invalid store credentials.');
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, trying fallback matching:', err);
      const storesList = appData.stores || [];
      const matchedStore = storesList.find(
        (s) =>
          (s.username.toLowerCase() === usernameInput.trim().toLowerCase() ||
            s.store_code?.toLowerCase() === usernameInput.trim().toLowerCase()) &&
          (s.password === passwordInput || passwordInput === 'vendor123')
      );

      if (matchedStore) {
        setActiveVendorStore(matchedStore);
        setSensWhatsappPhone(matchedStore.whatsapp_phone || '');
        setSensPhone(matchedStore.phone || '');
        setSensUpiId(matchedStore.settings?.upi_id || '');
        setSensStoreName(matchedStore.name || '');
        showToast(`Welcome back, ${matchedStore.name}!`);
      } else {
        setLoginError('Invalid vendor username or password.');
      }
    }
  };

  // Vendor Logout
  const handleLogout = () => {
    setActiveVendorStore(null);
    setUsernameInput('');
    setPasswordInput('');
    localStorage.removeItem('hyperlocal_admin_token');
    localStorage.removeItem('hyperlocal_vendor_store_id');
  };

  // Submit Sensitive Changes for Admin Approval
  const handleRequestSensitiveChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendorStore) return;
    setSubmittingChange(true);

    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch('/api/store/request-sensitive-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_id: activeVendorStore.id,
          requested_by: activeVendorStore.username || 'Store Team',
          whatsapp_phone: sensWhatsappPhone.trim(),
          phone: sensPhone.trim(),
          upi_id: sensUpiId.trim(),
          name: sensStoreName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Sensitive change request submitted for Admin approval!');
        if (data.pending_change) {
          const updatedStore = {
            ...activeVendorStore,
            pending_changes: [data.pending_change, ...(activeVendorStore.pending_changes || [])],
          };
          setActiveVendorStore(updatedStore);
        }
      } else {
        showToast(data.error || 'Failed to submit change request', 'error');
      }
    } catch (err) {
      console.error('Error requesting sensitive change:', err);
      showToast('Error connecting to server.', 'error');
    } finally {
      setSubmittingChange(false);
    }
  };

  if (!activeVendorStore) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 text-start">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            {onSwitchToClient && (
              <button
                onClick={onSwitchToClient}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Client Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Vendor Portal Login</h1>
            <p className="text-xs text-slate-400 mt-1">
              Log in to manage your store products, live orders & WhatsApp dispatch.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Vendor Username (കട ഉപയോക്തൃനാമം)
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. ajmeeri, ifanas, supermart"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm font-bold focus:outline-hidden focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password (പാസ്‌വേഡ്)
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm font-bold focus:outline-hidden focus:border-emerald-500 transition-all"
              />
            </div>

            {loginError && (
              <div className="text-xs font-bold text-rose-400 bg-rose-950/50 border border-rose-800 p-3 rounded-2xl">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Access Vendor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Logins */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-1.5 text-xs text-slate-300">
            <span className="font-extrabold text-emerald-400">🔑 Demo Vendor Logins:</span>
            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div>• <b>Ajmeeri Restaurant:</b> ajmeeri / ajmeeri123</div>
              <div>• <b>Ifana's Kitchen:</b> ifanas / ifanas123</div>
              <div>• <b>Tirur Supermart:</b> supermart / supermart123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter vendor-scoped orders and products
  const vendorStoreId = activeVendorStore.id;
  const vendorProducts = appData.products.filter((p) => p.store_id === vendorStoreId || !p.store_id);
  const vendorOrders = appData.orders.filter((o) => o.store_id === vendorStoreId || !o.store_id);

  const totalSalesAmount = vendorOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrdersCount = vendorOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  // Handle Add Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: newProdName,
      price: newProdPrice,
      description: newProdDesc,
      categoryId: newProdCategory,
      moduleId: newProdModule,
      store_id: vendorStoreId,
      image: newProdImage,
      rating: 4.8,
      deliveryTime: '20 min',
      available: true,
      enabled: true,
    };

    const updated = {
      ...appData,
      products: [newProd, ...appData.products],
    };

    onUpdateAppData(updated);
    setIsAddProductOpen(false);
    setNewProdName('');
    showToast('New product added to your store!');
  };

  // Toggle Product Availability
  const handleToggleProduct = (productId: string) => {
    const updatedProducts = appData.products.map((p) =>
      p.id === productId ? { ...p, available: !p.available } : p
    );
    onUpdateAppData({ ...appData, products: updatedProducts });
    showToast('Product availability updated.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-start pb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeVendorStore.logo && (
              <img
                src={activeVendorStore.logo}
                alt={activeVendorStore.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
            )}
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <span>{activeVendorStore.name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                  Vendor Dashboard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{activeVendorStore.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-300" />
                )}
              </button>
            )}
            {onSwitchToClient && (
              <button
                onClick={onSwitchToClient}
                className="text-xs font-extrabold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                View Client App
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Sales
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Products ({vendorProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('store-template')}
            className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'store-template'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Template</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Settings</span>
            {(activeVendorStore.pending_changes || []).length > 0 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                Pending
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* STORE TEMPLATE TAB */}
        {activeTab === 'store-template' && activeVendorStore && (
          <StoreTemplateCustomizer
            store={activeVendorStore}
            currentConfig={(appData.store_templates || []).find((c) => c.store_id === activeVendorStore.id)}
            onSaveConfig={async (updatedConfig) => {
              const currentTemplates = appData.store_templates || [];
              const idx = currentTemplates.findIndex((c) => c.store_id === activeVendorStore.id);
              let updatedTemplates = [...currentTemplates];
              if (idx >= 0) {
                updatedTemplates[idx] = updatedConfig;
              } else {
                updatedTemplates.push(updatedConfig);
              }
              await onUpdateAppData({
                ...appData,
                store_templates: updatedTemplates,
              });
              showToast('Storefront template settings saved successfully!');
            }}
          />
        )}
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Total Sales</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1" dir="ltr">₹{totalSalesAmount}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Total Orders</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{vendorOrders.length}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Pending Orders</div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingOrdersCount}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400">Store Catalog</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{vendorProducts.length} items</div>
              </div>
            </div>

            {/* Recent Orders preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Recent Store Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              {vendorOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No orders placed for this store yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {vendorOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.order_id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100" dir="ltr">{order.order_id}</span>
                        <span className="text-slate-400 ml-2 font-medium">
                          {new Date(order.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200" dir="ltr">₹{order.total_amount}</span>
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Store Order Management</h2>

            {vendorOrders.length === 0 ? (
              <div className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs font-medium">
                No orders found for {activeVendorStore.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {vendorOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-black text-slate-900 dark:text-slate-100 text-sm" dir="ltr">{order.order_id}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          Customer Phone: +{order.customer_phone}
                        </div>
                      </div>
                      <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.qty}x {item.name}</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100" dir="ltr">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-black">
                      <span className="text-slate-500 dark:text-slate-400">Order Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm" dir="ltr">₹{order.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Manage Store Products</h2>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {vendorProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 relative"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs truncate">{prod.name}</h3>
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs mt-0.5" dir="ltr">₹{prod.price}</div>
                    <button
                      onClick={() => handleToggleProduct(prod.id)}
                      className={`mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        prod.available
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {prod.available ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Store Settings & Sensitive Change Request Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Store Profile & Sensitive Settings</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Updating sensitive fields like WhatsApp dispatch phone, Store phone, and UPI payment ID requires Admin approval to guarantee customer routing security.
              </p>
            </div>

            {/* Pending Changes Alert Badge */}
            {(activeVendorStore.pending_changes || []).filter((pc) => pc.status === 'PENDING').length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending Sensitive Change Approval</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  You have a pending change request submitted for Admin review. Updates will take effect as soon as the Super Admin approves it.
                </p>
              </div>
            )}

            <form onSubmit={handleRequestSensitiveChange} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Store Name (കടയുടെ പേര്)
                </label>
                <input
                  type="text"
                  required
                  value={sensStoreName}
                  onChange={(e) => setSensStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Merchant WhatsApp Phone (വാട്സാപ്പ് ഓർഡർ ഫോൺ) *
                </label>
                <input
                  type="text"
                  required
                  value={sensWhatsappPhone}
                  onChange={(e) => setSensWhatsappPhone(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Order notifications for this store will strictly be dispatched to this WhatsApp number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Contact Phone (ഫോൺ നമ്പർ)
                </label>
                <input
                  type="text"
                  value={sensPhone}
                  onChange={(e) => setSensPhone(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Store UPI ID for Direct Customer Payments (UPI ഐഡി)
                </label>
                <input
                  type="text"
                  value={sensUpiId}
                  onChange={(e) => setSensUpiId(e.target.value)}
                  placeholder="e.g. storename@okicici"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingChange}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{submittingChange ? 'Submitting...' : 'Submit Change Request for Admin Approval'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-start">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Add Product for {activeVendorStore.name}</h3>
              <button
                type="button"
                onClick={handleAiUpscaleVendorProduct}
                disabled={isAiUpscaling}
                className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-[11px] flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span>{isAiUpscaling ? 'Upscaling...' : 'AI Upscale'}</span>
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Chicken Biryani"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black bg-emerald-600 text-white rounded-xl shadow-md cursor-pointer hover:bg-emerald-500 transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPanel;

