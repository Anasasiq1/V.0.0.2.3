import React, { useState, useEffect } from 'react';
import {
  AppData,
  Module,
  Product,
  CartItem,
  Order,
  VendorStore,
  ItemPrescription,
} from './types';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { ModuleGrid } from './components/ModuleGrid';
import { CategoryBar } from './components/CategoryBar';
import { PromoBanners } from './components/PromoBanners';
import { ProductCard } from './components/ProductCard';
import { StoreCard } from './components/StoreCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCart } from './components/FloatingCart';
import { OrdersView } from './components/OrdersView';
import { BottomNav } from './components/BottomNav';

const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const VendorPanel = React.lazy(() => import('./components/VendorPanel'));
import { PWAInstallModal } from './components/PWAInstallModal';
import { WhatsAppSupportButton } from './components/WhatsAppSupportButton';
import { WhatsAppLinkModal } from './components/WhatsAppLinkModal';
import { AccountView } from './components/AccountView';
import { StoresView } from './components/StoresView';
import { StoreDetailView } from './components/StoreDetailView';
import { CategoriesView } from './components/CategoriesView';
import { ModulesView } from './components/ModulesView';
import { ModuleDetailView } from './components/ModuleDetailView';
import { CategoryDetailView } from './components/CategoryDetailView';
import { WishlistView } from './components/WishlistView';
import { WalletView } from './components/WalletView';
import { ReferralView } from './components/ReferralView';
import { NotificationCenter } from './components/NotificationCenter';
import { CheckoutView } from './components/CheckoutView';
import { CartView } from './components/CartView';
import { MarketView } from './components/MarketView';
import { RoyalClubView } from './components/RoyalClubView';
import { GlobalSearch } from './components/GlobalSearch';
import { FilterSheet, FilterOptions } from './components/FilterSheet';
import { TemplateRegistry } from './template-engine';
import { initialData } from './data/initialData';
import { getCategoryTheme } from './lib/categoryTheme';
import { useTheme } from './lib/theme';
import { validateDeliverySlot } from './utils/deliverySlots';
import { getPendingUpiCheckout, clearPendingUpiCheckout } from './utils/upiCheckoutHandler';
import { SlidersHorizontal, ArrowRight, Store, Sparkles, ShieldCheck, X } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [appData, setAppData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState<boolean>(true);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

  // WhatsApp Customer Linking Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);

  // URL & User state
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isWhatsappLoggedIn, setIsWhatsappLoggedIn] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('WVRW+J7M, Tirur, Kerala');
  const [recognitionNotice, setRecognitionNotice] = useState<string | null>(null);

  // Active filters
  const [activeModuleId, setActiveModuleId] = useState<string>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Selected product for detail popup
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Selected store for store detail page
  const [selectedStore, setSelectedStore] = useState<VendorStore | null>(null);

  // Search & Filter overlays
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState<boolean>(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hyperlocal_wishlist');
      return stored ? JSON.parse(stored) : ['prod-iphone17-orange', 'prod-nike-airforce'];
    } catch {
      return ['prod-iphone17-orange', 'prod-nike-airforce'];
    }
  });

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('hyperlocal_wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: 'relevance',
    inStockOnly: false,
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
  });

  // App Navigation View
  const [navTab, setNavTab] = useState<string>('home');
  const [moduleReturnTab, setModuleReturnTab] = useState<string>('market');

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    if (appData.settings?.pwa_enabled === false) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (appData.settings?.pwa_enabled !== false) {
        setIsPwaModalOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone && appData.settings?.pwa_enabled !== false) {
      const timer = setTimeout(() => {
        setIsPwaModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [appData.settings?.pwa_enabled]);

  // Load customer phone, check portals & WhatsApp identity
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get('phone');

    const pathname = window.location.pathname.toLowerCase();
    const isSuperAdminPath = pathname === '/superadmin.php' || pathname.startsWith('/superadmin.php/');
    const isAnsasiqPath = pathname === '/ansasiq' || pathname.startsWith('/ansasiq/');
    const isAdminSubdomain = window.location.hostname.startsWith('admin.');
    const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');

    const isVendorSubdomain = window.location.hostname.startsWith('vendor.');
    const isVendorPath =
      pathname === '/vendor' ||
      pathname.startsWith('/vendor/') ||
      pathname === '/storepanel' ||
      pathname.startsWith('/storepanel/') ||
      pathname === '/storepanel.php' ||
      pathname.startsWith('/storepanel.php/');

    if (isSuperAdminPath || isAnsasiqPath || isAdminSubdomain || isAdminPath) {
      setNavTab('admin');
      if (window.location.pathname !== '/superadmin.php') {
        window.history.replaceState({}, '', '/superadmin.php');
      }
    } else if (isVendorSubdomain || isVendorPath) {
      setNavTab('vendor');
    } else if (pathname === '/market' || pathname.startsWith('/market/')) {
      setNavTab('market');
    } else if (pathname.startsWith('/store/')) {
      const storeSlug = pathname.split('/store/')[1]?.split('/')[0];
      if (storeSlug) {
        const storeMatch = (appData.stores || []).find(
          (s) =>
            s.slug === storeSlug ||
            s.id === storeSlug ||
            s.store_code?.toLowerCase() === storeSlug.toLowerCase()
        );
        if (storeMatch) {
          setSelectedStore(storeMatch);
        }
      }
    }

    if (urlPhone) {
      const cleanPhone = urlPhone.replace(/[^0-9]/g, '');
      fetch('/api/customer/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.recognized && data.customer) {
            setCustomerPhone(data.customer.whatsapp_number);
            setCustomerName(data.customer.name || '');
            setIsWhatsappLoggedIn(true);
            if (data.token) {
              localStorage.setItem('hyperlocal_customer_token', data.token);
            }
            localStorage.setItem('hyperlocal_customer_phone', data.customer.whatsapp_number);
            localStorage.setItem('hyperlocal_customer_name', data.customer.name || '');
            localStorage.setItem('hyperlocal_is_wa_login', 'true');
            setRecognitionNotice(data.message || 'നിങ്ങളുടെ WhatsApp നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.');
          } else {
            // Unregistered customer: phone field enabled for registration
            setCustomerPhone(cleanPhone);
            setIsWhatsappLoggedIn(false);
            localStorage.setItem('hyperlocal_customer_phone', cleanPhone);
            localStorage.removeItem('hyperlocal_is_wa_login');
          }
        })
        .catch((err) => {
          console.error('Error recognizing customer phone:', err);
          setCustomerPhone(cleanPhone);
        })
        .finally(() => {
          // Clean URL parameter without reloading page
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('phone');
          window.history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search);
        });
    } else {
      const custToken = localStorage.getItem('hyperlocal_customer_token');
      if (custToken) {
        fetch('/api/customer/session', {
          headers: {
            'x-customer-token': custToken,
            Authorization: `Bearer ${custToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.authenticated && data.customer) {
              setCustomerPhone(data.customer.whatsapp_number);
              setCustomerName(data.customer.name || '');
              setIsWhatsappLoggedIn(true);
            } else {
              const savedPhone = localStorage.getItem('hyperlocal_customer_phone');
              const savedName = localStorage.getItem('hyperlocal_customer_name') || '';
              const isWaLogin = localStorage.getItem('hyperlocal_is_wa_login') === 'true';
              if (savedPhone) {
                setCustomerPhone(savedPhone);
                setCustomerName(savedName);
                if (isWaLogin) {
                  setIsWhatsappLoggedIn(true);
                }
              } else {
                setCustomerPhone('');
                setIsWhatsappLoggedIn(false);
              }
            }
          })
          .catch(() => {
            const savedPhone = localStorage.getItem('hyperlocal_customer_phone');
            const savedName = localStorage.getItem('hyperlocal_customer_name') || '';
            const isWaLogin = localStorage.getItem('hyperlocal_is_wa_login') === 'true';
            if (savedPhone) {
              setCustomerPhone(savedPhone);
              setCustomerName(savedName);
              if (isWaLogin) setIsWhatsappLoggedIn(true);
            }
          });
      } else {
        const savedPhone = localStorage.getItem('hyperlocal_customer_phone');
        const savedName = localStorage.getItem('hyperlocal_customer_name') || '';
        const isWaLogin = localStorage.getItem('hyperlocal_is_wa_login') === 'true';
        if (savedPhone) {
          setCustomerPhone(savedPhone);
          setCustomerName(savedName);
          if (isWaLogin) {
            setIsWhatsappLoggedIn(true);
          }
        } else {
          setCustomerPhone('');
          setIsWhatsappLoggedIn(false);
        }
      }
    }
  }, []);

  // Navigation helper with History API pushState
  const navigateToTab = (tab: string) => {
    if (tab === 'home') {
      setActiveModuleId('all');
      setActiveCategoryId('all');
      setNavTab('home');
    } else if (tab === 'modules') {
      setNavTab('modules');
    } else if (tab === 'categories') {
      setActiveCategoryId('all');
      setNavTab('categories');
    } else {
      setNavTab(tab);
    }

    if (tab === 'admin') {
      if (window.location.pathname !== '/superadmin.php') {
        window.history.pushState({}, '', '/superadmin.php');
      }
    } else if (tab === 'vendor') {
      if (window.location.pathname !== '/vendor') {
        window.history.pushState({}, '', '/vendor');
      }
    } else {
      const p = window.location.pathname.toLowerCase();
      if (p.startsWith('/superadmin.php') || p.startsWith('/ansasiq') || p.startsWith('/admin') || p.startsWith('/vendor')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  // Popstate listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname === '/superadmin.php' ||
        pathname.startsWith('/superadmin.php/') ||
        pathname === '/ansasiq' ||
        pathname.startsWith('/ansasiq/') ||
        pathname === '/admin'
      ) {
        setNavTab('admin');
      } else if (pathname === '/vendor' || pathname.startsWith('/vendor/')) {
        setNavTab('vendor');
      } else {
        setNavTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Store Data from Server API
  const fetchAppData = async () => {
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['x-admin-token'] = token;
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/data', { headers, cache: 'no-cache' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json && typeof json === 'object') {
          setAppData(json);
          try {
            localStorage.setItem('hyperlocal_app_data_cache', JSON.stringify(json));
          } catch {}
          if (json.settings?.delivery_address) {
            setDeliveryAddress(json.settings.delivery_address);
          }
        }
      }
    } catch {
      // Gracefully maintain state or load cached data without breaking UI
      try {
        const cached = localStorage.getItem('hyperlocal_app_data_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setAppData((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
    // Live End-to-End Data Synchronization across Admin & Customer UI (skips when editing in admin/vendor)
    const syncInterval = setInterval(() => {
      if (navTab !== 'admin' && navTab !== 'vendor') {
        fetchAppData();
      }
    }, 6000);
    return () => clearInterval(syncInterval);
  }, [navTab]);

  // Identity Handlers
  const handleLinkSuccess = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    setCustomerPhone(cleanPhone);
    setCustomerName(name);
    setIsWhatsappLoggedIn(true);
    localStorage.setItem('hyperlocal_customer_phone', cleanPhone);
    localStorage.setItem('hyperlocal_customer_name', name);
    localStorage.setItem('hyperlocal_is_wa_login', 'true');
    setIsLinkModalOpen(false);
  };

  const handleUnlinkAccount = async () => {
    try {
      const custToken = localStorage.getItem('hyperlocal_customer_token') || '';
      if (custToken) {
        await fetch('/api/customer/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-customer-token': custToken,
            'Authorization': `Bearer ${custToken}`,
          },
        }).catch(() => {});
      }
    } catch {}

    setCustomerPhone('');
    setCustomerName('');
    setIsWhatsappLoggedIn(false);
    localStorage.removeItem('hyperlocal_customer_phone');
    localStorage.removeItem('hyperlocal_customer_name');
    localStorage.removeItem('hyperlocal_customer_token');
    localStorage.removeItem('hyperlocal_is_wa_login');
    setIsLinkModalOpen(false);
  };

  // Helper to attach admin token
  const getAdminHeaders = () => {
    const token = localStorage.getItem('hyperlocal_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Update App Data API
  const handleUpdateAppData = async (newData: AppData) => {
    if (loading) {
      console.warn('App data is still loading from server, skipping update');
      return;
    }
    setAppData(newData);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setAppData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to update app data:', err);
    }
  };

  const handleTriggerTestWebhook = async () => {
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleRestoreBackup = async (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setAppData(json.data);
        return true;
      }
    } catch (err) {
      console.error('Restore error:', err);
    }
    return false;
  };

  const handleUpdateAddress = (newAddr: string) => {
    setDeliveryAddress(newAddr);
    handleUpdateAppData({
      ...appData,
      settings: { ...appData.settings, delivery_address: newAddr },
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product, variantName?: string, qty: number = 1) => {
    const productStoreId = product.store_id || 'store-ajmeeri';

    // Multi-merchant Cart Guard (Enforce single store cart)
    if (cart.length > 0) {
      const firstCartItemProduct = appData.products.find((p) => p.id === cart[0].productId);
      const currentCartStoreId = firstCartItemProduct?.store_id || 'store-ajmeeri';

      if (currentCartStoreId !== productStoreId) {
        const currentStoreObj = (appData.stores || []).find((s) => s.id === currentCartStoreId);
        const newStoreObj = (appData.stores || []).find((s) => s.id === productStoreId);
        const currentStoreName = currentStoreObj?.name || 'മറ്റൊരു കട (another store)';
        const newStoreName = newStoreObj?.name || 'ഈ കട (this store)';

        const confirmClear = window.confirm(
          `നിങ്ങളുടെ കാർട്ടിൽ "${currentStoreName}" എന്ന കടയിലെ സാധനങ്ങൾ നിലവിലുണ്ട്.\n\n"${newStoreName}" എന്ന കടയിൽ നിന്ന് പുതിയ ഓർഡർ ആരംഭിക്കാൻ കാർട്ട് ക്ലിയർ ചെയ്യണോ?\n\n(Your cart already contains items from "${currentStoreName}". Clear cart to add items from "${newStoreName}"?)`
        );

        if (!confirmClear) return;

        // Clear previous store items and start fresh cart with new store product
        const price = variantName
          ? product.variants?.find((v) => v.name === variantName)?.price || product.price
          : product.price;
        const cartId = product.id + (variantName ? `-${variantName}` : '');

        setCart([
          {
            cartId,
            productId: product.id,
            name: product.name,
            variantName,
            price,
            image: product.image,
            qty,
            categoryId: product.categoryId,
          },
        ]);
        return;
      }
    }

    const price = variantName
      ? product.variants?.find((v) => v.name === variantName)?.price || product.price
      : product.price;

    const cartId = product.id + (variantName ? `-${variantName}` : '');

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.cartId === cartId);
      if (existing) {
        return prevCart.map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prevCart,
        {
          cartId,
          productId: product.id,
          name: product.name,
          variantName,
          price,
          image: product.image,
          qty,
          categoryId: product.categoryId,
        },
      ];
    });
  };

  const handleUpdateCartQty = (cartId: string, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartId === cartId || item.productId === cartId) {
            const newQty = item.qty + change;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleAttachItemPrescription = (cartId: string, p: ItemPrescription) => {
    setCart((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, prescription: p } : i))
    );
  };

  const handleClearCache = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setCart([]);
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
    } catch (err) {
      console.error('Clear cache error:', err);
    } finally {
      window.location.reload();
    }
  };

  // Place Order API
  const handlePlaceOrder = async (
    notes: string,
    deliveryType: 'scheduled' | 'urgent' = 'scheduled',
    deliverySlotTime?: string,
    deliveryFee: number = 0,
    paymentMethod: 'cod' | 'upi_online' | 'wallet' = 'cod',
    paymentTransactionId: string = ''
  ): Promise<boolean> => {
    if (cart.length === 0) return false;

    const activeCustPhone = customerPhone || localStorage.getItem('hyperlocal_customer_phone') || '';
    const activeCustName = customerName || localStorage.getItem('hyperlocal_customer_name') || 'Customer';

    if (!activeCustPhone) {
      setIsLinkModalOpen(true);
      return false;
    }

    if (!customerPhone && activeCustPhone) {
      setCustomerPhone(activeCustPhone);
      setCustomerName(activeCustName);
    }

    // MANDATORY BATCH DELIVERY EXPIRY PRE-VALIDATION
    if (deliveryType === 'scheduled' || deliverySlotTime) {
      const slotValidation = validateDeliverySlot(deliveryType, deliverySlotTime);
      if (!slotValidation.isValid) {
        alert(slotValidation.error || 'This delivery batch has expired. Please select another available batch.');
        return false;
      }
    }

    const items = cart.map((i) => ({
      name: i.name + (i.variantName ? ` (${i.variantName})` : ''),
      qty: i.qty,
      price: i.price,
      category:
        appData.categories.find((c) => c.id === i.categoryId)?.name || 'General',
      prescription: i.prescription,
    }));

    const itemsSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalAmount = itemsSubtotal + deliveryFee;

    const firstCartProduct = appData.products.find((p) => p.id === cart[0]?.productId);
    const storeId = firstCartProduct?.store_id || 'store-ajmeeri';
    const storeObj = (appData.stores || []).find((s) => s.id === storeId);

    const newOrder: Order = {
      order_id: 'ORD-' + Date.now().toString().slice(-6),
      customer_phone: activeCustPhone,
      customer_name: activeCustName,
      store_id: storeId,
      store_name: storeObj?.name || appData.settings.store_name,
      items,
      total_amount: totalAmount,
      delivery_type: deliveryType,
      delivery_slot_time: deliverySlotTime,
      delivery_fee: deliveryFee,
      notes,
      order_time: new Date().toISOString(),
      status: 'Order Placed' as const,
      is_food_order: items.some((i) => i.category.toLowerCase().includes('food')),
      payment_method: paymentMethod,
      payment_status: (paymentMethod === 'cod'
        ? 'Paid (COD)'
        : paymentMethod === 'wallet'
        ? 'Paid (Wallet)'
        : paymentTransactionId
        ? 'Paid (UPI Verified)'
        : 'Paid (UPI Direct)') as any,
      payment_transaction_id: paymentTransactionId,
    };

    const custToken = localStorage.getItem('hyperlocal_customer_token') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (custToken) {
      headers['x-customer-token'] = custToken;
      headers['Authorization'] = `Bearer ${custToken}`;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        const json = await res.json();
        const placedOrder = json.order || newOrder;
        setAppData((prev) => ({
          ...prev,
          orders: [placedOrder, ...prev.orders],
        }));
        setCart([]);
        setNavTab('orders');
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error || 'Failed to place order. Please check delivery slot and try again.';
        alert(errMsg);
        return false;
      }
    } catch (err) {
      console.error('Failed to place order:', err);
    }
    return false;
  };

  // Filtered Products Calculation
  const activeModule = React.useMemo(
    () => appData.modules.find((m) => m.id === activeModuleId),
    [appData.modules, activeModuleId]
  );
  const activeTheme = React.useMemo(() => getCategoryTheme(activeModuleId), [activeModuleId]);

  const filteredProducts = React.useMemo(() => {
    const enabledModuleIds = new Set(
      (appData.modules || []).filter((m) => m.enabled !== false).map((m) => m.id)
    );
    const enabledCategoryIds = new Set(
      (appData.categories || [])
        .filter(
          (c) => c.enabled !== false && (!c.moduleId || enabledModuleIds.has(c.moduleId))
        )
        .map((c) => c.id)
    );
    const activeStoreIds = new Set(
      (appData.stores || [])
        .filter((s) => s.status === 'ACTIVE' || s.status === undefined || (s as any).active === true)
        .map((s) => s.id)
    );

    return (appData.products || []).filter((product) => {
      // 0. Merchant store active check
      if (product.store_id && !activeStoreIds.has(product.store_id)) return false;

      // 1. Product active / enabled check
      if (product.enabled === false) return false;

      // 2. Parent module active check
      if (product.moduleId && !enabledModuleIds.has(product.moduleId)) return false;

      // 3. Parent category active check
      if (product.categoryId && !enabledCategoryIds.has(product.categoryId)) return false;

      // 4. Selected module filter
      if (activeModuleId !== 'all' && product.moduleId !== activeModuleId) return false;

      // 5. Selected category filter
      if (activeCategoryId !== 'all' && product.categoryId !== activeCategoryId) return false;

      // 6. Stock filter
      if (filterOptions.inStockOnly && product.stock === 0) return false;

      // 7. Rating filter
      if (filterOptions.minRating > 0 && (product.rating || 0) < filterOptions.minRating) return false;

      // 8. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(q);
        const descMatch = (product.description || '').toLowerCase().includes(q);
        const catMatch = appData.categories
          .find((c) => c.id === product.categoryId)
          ?.name.toLowerCase()
          .includes(q);
        return nameMatch || descMatch || catMatch;
      }

      return true;
    });
  }, [appData.products, appData.modules, appData.categories, activeModuleId, activeCategoryId, filterOptions, searchQuery]);

  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (filterOptions.sortBy === 'price_low_high') return a.price - b.price;
      if (filterOptions.sortBy === 'price_high_low') return b.price - a.price;
      if (filterOptions.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (a.order || 0) - (b.order || 0);
    });
  }, [filteredProducts, filterOptions.sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen shadow-2xl relative flex flex-col">
        {/* Portal Views vs Client App Views */}
        {navTab === 'admin' ? (
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Loading Admin Suite...</p>
                </div>
              </div>
            }
          >
            <AdminPanel
              data={appData}
              onUpdateData={handleUpdateAppData}
              onTriggerTestWebhook={handleTriggerTestWebhook}
              onRestoreBackup={handleRestoreBackup}
              onClose={() => navigateToTab('home')}
              onTestPWAInstallPrompt={() => setIsPwaModalOpen(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </React.Suspense>
        ) : navTab === 'vendor' ? (
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Loading Vendor Portal...</p>
                </div>
              </div>
            }
          >
            <VendorPanel
              appData={appData}
              onUpdateAppData={handleUpdateAppData}
              onSwitchToClient={() => navigateToTab('home')}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </React.Suspense>
        ) : (
          <>
            {/* Global Header */}
            <Header
              phone={customerPhone}
              isWhatsappLoggedIn={isWhatsappLoggedIn}
              onSetPhone={(p) => handleLinkSuccess(p, customerName)}
              cartCount={cart.reduce((s, i) => s + i.qty, 0)}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenCartDrawer={() => setIsCartOpen(true)}
              onOpenAdmin={() => navigateToTab('admin')}
              onOpenOrders={() => setNavTab('orders')}
              onOpenPWA={() => setIsPwaModalOpen(true)}
              onClearCache={handleClearCache}
              deliveryAddress={deliveryAddress}
              onUpdateAddress={handleUpdateAddress}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenLinkModal={() => setIsLinkModalOpen(true)}
            />

            {/* Auto Recognition Notice Banner */}
            {recognitionNotice && (
              <div className="bg-emerald-600 text-white px-4 py-3 shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300 z-30 sticky top-0">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span>{recognitionNotice}</span>
                    {customerPhone && (
                      <span className="block text-[11px] text-emerald-100 font-semibold mt-0.5">
                        നമ്പർ: +91 {customerPhone} • Checkout-ൽ ഫോൺ നമ്പർ മാറ്റാൻ കഴിയില്ല (Locked)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setRecognitionNotice(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer ml-2 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Router */}
            {navTab === 'modules' ? (
              <ModulesView
                modules={appData.modules || []}
                categories={appData.categories || []}
                products={appData.products || []}
                stores={appData.stores || []}
                onSelectModule={(modId) => {
                  setModuleReturnTab('modules');
                  setActiveModuleId(modId);
                  setActiveCategoryId('all');
                  setNavTab('module_detail');
                }}
                onSelectCategory={(modId, catId) => {
                  setModuleReturnTab('modules');
                  setActiveModuleId(modId);
                  setActiveCategoryId(catId);
                  setNavTab('category_detail');
                }}
              />
            ) : navTab === 'module_detail' ? (
              <ModuleDetailView
                moduleId={activeModuleId}
                modules={appData.modules || []}
                categories={appData.categories || []}
                products={appData.products || []}
                stores={appData.stores || []}
                cart={cart}
                onBack={() => setNavTab(moduleReturnTab || 'market')}
                onSelectModule={(modId) => {
                  setActiveModuleId(modId);
                  setActiveCategoryId('all');
                }}
                onSelectCategory={(catId) => {
                  setActiveCategoryId(catId);
                  setNavTab('category_detail');
                }}
                onAddToCart={(p) => handleAddToCart(p)}
                onUpdateCartQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                onOpenDetail={(p) => setDetailProduct(p)}
                onSelectStore={(s) => {
                  setSelectedStore(s);
                  setNavTab('store_detail');
                }}
              />
            ) : navTab === 'categories' ? (
              <CategoriesView
                modules={appData.modules}
                categories={appData.categories}
                products={appData.products}
                onSelectCategory={(modId, catId) => {
                  setModuleReturnTab('categories');
                  setActiveModuleId(modId);
                  setActiveCategoryId(catId);
                  setNavTab('category_detail');
                }}
              />
            ) : navTab === 'category_detail' ? (
              <CategoryDetailView
                categoryId={activeCategoryId}
                moduleId={activeModuleId}
                modules={appData.modules || []}
                categories={appData.categories || []}
                products={appData.products || []}
                stores={appData.stores || []}
                cart={cart}
                onBack={() => {
                  if (moduleReturnTab === 'market') {
                    setNavTab('market');
                  } else if (moduleReturnTab === 'home') {
                    setNavTab('home');
                  } else {
                    setNavTab('categories');
                  }
                }}
                onSelectCategory={(catId) => setActiveCategoryId(catId)}
                onAddToCart={(p) => handleAddToCart(p)}
                onUpdateCartQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                onOpenDetail={(p) => setDetailProduct(p)}
                onSelectStore={(s) => {
                  setSelectedStore(s);
                  setNavTab('store_detail');
                }}
              />
            ) : navTab === 'stores' ? (
              <StoresView
                stores={appData.stores || []}
                onSelectStore={(st) => {
                  setSelectedStore(st);
                  setNavTab('store_detail');
                }}
              />
            ) : navTab === 'store_detail' && selectedStore ? (
              <StoreDetailView
                store={selectedStore}
                products={appData.products}
                cart={cart}
                onBack={() => setNavTab(moduleReturnTab === 'market' ? 'market' : 'stores')}
                onAddToCart={(p) => handleAddToCart(p)}
                onUpdateQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                onOpenDetail={(p) => setDetailProduct(p)}
              />
            ) : navTab === 'market' ? (
              <MarketView
                products={appData.products || []}
                categories={appData.market_categories || []}
                foodCategories={appData.categories || []}
                modules={appData.modules || []}
                stores={appData.stores || []}
                banners={appData.market_banners || []}
                settings={appData.market_settings}
                cart={cart}
                wishlist={wishlist}
                onAddToCart={(p, qty) => handleAddToCart(p, undefined, qty || 1)}
                onUpdateCartQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={(p) => setDetailProduct(p)}
                onSelectStore={(s) => {
                  setSelectedStore(s);
                  setModuleReturnTab('market');
                  setNavTab('store_detail');
                }}
                onSelectModule={(modId) => {
                  setModuleReturnTab('market');
                  setActiveModuleId(modId);
                  setActiveCategoryId('all');
                  setNavTab('module_detail');
                }}
                onBack={() => setNavTab('home')}
                onOpenCart={() => setNavTab('cart')}
                onOpenWishlist={() => setNavTab('wishlist')}
              />
            ) : navTab === 'cart' ? (
              <CartView
                cart={cart}
                deliveryAddress={deliveryAddress}
                onUpdateQty={(cartId, change) => handleUpdateCartQty(cartId, change)}
                onClearCart={() => setCart([])}
                onProceedToCheckout={() => setNavTab('checkout')}
                onNavigateTab={(tab) => setNavTab(tab)}
              />
            ) : navTab === 'orders' ? (
              <OrdersView
                orders={appData.orders}
                phone={customerPhone}
                onOpenLinkModal={() => setIsLinkModalOpen(true)}
                onUnlinkAccount={handleUnlinkAccount}
              />
            ) : navTab === 'account' ? (
              <AccountView
                phone={customerPhone}
                name={customerName}
                isWhatsappLoggedIn={isWhatsappLoggedIn}
                onOpenLinkModal={() => setIsLinkModalOpen(true)}
                onUnlinkAccount={handleUnlinkAccount}
                onNavigateTab={(tab) => setNavTab(tab)}
                deliveryAddress={deliveryAddress}
                theme={theme}
                onToggleTheme={toggleTheme}
                settings={appData.settings}
              />
            ) : navTab === 'wishlist' ? (
              <WishlistView
                products={appData.products}
                cart={cart}
                onAddToCart={(p) => handleAddToCart(p)}
                onUpdateQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                onOpenDetail={(p) => setDetailProduct(p)}
                onBack={() => setNavTab('account')}
              />
            ) : navTab === 'wallet' ? (
              <WalletView onBack={() => setNavTab('account')} />
            ) : navTab === 'royal_club' || navTab === 'royalclub' ? (
              <RoyalClubView
                onBack={() => setNavTab('home')}
                onNavigateTab={(tab) => setNavTab(tab)}
                settings={appData.settings}
              />
            ) : navTab === 'referral' ? (
              <ReferralView phone={customerPhone} onBack={() => setNavTab('account')} />
            ) : navTab === 'notifications' ? (
              <NotificationCenter onBack={() => setNavTab('account')} />
            ) : navTab === 'checkout' ? (
              <CheckoutView
                cart={cart}
                settings={appData.settings}
                stores={appData.stores}
                products={appData.products}
                deliveryAddress={deliveryAddress}
                customerPhone={customerPhone}
                isWhatsappLoggedIn={isWhatsappLoggedIn}
                onBack={() => setNavTab('home')}
                onPlaceOrder={handlePlaceOrder}
              />
            ) : (
              /* HOME VIEW - DYNAMIC PLATFORM TEMPLATE ENGINE RENDERING */
              (() => {
                const activeTemplateId = appData.platform_template_settings?.active_template_id || 'hm-q-modern';
                const TemplateComp = TemplateRegistry.getTemplateComponent(activeTemplateId);

                return (
                  <TemplateComp
                    appData={appData}
                    activeModuleId={activeModuleId}
                    activeCategoryId={activeCategoryId}
                    searchQuery={searchQuery}
                    cart={cart}
                    sortedProducts={sortedProducts}
                    activeModule={activeModule}
                    deliveryAddress={deliveryAddress}
                    customerPhone={customerPhone}
                    customerName={customerName}
                    isWhatsappLoggedIn={isWhatsappLoggedIn}
                    navTab={navTab}
                    filterOptions={filterOptions}
                    theme={theme}
                    onSelectModule={(id) => {
                      setModuleReturnTab('home');
                      setActiveModuleId(id);
                      setActiveCategoryId('all');
                      setNavTab('module_detail');
                    }}
                    onSelectCategory={(catId) => {
                      setActiveCategoryId(catId);
                      setNavTab('category_detail');
                    }}
                    onSearchChange={setSearchQuery}
                    onOpenSearchOverlay={() => setIsSearchOverlayOpen(true)}
                    onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
                    onAddToCart={(p) => handleAddToCart(p)}
                    onUpdateCartQty={(pId, chg) => handleUpdateCartQty(pId, chg)}
                    onOpenDetail={(p) => setDetailProduct(p)}
                    onOpenDetailProduct={(p) => setDetailProduct(p)}
                    onSelectStore={(s) => {
                      setSelectedStore(s);
                      setNavTab('store_detail');
                    }}
                    onOpenStoreDetail={(s) => {
                      setSelectedStore(s);
                      setNavTab('store_detail');
                    }}
                    onSelectBanner={(b) => {
                      if (b.linkModuleId) {
                        setActiveModuleId(b.linkModuleId);
                        setActiveCategoryId('all');
                        setNavTab('module_detail');
                      }
                    }}
                    onViewAllStores={() => setNavTab('stores')}
                    onNavigateTab={(tab) => navigateToTab(tab)}
                    onSelectTab={(tab) => navigateToTab(tab)}
                    onChangeTab={(tab) => navigateToTab(tab)}
                    onOpenCartDrawer={() => setIsCartOpen(true)}
                    onToggleTheme={toggleTheme}
                    onOpenLinkModal={() => setIsLinkModalOpen(true)}
                  />
                );
              })()
            )}


            {/* Floating Cart Indicator */}
            {navTab !== 'checkout' && navTab !== 'admin' && navTab !== 'vendor' && (
              <FloatingCart cart={cart} onOpenCart={() => setIsCartOpen(true)} />
            )}

            {/* Bottom Navigation */}
            <BottomNav
              activeTab={navTab === 'admin' || navTab === 'vendor' ? 'home' : navTab}
              onChangeTab={(tab) => navigateToTab(tab)}
              cartCount={cart.reduce((s, i) => s + i.qty, 0)}
              items={appData.settings?.bottom_nav_items}
            />

            {/* Global Search Overlay */}
            <GlobalSearch
              isOpen={isSearchOverlayOpen}
              onClose={() => setIsSearchOverlayOpen(false)}
              products={appData.products}
              stores={appData.stores || []}
              categories={appData.categories}
              onSelectProduct={(p) => setDetailProduct(p)}
              onSelectStore={(s) => {
                setSelectedStore(s);
                setNavTab('store_detail');
              }}
            />

            {/* Filter Bottom Sheet */}
            <FilterSheet
              isOpen={isFilterSheetOpen}
              onClose={() => setIsFilterSheetOpen(false)}
              currentFilters={filterOptions}
              onApplyFilters={(opts) => setFilterOptions(opts)}
              onResetFilters={() =>
                setFilterOptions({
                  sortBy: 'relevance',
                  inStockOnly: false,
                  minPrice: 0,
                  maxPrice: 10000,
                  minRating: 0,
                })
              }
            />

            {/* Product Detail Modal */}
            <ProductDetailModal
              product={detailProduct}
              onClose={() => setDetailProduct(null)}
              onAddToCart={(p, q, v) => handleAddToCart(p, v, q)}
              storeName={
                (appData.stores || []).find((s) => s.id === detailProduct?.store_id)?.name ||
                appData.settings?.store_name ||
                'Hyperlocal Merchant'
              }
              storeWhatsapp={
                (appData.stores || []).find((s) => s.id === detailProduct?.store_id)?.whatsapp_phone ||
                appData.settings?.whatsapp_phone ||
                '919876543210'
              }
              onOpenStore={(sId) => {
                const sObj = (appData.stores || []).find((s) => s.id === sId);
                if (sObj) {
                  setSelectedStore(sObj);
                  setNavTab('store_detail');
                  setDetailProduct(null);
                }
              }}
            />

            {/* Cart Drawer Modal */}
            <CartDrawer
              cart={cart}
              onUpdateQty={(cartId, change) => handleUpdateCartQty(cartId, change)}
              onClearCart={() => setCart([])}
              onAttachItemPrescription={handleAttachItemPrescription}
              customerPhone={customerPhone}
              isWhatsappLoggedIn={isWhatsappLoggedIn}
              settings={appData.settings}
              onPlaceOrder={handlePlaceOrder}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Floating WhatsApp Support Button */}
            <WhatsAppSupportButton settings={appData.settings} />

            {/* PWA Modal */}
            <PWAInstallModal
              settings={appData.settings}
              isOpen={isPwaModalOpen}
              onClose={() => setIsPwaModalOpen(false)}
              deferredPrompt={deferredPrompt}
            />

            {/* Unified WhatsApp Customer Login Modal */}
            <WhatsAppLinkModal
              isOpen={isLinkModalOpen}
              onClose={() => setIsLinkModalOpen(false)}
              onLinkSuccess={handleLinkSuccess}
              initialPhone={customerPhone}
              initialName={customerName}
            />
          </>
        )}
      </div>
    </div>
  );
}
