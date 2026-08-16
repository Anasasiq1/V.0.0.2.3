import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { StoreCreationModal } from './StoreCreationModal';
import { StoresManagementTab } from './StoresManagementTab';
import { TemplateEngineAdmin } from './TemplateEngineAdmin';
import { AdminMarketManagement } from './AdminMarketManagement';
import { AdminBackupManagement } from './AdminBackupManagement';
import { DeveloperApiManagement } from './DeveloperApiManagement';
import { DeliveryFleetManagement } from './DeliveryFleetManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { AdvertisementsManagement } from './AdvertisementsManagement';
import { ReviewsModerationTab } from './ReviewsModerationTab';
import { PosTerminalModal } from './PosTerminalModal';
import {
  AppData,
  Module,
  Category,
  Product,
  PromoBanner,
  OrderStatus,
  ModuleSize,
  DeliverySlot,
  AdminUser,
  UserRole,
  RolePermissions,
  VendorStore,
  BottomNavItem,
  ProfileSettings,
  RoyalClubSettings,
  ProfileCustomMenuItem,
} from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Users,
  FileText,
  Percent,
  Link2,
  Settings,
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  Lock,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Check,
  DollarSign,
  ShoppingCart,
  X,
  Layers,
  Grid,
  Image as ImageIcon,
  UploadCloud,
  FileArchive,
  Store,
  Sparkles,
  Tag,
  Eye,
  Clock,
  Zap,
  Truck,
  AlertTriangle,
  Package,
  MessageCircle,
  Send,
  ExternalLink,
  Share2,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Database,
  Wallet,
  EyeOff,
  Server,
  CheckCircle2,
  XCircle,
  LogOut,
  Copy,
  Power,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Compass,
  Heart,
  Home,
  Crown,
  UtensilsCrossed,
  UserCheck,
  Gift,
  Headphones,
  HelpCircle,
  Shield,
  ListPlus,
  BadgePercent,
  Award,
  Code2,
  Megaphone,
  Star,
  Key,
} from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  onTriggerTestWebhook: () => Promise<boolean>;
  onRestoreBackup: (fileContent: string) => Promise<boolean>;
  onClose: () => void;
  onTestPWAInstallPrompt?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  data,
  onUpdateData,
  onTriggerTestWebhook,
  onRestoreBackup,
  onClose,
  onTestPWAInstallPrompt,
  theme,
  onToggleTheme,
}) => {
  // Security & Admin Authentication State
  const [adminUsername, setAdminUsername] = useState(data.settings?.admin_username || 'admin');
  const [adminPassword, setAdminPassword] = useState(
    data.settings?.admin_password || data.settings?.admin_pin || 'admin123'
  );
  const [adminLoginBanner, setAdminLoginBanner] = useState(
    data.settings?.admin_login_banner ||
      'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=1200&auto=format&fit=crop&q=80'
  );
  const [adminBannerTitle, setAdminBannerTitle] = useState(
    data.settings?.admin_banner_title || 'Hyperlocal Merchant Portal'
  );
  const [adminBannerSubtitle, setAdminBannerSubtitle] = useState(
    data.settings?.admin_banner_subtitle ||
      'Manage products, orders, inventory, delivery slots, and WhatsApp notifications seamlessly.'
  );

  // Login Screen Input State
  const [inputUsername, setInputUsername] = useState(data.settings?.admin_username || 'admin');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem('ezmart_admin_unlocked') === 'true'
  );
  const [newPinInput, setNewPinInput] = useState(adminPassword);

  // POS Terminal Modal State
  const [isPosOpen, setIsPosOpen] = useState(false);

  // Active Admin Sidebar tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'market'
    | 'template-engine'
    | 'stores'
    | 'orders'
    | 'products'
    | 'categories'
    | 'modules'
    | 'navigation'
    | 'footer-panel'
    | 'profile-settings'
    | 'royal-club'
    | 'delivery'
    | 'delivery-fleet'
    | 'developer-api'
    | 'subscriptions'
    | 'advertisements'
    | 'reviews'
    | 'integrations'
    | 'reports'
    | 'settings'
    | 'pwa'
    | 'whatsapp'
    | 'payments'
    | 'roles'
  >('dashboard');

  const defaultAdminBottomNavItems: BottomNavItem[] = [
    { id: 'home', label: 'Food', icon: 'UtensilsCrossed', enabled: false, order: 1, action: 'home' },
    { id: 'grocery', label: 'Grocery', icon: 'ShoppingBag', enabled: false, order: 2, action: 'home' },
    { id: 'market', label: 'Market', icon: 'Store', enabled: false, order: 3, action: 'market' },
    { id: 'royal_club', label: 'Royal Club', icon: 'Crown', enabled: false, order: 4, action: 'royal_club' },
    { id: 'account', label: 'Profile', icon: 'User', enabled: true, order: 5, action: 'account' },
    { id: 'categories', label: 'Categories', icon: 'Grid', enabled: false, order: 6, action: 'categories' },
    { id: 'stores', label: 'Stores', icon: 'Store', enabled: false, order: 7, action: 'stores' },
    { id: 'modules', label: 'Modules', icon: 'Layers', enabled: false, order: 8, action: 'modules' },
    { id: 'cart', label: 'Cart', icon: 'ShoppingCart', enabled: false, order: 9, action: 'cart' },
    { id: 'orders', label: 'Orders', icon: 'Clock', enabled: false, order: 10, action: 'orders' },
    { id: 'wishlist', label: 'Wishlist', icon: 'Heart', enabled: false, order: 11, action: 'wishlist' },
    { id: 'wallet', label: 'Wallet', icon: 'Wallet', enabled: false, order: 12, action: 'wallet' },
  ];

  const [bottomNavList, setBottomNavList] = useState<BottomNavItem[]>(() => {
    const existing = data.settings?.bottom_nav_items;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      const existingIds = new Set(existing.map((i) => i.id));
      const merged = [...existing];
      defaultAdminBottomNavItems.forEach((item) => {
        if (!existingIds.has(item.id)) {
          merged.push({ ...item, order: merged.length + 1 });
        }
      });
      return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return defaultAdminBottomNavItems;
  });

  // Profile Page Sub-Settings state
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => ({
    enable_vouchers: data.settings?.profile_settings?.enable_vouchers ?? true,
    enable_royal_club: data.settings?.profile_settings?.enable_royal_club ?? true,
    enable_orders: data.settings?.profile_settings?.enable_orders ?? true,
    enable_wallet: data.settings?.profile_settings?.enable_wallet ?? true,
    enable_settings: data.settings?.profile_settings?.enable_settings ?? true,
    enable_help: data.settings?.profile_settings?.enable_help ?? true,
    enable_terms: data.settings?.profile_settings?.enable_terms ?? true,
    enable_privacy: data.settings?.profile_settings?.enable_privacy ?? true,
    enable_review: data.settings?.profile_settings?.enable_review ?? true,
    enable_app_version: data.settings?.profile_settings?.enable_app_version ?? true,
    enable_user_card: data.settings?.profile_settings?.enable_user_card ?? true,
    app_version_name: data.settings?.profile_settings?.app_version_name || 'HM-Q App',
    app_version_code: data.settings?.profile_settings?.app_version_code || 'Version 0.0.3',
    custom_menu_items: data.settings?.profile_settings?.custom_menu_items || [],
  }));

  // Royal Club VIP settings state
  const [royalClubSettings, setRoyalClubSettings] = useState<RoyalClubSettings>(() => ({
    enabled: data.settings?.royal_club_settings?.enabled ?? true,
    title: data.settings?.royal_club_settings?.title || 'Royal Club VIP',
    monthly_price: data.settings?.royal_club_settings?.monthly_price || 29,
    badge_text: data.settings?.royal_club_settings?.badge_text || 'VIP SAVINGS',
    free_delivery_above: data.settings?.royal_club_settings?.free_delivery_above || 50,
    discount_percentage: data.settings?.royal_club_settings?.discount_percentage || 15,
    cashback_percentage: data.settings?.royal_club_settings?.cashback_percentage || 5,
    perks: data.settings?.royal_club_settings?.perks || [
      'Unlimited Free Delivery on orders above 50 QAR',
      'Exclusive 15% VIP Discounts across 200+ partner outlets',
      'Double Reward Points & 5% instant cashback to wallet',
      '24/7 Priority VIP Concierge support',
    ],
  }));

  // Modal / Form state for Adding Custom Bottom Nav Item
  const [isAddingNavItem, setIsAddingNavItem] = useState(false);
  const [newNavItem, setNewNavItem] = useState<{
    id: string;
    label: string;
    icon: string;
    action: string;
    badge: string;
    enabled: boolean;
  }>({
    id: '',
    label: '',
    icon: 'Compass',
    action: 'home',
    badge: '',
    enabled: true,
  });

  // Modal / Form state for Adding Custom Profile Menu Item
  const [isAddingProfileMenu, setIsAddingProfileMenu] = useState(false);
  const [newProfileMenu, setNewProfileMenu] = useState<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    action: string;
    badge: string;
    enabled: boolean;
  }>({
    id: '',
    title: '',
    subtitle: '',
    icon: 'Gift',
    action: 'vouchers',
    badge: '',
    enabled: true,
  });

  // New Perk input for Royal Club
  const [newPerkInput, setNewPerkInput] = useState('');

  const [isStoreCreationOpen, setIsStoreCreationOpen] = useState(false);

  // RBAC & Super Admin WhatsApp State
  const [superAdminWhatsappPhone, setSuperAdminWhatsappPhone] = useState(
    data.settings?.super_admin_whatsapp_phone || ''
  );
  const [usersList, setUsersList] = useState<AdminUser[]>(data.users || []);
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getAdminHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('hyperlocal_admin_token') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['x-admin-token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Filter states
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'enabled' | 'disabled'>('all');
  const [moduleFilterTab, setModuleFilterTab] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [categoryFilterTab, setCategoryFilterTab] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Form states for Modules
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [isNewModule, setIsNewModule] = useState(false);

  // Form states for Categories
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Form states for Products
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isAiUpscalingProduct, setIsAiUpscalingProduct] = useState(false);

  const handleAiUpscaleProduct = async () => {
    if (!editingProduct?.name || !editingProduct.name.trim()) {
      alert('Please enter a product title first before upscaling with AI.');
      return;
    }
    setIsAiUpscalingProduct(true);
    try {
      const selectedCat = data.categories.find((c) => c.id === editingProduct.categoryId);
      const res = await fetch('/api/ai/upscale-product', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: editingProduct.name,
          category: selectedCat?.name || '',
          currentDescription: editingProduct.description || '',
          price: editingProduct.price || 0,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEditingProduct((prev) => ({
          ...prev,
          name: json.data.title || prev?.name,
          description: json.data.description || prev?.description,
          badge: json.data.badge || prev?.badge,
        }));
        showToast('Product details upscaled with Gemini AI!');
      }
    } catch (err: any) {
      console.error('Failed to upscale product with AI:', err);
    } finally {
      setIsAiUpscalingProduct(false);
    }
  };

  // Delivery Slots state
  const defaultSlots: DeliverySlot[] = [
    { id: 'slot-1', time: '11:00 AM', label: 'Morning Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-2', time: '12:00 PM', label: 'Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)', fee: 0, isFree: true, isActive: true },
    { id: 'slot-3', time: '01:00 PM', label: 'Post Lunch Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-4', time: '03:00 PM', label: 'Afternoon Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-5', time: '05:00 PM', label: 'Evening Batch', fee: 0, isFree: true, isActive: true },
  ];

  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(
    data.settings?.delivery_slots && data.settings.delivery_slots.length > 0
      ? data.settings.delivery_slots
      : defaultSlots
  );

  const [expressFeeInput, setExpressFeeInput] = useState<number>(
    data.settings?.express_delivery_fee ?? 40
  );

  const [editingSlot, setEditingSlot] = useState<Partial<DeliverySlot> | null>(null);
  const [isNewSlot, setIsNewSlot] = useState(false);

  // Settings & Branding state
  const [n8nWebhookEnabled, setN8nWebhookEnabled] = useState<boolean>(data.settings?.n8n_webhook_enabled !== false);
  const [webhookUrl, setWebhookUrl] = useState(data.settings?.n8n_webhook_url || '');
  const [n8nHost, setN8nHost] = useState(data.settings?.n8n_host || 'localhost');
  const [n8nPort, setN8nPort] = useState(data.settings?.n8n_port ? String(data.settings.n8n_port) : '5678');
  const [n8nProtocol, setN8nProtocol] = useState<'http' | 'https'>(data.settings?.n8n_protocol || 'http');
  const [n8nEncryptionKey, setN8nEncryptionKey] = useState(data.settings?.n8n_encryption_key || '');
  const [n8nWebhookSecret, setN8nWebhookSecret] = useState(data.settings?.n8n_webhook_secret || '');
  const [showSecret, setShowSecret] = useState(false);
  const [n8nTestStatus, setN8nTestStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'failed'; message: string } | null>(null);
  const [webhookTestStatus, setWebhookTestStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'failed'; message: string } | null>(null);
  const [storeName, setStoreName] = useState(data.settings?.store_name || 'WhatsApp Hyperlocal Store');
  const [adminLogo, setAdminLogo] = useState(data.settings?.admin_logo || '');

  // PWA Settings State
  const [pwaEnabled, setPwaEnabled] = useState<boolean>(data.settings?.pwa_enabled !== false);
  const [pwaName, setPwaName] = useState(data.settings?.pwa_name || data.settings?.store_name || 'Hyperlocal WhatsApp Store');
  const [pwaShortName, setPwaShortName] = useState(data.settings?.pwa_short_name || 'HyperlocalApp');
  const [pwaDescription, setPwaDescription] = useState(data.settings?.pwa_description || 'Fastest 15-minute hyperlocal delivery store directly integrated with WhatsApp. Order groceries, food, meat & essentials with 1-click.');
  const [pwaIcon, setPwaIcon] = useState(data.settings?.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80');
  const [pwaThemeColor, setPwaThemeColor] = useState(data.settings?.pwa_theme_color || '#059669');
  const [pwaBgColor, setPwaBgColor] = useState(data.settings?.pwa_bg_color || '#f8fafc');
  const [pwaDisplayMode, setPwaDisplayMode] = useState<'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'>(data.settings?.pwa_display_mode || 'standalone');

  // WhatsApp Routing Settings State
  const [whatsappSupportEnabled, setWhatsappSupportEnabled] = useState<boolean>(data.settings?.whatsapp_support_enabled !== false);
  const [sendToCustomerWhatsapp, setSendToCustomerWhatsapp] = useState<boolean>(data.settings?.send_to_customer_whatsapp !== false);
  const [whatsappMode, setWhatsappMode] = useState<'n8n_api' | 'direct' | 'both' | 'customer_only' | 'store_only'>(data.settings?.whatsapp_mode || 'n8n_api');
  const [customerWaAutoOpen, setCustomerWaAutoOpen] = useState<boolean>(data.settings?.customer_wa_auto_open !== false);
  const [storeWhatsappPhone, setStoreWhatsappPhone] = useState(data.settings?.store_whatsapp_phone || data.settings?.store_phone || '');

  const handleSaveWhatsappSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      whatsapp_support_enabled: whatsappSupportEnabled,
      send_to_customer_whatsapp: sendToCustomerWhatsapp,
      whatsapp_mode: whatsappMode,
      customer_wa_auto_open: customerWaAutoOpen,
      store_whatsapp_phone: storeWhatsappPhone,
      super_admin_whatsapp_phone: superAdminWhatsappPhone,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('WhatsApp Order Routing & Support settings saved!');
  };

  const handleSaveUser = async () => {
    if (!editingUser?.username?.trim()) return showToast('Username is required', 'error');
    if (!editingUser?.role) return showToast('Role is required', 'error');

    let updatedUsers = [...usersList];
    if (isNewUser) {
      const newUser: AdminUser = {
        id: 'usr-' + Date.now(),
        username: editingUser.username.trim(),
        password: editingUser.password || '123456',
        name: editingUser.name?.trim() || editingUser.username,
        role: editingUser.role as UserRole,
        whatsapp_phone: editingUser.whatsapp_phone || '919876543210',
        active: editingUser.active !== false,
        permissions: editingUser.permissions || {
          can_manage_products: true,
          can_manage_categories: true,
          can_manage_orders: true,
          can_manage_settings: editingUser.role === 'super_admin' || editingUser.role === 'admin',
          can_view_reports: true,
        },
      };
      updatedUsers.push(newUser);
    } else {
      updatedUsers = updatedUsers.map((u) =>
        u.id === editingUser.id ? ({ ...u, ...editingUser } as AdminUser) : u
      );
    }

    setUsersList(updatedUsers);
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      super_admin_whatsapp_phone: superAdminWhatsappPhone,
    };
    await onUpdateData({ ...data, users: updatedUsers, settings: updatedSettings });
    setSaving(false);
    setEditingUser(null);
    showToast('Staff user account & permissions saved!');
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff user?')) {
      const updated = usersList.filter((u) => u.id !== id);
      setUsersList(updated);
      setSaving(true);
      await onUpdateData({ ...data, users: updated });
      setSaving(false);
      showToast('Staff user account removed');
    }
  };

  // Payment Options & UPI Settings State
  const [codEnabled, setCodEnabled] = useState<boolean>(data.settings?.cod_enabled !== false);
  const [upiEnabled, setUpiEnabled] = useState<boolean>(data.settings?.upi_enabled !== false);
  const [walletEnabled, setWalletEnabled] = useState<boolean>(data.settings?.wallet_enabled !== false);
  const [walletDemoBalance, setWalletDemoBalance] = useState<number>(data.settings?.wallet_demo_balance ?? 500);
  const [upiId, setUpiId] = useState(data.settings?.upi_id || '');
  const [upiPhone, setUpiPhone] = useState(data.settings?.upi_phone || '');
  const [upiPayeeName, setUpiPayeeName] = useState(data.settings?.upi_payee_name || data.settings?.store_name || 'Hyperlocal Store');
  const [upiQrImage, setUpiQrImage] = useState(data.settings?.upi_qr_image || '');

  // Real-time Super Admin Order Notification Sound & Alert
  const [prevOrdersLength, setPrevOrdersLength] = useState<number>(data.orders?.length || 0);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  useEffect(() => {
    const currentLen = data.orders?.length || 0;
    if (currentLen > prevOrdersLength && prevOrdersLength > 0) {
      const latestOrder = data.orders[0];
      const alertMsg = `Order #${latestOrder?.order_id || 'NEW'} (${latestOrder?.store_name || 'Store'}) for ₹${latestOrder?.total_amount || 0}`;
      setNewOrderAlert(alertMsg);

      // Dual-tone Web Audio chime sound
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now);
          osc1.frequency.setValueAtTime(880, now + 0.12);
          gain1.gain.setValueAtTime(0.3, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.6);
        }
      } catch (err) {
        console.warn('Audio chime warning:', err);
      }
    }
    setPrevOrdersLength(currentLen);
  }, [data.orders?.length]);

  useEffect(() => {
    if (data.settings) {
      setCodEnabled(data.settings.cod_enabled !== false);
      setUpiEnabled(data.settings.upi_enabled !== false);
      setWalletEnabled(data.settings.wallet_enabled !== false);
      setWalletDemoBalance(data.settings.wallet_demo_balance ?? 500);
      setUpiId(data.settings.upi_id ?? '');
      setUpiPhone(data.settings.upi_phone ?? '');
      setUpiPayeeName(data.settings.upi_payee_name ?? '');
      setUpiQrImage(data.settings.upi_qr_image ?? '');
      if (data.settings.store_name) setStoreName(data.settings.store_name);
      setN8nWebhookEnabled(data.settings.n8n_webhook_enabled !== false);
      if (data.settings.n8n_webhook_url) setWebhookUrl(data.settings.n8n_webhook_url);
      if (data.settings.n8n_host) setN8nHost(data.settings.n8n_host);
      if (data.settings.n8n_port) setN8nPort(String(data.settings.n8n_port));
      if (data.settings.n8n_protocol) setN8nProtocol(data.settings.n8n_protocol);
      if (data.settings.n8n_encryption_key) setN8nEncryptionKey(data.settings.n8n_encryption_key);
      if (data.settings.n8n_webhook_secret) setN8nWebhookSecret(data.settings.n8n_webhook_secret);
      setStoreWhatsappPhone(data.settings.store_whatsapp_phone ?? data.settings.store_phone ?? '');
      setSuperAdminWhatsappPhone(data.settings.super_admin_whatsapp_phone ?? '');
    }
    if (data.users) {
      setUsersList(data.users);
    }
  }, [data.settings, data.users]);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      cod_enabled: codEnabled,
      upi_enabled: upiEnabled,
      wallet_enabled: walletEnabled,
      wallet_demo_balance: walletDemoBalance,
      upi_id: upiId,
      upi_phone: upiPhone,
      upi_payee_name: upiPayeeName,
      upi_qr_image: upiQrImage,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Payment Options, Wallet Gateway & Personal UPI configuration saved successfully!');
  };

  // WhatsApp Notification State
  const [whatsappModalOrder, setWhatsappModalOrder] = useState<{
    order: AppData['orders'][0];
    status: OrderStatus;
  } | null>(null);
  const [customWhatsappNote, setCustomWhatsappNote] = useState<string>('');
  const [autoOpenWhatsapp, setAutoOpenWhatsapp] = useState<boolean>(true);

  const handleUpdateStoreStatus = async (storeId: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') => {
    try {
      const res = await fetch(`/api/stores/${storeId}/status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Store status updated to ${status}`);
        const updatedStores = (data.stores || []).map((s) =>
          s.id === storeId ? { ...s, status, active: status === 'ACTIVE' } : s
        );
        await onUpdateData({ ...data, stores: updatedStores });
      }
    } catch (err: any) {
      showToast('Failed to update store status: ' + err.message, 'error');
    }
  };

  const handleUpdateStoreModules = async (storeId: string, moduleIds: string[]) => {
    try {
      const res = await fetch(`/api/stores/${storeId}/modules`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ modules: moduleIds }),
      });
      if (res.ok) {
        showToast('Store module assignments updated!');
        const updatedStores = (data.stores || []).map((s) =>
          s.id === storeId ? { ...s, modules: moduleIds } : s
        );
        await onUpdateData({ ...data, stores: updatedStores });
      }
    } catch (err: any) {
      showToast('Failed to update store modules: ' + err.message, 'error');
    }
  };

  const handleStoreCreated = async (newStore: VendorStore, newOwner: AdminUser) => {
    showToast(`Store "${newStore.name}" created successfully!`);
    const updatedStores = [newStore, ...(data.stores || [])];
    const updatedUsers = [newOwner, ...(data.users || [])];
    await onUpdateData({ ...data, stores: updatedStores, users: updatedUsers });
  };

  // Verify active server-side admin session on mount
  useEffect(() => {
    const token = localStorage.getItem('hyperlocal_admin_token') || '';
    fetch('/api/admin/session', {
      headers: token ? { 'x-admin-token': token, Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.authenticated) {
          setIsUnlocked(true);
          if (json.user) setCurrentUser(json.user);
        } else {
          setIsUnlocked(false);
          localStorage.removeItem('ezmart_admin_unlocked');
        }
      })
      .catch(() => {
        // network issue
      });
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim() || !inputPassword.trim()) {
      setLoginError('Please enter both admin username and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: inputUsername.trim(),
          password: inputPassword,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.token) {
            localStorage.setItem('hyperlocal_admin_token', json.token);
          }
          if (json.user) {
            setCurrentUser(json.user);
          }
          setIsUnlocked(true);
          if (rememberMe) {
            localStorage.setItem('ezmart_admin_unlocked', 'true');
          }
          setLoginLoading(false);
          return;
        } else {
          setLoginError(json.error || 'Invalid credentials');
          setLoginLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend authentication API check error:', err);
    }

    setLoginError('Invalid admin username or password. Please try again.');
    setInputPassword('');
    setLoginLoading(false);
  };

  const handleAdminLogout = async () => {
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: token ? { 'x-admin-token': token, Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    localStorage.removeItem('hyperlocal_admin_token');
    localStorage.removeItem('ezmart_admin_unlocked');
    setIsUnlocked(false);
  };

  // Helper for reading uploaded image files to base64 Data URL
  const handleImageFileRead = (
    file: File,
    onSuccess: (base64Url: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size should be less than 10MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
        showToast('Image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // ---------------- REORDERING HANDLERS ----------------
  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.modules.length) return;

    const updated = [...data.modules];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((m, idx) => {
      m.order = idx + 1;
    });

    setSaving(true);
    await onUpdateData({ ...data, modules: updated });
    setSaving(false);
    showToast('Module display order updated!');
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.categories.length) return;

    const updated = [...data.categories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((c, idx) => {
      c.order = idx + 1;
    });

    setSaving(true);
    await onUpdateData({ ...data, categories: updated });
    setSaving(false);
    showToast('Category display order updated!');
  };

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.products.length) return;

    const updated = [...data.products];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setSaving(true);
    await onUpdateData({ ...data, products: updated });
    setSaving(false);
    showToast('Product display order updated!');
  };

  const handleMoveSlot = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= deliverySlots.length) return;

    const updated = [...deliverySlots];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setDeliverySlots(updated);
    const updatedSettings = {
      ...data.settings,
      delivery_slots: updated,
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Delivery slot order updated!');
  };

  // ---------------- BOTTOM NAVIGATION REORDER & TOGGLE HANDLERS ----------------
  const handleMoveBottomNavItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= bottomNavList.length) return;

    const updated = [...bottomNavList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setBottomNavList(updated);
  };

  const handleToggleBottomNavItem = (index: number) => {
    const updated = [...bottomNavList];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setBottomNavList(updated);
  };

  const handleUpdateBottomNavLabel = (index: number, newLabel: string) => {
    const updated = [...bottomNavList];
    updated[index] = { ...updated[index], label: newLabel };
    setBottomNavList(updated);
  };

  const handleUpdateBottomNavAction = (index: number, newAction: string) => {
    const updated = [...bottomNavList];
    updated[index] = { ...updated[index], action: newAction };
    setBottomNavList(updated);
  };

  const handleUpdateBottomNavIcon = (index: number, newIcon: string) => {
    const updated = [...bottomNavList];
    updated[index] = { ...updated[index], icon: newIcon };
    setBottomNavList(updated);
  };

  const handleUpdateBottomNavBadge = (index: number, newBadge: string) => {
    const updated = [...bottomNavList];
    updated[index] = { ...updated[index], badge: newBadge };
    setBottomNavList(updated);
  };

  const handleDeleteBottomNavItem = (index: number) => {
    const item = bottomNavList[index];
    if (confirm(`Remove "${item.label || item.id}" button from bottom navigation?`)) {
      const updated = bottomNavList.filter((_, idx) => idx !== index);
      updated.forEach((it, idx) => {
        it.order = idx + 1;
      });
      setBottomNavList(updated);
      showToast(`Removed "${item.label || item.id}"`);
    }
  };

  const handleAddNewBottomNavItem = () => {
    if (!newNavItem.label.trim()) return showToast('Button label is required', 'error');
    const newId = newNavItem.id.trim() || 'nav-' + Date.now();

    if (bottomNavList.some((i) => i.id.toLowerCase() === newId.toLowerCase())) {
      return showToast('An item with this ID already exists. Please choose a unique ID.', 'error');
    }

    const item: BottomNavItem = {
      id: newId,
      label: newNavItem.label.trim(),
      icon: newNavItem.icon || 'Compass',
      action: newNavItem.action || newId,
      badge: newNavItem.badge.trim() || undefined,
      enabled: newNavItem.enabled !== false,
      is_custom: true,
      order: bottomNavList.length + 1,
    };

    setBottomNavList([...bottomNavList, item]);
    setIsAddingNavItem(false);
    setNewNavItem({
      id: '',
      label: '',
      icon: 'Compass',
      action: 'home',
      badge: '',
      enabled: true,
    });
    showToast(`Added custom button "${item.label}"`);
  };

  const handleApplyBottomNavPreset = (preset: 'profile_only' | 'five_tabs' | 'standard') => {
    if (preset === 'profile_only') {
      const updated = bottomNavList.map((i) => ({
        ...i,
        enabled: i.id === 'account' || i.id === 'profile',
      }));
      setBottomNavList(updated);
      showToast('Applied Preset: Only Profile Enabled (Default)');
    } else if (preset === 'five_tabs') {
      // Food, Grocery, Market, Royal Club, Profile
      const allowedIds = new Set(['home', 'grocery', 'market', 'royal_club', 'royalclub', 'account', 'profile']);
      const updated = bottomNavList.map((i) => ({
        ...i,
        enabled: allowedIds.has(i.id),
      }));
      setBottomNavList(updated);
      showToast('Applied Preset: Food + Grocery + Market + Royal Club + Profile');
    } else if (preset === 'standard') {
      const allowedIds = new Set(['home', 'categories', 'stores', 'market', 'account']);
      const updated = bottomNavList.map((i) => ({
        ...i,
        enabled: allowedIds.has(i.id),
      }));
      setBottomNavList(updated);
      showToast('Applied Preset: Standard 5-Tab Layout');
    }
  };

  const handleResetBottomNav = () => {
    setBottomNavList(defaultAdminBottomNavItems);
    showToast('Reset to default navigation layout (Profile only enabled).');
  };

  const handleSaveBottomNav = async () => {
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      bottom_nav_items: bottomNavList,
    };
    await onUpdateData({
      ...data,
      settings: updatedSettings,
    });
    setSaving(false);
    showToast('Footer navigation configuration saved successfully!');
  };

  // ---------------- PROFILE SETTINGS HANDLERS ----------------
  const handleSaveProfileSettings = async () => {
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      profile_settings: profileSettings,
    };
    await onUpdateData({
      ...data,
      settings: updatedSettings,
    });
    setSaving(false);
    showToast('Profile view configuration saved successfully!');
  };

  const handleAddNewProfileMenuItem = () => {
    if (!newProfileMenu.title.trim()) return showToast('Menu title is required', 'error');
    const newId = newProfileMenu.id.trim() || 'menu-' + Date.now();

    const newItem: ProfileCustomMenuItem = {
      id: newId,
      title: newProfileMenu.title.trim(),
      subtitle: newProfileMenu.subtitle.trim() || undefined,
      icon: newProfileMenu.icon || 'Gift',
      action: newProfileMenu.action || 'vouchers',
      badge: newProfileMenu.badge.trim() || undefined,
      enabled: newProfileMenu.enabled !== false,
      order: (profileSettings.custom_menu_items?.length || 0) + 1,
    };

    const updatedList = [...(profileSettings.custom_menu_items || []), newItem];
    setProfileSettings({
      ...profileSettings,
      custom_menu_items: updatedList,
    });
    setIsAddingProfileMenu(false);
    setNewProfileMenu({
      id: '',
      title: '',
      subtitle: '',
      icon: 'Gift',
      action: 'vouchers',
      badge: '',
      enabled: true,
    });
    showToast(`Added custom profile menu item "${newItem.title}"`);
  };

  const handleDeleteProfileMenuItem = (id: string) => {
    const updatedList = (profileSettings.custom_menu_items || []).filter((i) => i.id !== id);
    setProfileSettings({
      ...profileSettings,
      custom_menu_items: updatedList,
    });
    showToast('Removed custom profile menu item');
  };

  const handleToggleProfileMenuItem = (id: string) => {
    const updatedList = (profileSettings.custom_menu_items || []).map((i) =>
      i.id === id ? { ...i, enabled: !i.enabled } : i
    );
    setProfileSettings({
      ...profileSettings,
      custom_menu_items: updatedList,
    });
  };

  // ---------------- ROYAL CLUB SETTINGS HANDLERS ----------------
  const handleSaveRoyalClubSettings = async () => {
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      royal_club_settings: royalClubSettings,
    };
    await onUpdateData({
      ...data,
      settings: updatedSettings,
    });
    setSaving(false);
    showToast('Royal Club VIP configuration saved successfully!');
  };

  const handleAddRoyalClubPerk = () => {
    if (!newPerkInput.trim()) return showToast('Perk description is required', 'error');
    const updatedPerks = [...(royalClubSettings.perks || []), newPerkInput.trim()];
    setRoyalClubSettings({
      ...royalClubSettings,
      perks: updatedPerks,
    });
    setNewPerkInput('');
    showToast('VIP Perk added');
  };

  const handleDeleteRoyalClubPerk = (index: number) => {
    const updatedPerks = (royalClubSettings.perks || []).filter((_, idx) => idx !== index);
    setRoyalClubSettings({
      ...royalClubSettings,
      perks: updatedPerks,
    });
    showToast('VIP Perk removed');
  };

  // ---------------- MODULES MANAGEMENT ----------------
  const handleSaveModule = async () => {
    if (!editingModule?.name?.trim()) return showToast('Module name is required', 'error');

    let updatedModules = [...data.modules];
    if (isNewModule) {
      const newMod: Module = {
        id: 'mod-' + Date.now(),
        name: editingModule.name.trim(),
        description: editingModule.description || '',
        time: editingModule.time || '20-30 min',
        icon: editingModule.icon || '📦',
        image: editingModule.image || '',
        bgColor: editingModule.bgColor || 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
        size: (editingModule.size as ModuleSize) || 'medium',
        order: updatedModules.length + 1,
        badge: editingModule.badge || '',
        enabled: editingModule.enabled !== false,
      };
      updatedModules.push(newMod);
    } else {
      updatedModules = updatedModules.map((m) =>
        m.id === editingModule.id ? ({ ...m, ...editingModule, enabled: editingModule.enabled !== false } as Module) : m
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, modules: updatedModules });
    setSaving(false);
    setEditingModule(null);
    showToast('Module saved successfully!');
  };

  const handleToggleModuleEnabled = async (id: string) => {
    const updated = data.modules.map((m) =>
      m.id === id ? { ...m, enabled: m.enabled === false } : m
    );
    setSaving(true);
    await onUpdateData({ ...data, modules: updated });
    setSaving(false);
    const target = updated.find((m) => m.id === id);
    showToast(`Module "${target?.name}" ${target?.enabled !== false ? 'Enabled' : 'Disabled'}`);
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm('Are you sure you want to delete this module? Categories associated with this module may lose their parent link.')) {
      const updated = data.modules.filter((m) => m.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, modules: updated });
      setSaving(false);
      showToast('Module deleted');
    }
  };

  // ---------------- CATEGORIES MANAGEMENT ----------------
  const handleSaveCategory = async () => {
    if (!editingCategory?.name?.trim()) return showToast('Category name is required', 'error');
    if (!editingCategory?.moduleId) return showToast('Please select a module for this category', 'error');

    let updatedCategories = [...data.categories];
    if (isNewCategory) {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: editingCategory.name.trim(),
        moduleId: editingCategory.moduleId,
        icon: editingCategory.icon || '🏷️',
        image: editingCategory.image || '',
        enabled: editingCategory.enabled !== false,
      };
      updatedCategories.push(newCat);
    } else {
      updatedCategories = updatedCategories.map((c) =>
        c.id === editingCategory.id ? ({ ...c, ...editingCategory, enabled: editingCategory.enabled !== false } as Category) : c
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, categories: updatedCategories });
    setSaving(false);
    setEditingCategory(null);
    showToast('Category saved successfully!');
  };

  const handleToggleCategoryEnabled = async (id: string) => {
    const updated = data.categories.map((c) =>
      c.id === id ? { ...c, enabled: c.enabled === false } : c
    );
    setSaving(true);
    await onUpdateData({ ...data, categories: updated });
    setSaving(false);
    const target = updated.find((c) => c.id === id);
    showToast(`Category "${target?.name}" ${target?.enabled !== false ? 'Enabled' : 'Disabled'}`);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updated = data.categories.filter((c) => c.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, categories: updated });
      setSaving(false);
      showToast('Category deleted');
    }
  };

  // ---------------- PRODUCTS MANAGEMENT ----------------
  const handleSaveProduct = async () => {
    if (!editingProduct?.name?.trim()) return showToast('Product name is required', 'error');
    if (!editingProduct?.price || Number(editingProduct.price) <= 0)
      return showToast('Valid price is required', 'error');

    const isEnabled = editingProduct.enabled !== false;

    let updatedProducts = [...data.products];
    if (isNewProduct) {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: editingProduct.name.trim(),
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        categoryId: editingProduct.categoryId || (data.categories[0]?.id ?? ''),
        moduleId: editingProduct.moduleId || (data.modules[0]?.id ?? ''),
        rating: editingProduct.rating ? Number(editingProduct.rating) : 4.8,
        deliveryTime: editingProduct.deliveryTime || '20 min',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        description: editingProduct.description || '',
        variants: editingProduct.variants || [],
        available: isEnabled,
        enabled: isEnabled,
        stock: editingProduct.stock !== undefined ? Number(editingProduct.stock) : 10,
        stock_alert_threshold:
          editingProduct.stock_alert_threshold !== undefined
            ? Number(editingProduct.stock_alert_threshold)
            : 5,
      };
      updatedProducts.push(newProd);
    } else {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id
          ? ({
              ...p,
              ...editingProduct,
              available: isEnabled,
              enabled: isEnabled,
              stock:
                editingProduct.stock !== undefined
                  ? Number(editingProduct.stock)
                  : (p.stock ?? 10),
              stock_alert_threshold:
                editingProduct.stock_alert_threshold !== undefined
                  ? Number(editingProduct.stock_alert_threshold)
                  : (p.stock_alert_threshold ?? 5),
            } as Product)
          : p
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, products: updatedProducts });
    setSaving(false);
    setEditingProduct(null);
    showToast('Product saved successfully!');
  };

  const handleToggleProductEnabled = async (id: string) => {
    const updated = data.products.map((p) => {
      if (p.id === id) {
        const nextState = p.enabled === false;
        return { ...p, enabled: nextState, available: nextState };
      }
      return p;
    });
    setSaving(true);
    await onUpdateData({ ...data, products: updated });
    setSaving(false);
    const target = updated.find((p) => p.id === id);
    showToast(`Product "${target?.name}" ${target?.enabled !== false ? 'Enabled' : 'Disabled'}`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = data.products.filter((p) => p.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, products: updated });
      setSaving(false);
      showToast('Product deleted');
    }
  };

  // ---------------- DELIVERY SLOTS & EXPRESS FEES ----------------
  const handleSaveSlot = async () => {
    if (!editingSlot?.time?.trim()) return showToast('Time is required for delivery slot', 'error');

    let updatedSlots = [...deliverySlots];
    if (isNewSlot) {
      const newSlot: DeliverySlot = {
        id: 'slot-' + Date.now(),
        time: editingSlot.time.trim(),
        label: editingSlot.label?.trim() || 'Scheduled Slot',
        fee: Number(editingSlot.fee || 0),
        isFree: Number(editingSlot.fee || 0) === 0,
        isActive: editingSlot.isActive !== false,
      };
      updatedSlots.push(newSlot);
    } else {
      updatedSlots = updatedSlots.map((s) =>
        s.id === editingSlot.id
          ? ({
              ...s,
              ...editingSlot,
              fee: Number(editingSlot.fee || 0),
              isFree: Number(editingSlot.fee || 0) === 0,
            } as DeliverySlot)
          : s
      );
    }

    setDeliverySlots(updatedSlots);
    const updatedSettings = {
      ...data.settings,
      delivery_slots: updatedSlots,
      express_delivery_fee: expressFeeInput,
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    setEditingSlot(null);
    showToast('Delivery slot saved successfully!');
  };

  const handleDeleteSlot = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery slot?')) {
      const updated = deliverySlots.filter((s) => s.id !== id);
      setDeliverySlots(updated);
      const updatedSettings = {
        ...data.settings,
        delivery_slots: updated,
        express_delivery_fee: expressFeeInput,
      };
      setSaving(true);
      await onUpdateData({ ...data, settings: updatedSettings });
      setSaving(false);
      showToast('Delivery slot deleted');
    }
  };

  const handleToggleSlotActive = async (id: string) => {
    const updated = deliverySlots.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setDeliverySlots(updated);
    const updatedSettings = {
      ...data.settings,
      delivery_slots: updated,
      express_delivery_fee: expressFeeInput,
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Slot status updated!');
  };

  const handleSaveExpressFee = async () => {
    const updatedSettings = {
      ...data.settings,
      delivery_slots: deliverySlots,
      express_delivery_fee: Number(expressFeeInput),
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Express Delivery Fee updated!');
  };

  // ---------------- PWA APP SETTINGS HANDLER ----------------
  const handleSavePwaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      pwa_enabled: pwaEnabled,
      pwa_name: pwaName,
      pwa_short_name: pwaShortName,
      pwa_description: pwaDescription,
      pwa_icon: pwaIcon,
      pwa_theme_color: pwaThemeColor,
      pwa_bg_color: pwaBgColor,
      pwa_display_mode: pwaDisplayMode,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('PWA Mobile App settings saved successfully!');
  };

  // ---------------- ORDERS & AUTOMATED WHATSAPP NOTIFICATIONS ----------------
  const buildWhatsAppMessage = (
    order: AppData['orders'][0],
    status: OrderStatus,
    sName: string,
    customNote?: string
  ) => {
    let cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Add India country code if 10 digits
    }

    const statusEmojis: Record<OrderStatus, string> = {
      'Order Placed': '📦',
      'Preparing': '🍳',
      'Packing': '📦',
      'Out for Delivery': '🛵',
      'Delivered': '🎉',
      'Cancelled': '❌',
    };

    const statusTexts: Record<OrderStatus, string> = {
      'Order Placed': 'Your order has been confirmed and received.',
      'Preparing': 'Your order is currently being prepared with care.',
      'Packing': 'Your order is being packed and made ready for dispatch.',
      'Out for Delivery': 'Your order is out for delivery and on its way to your address!',
      'Delivered': 'Your order has been successfully delivered. Thank you for shopping with us!',
      'Cancelled': 'Your order has been cancelled. Please contact customer support if you have questions.',
    };

    const emoji = statusEmojis[status] || '📋';
    const statusDesc = statusTexts[status] || `Status updated to ${status}`;

    let message = `*${sName} - Order Status Update* ${emoji}\n\n` +
      `Hello! Your order *#${order.order_id}* status is now: *${status}*\n\n` +
      `ℹ️ *Details:* ${statusDesc}\n` +
      `💰 *Total Amount:* ₹${order.total_amount}\n`;

    if (order.delivery_slot_time) {
      message += `⏰ *Delivery Slot:* ${order.delivery_slot_time}\n`;
    }

    if (order.items && order.items.length > 0) {
      message += `\n📦 *Order Items:*\n` + order.items.map((i) => `• ${i.qty}x ${i.name}`).join('\n') + `\n`;
    }

    if (customNote && customNote.trim()) {
      message += `\n💬 *Note from Store:* ${customNote.trim()}\n`;
    }

    message += `\nThank you for choosing *${sName}*! 🙏`;

    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : '';
    return { message, whatsappUrl, cleanPhone };
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = data.orders.find((o) => o.order_id === orderId);
    const updatedOrders = data.orders.map((o) => (o.order_id === orderId ? { ...o, status } : o));
    setSaving(true);
    await onUpdateData({ ...data, orders: updatedOrders });
    setSaving(false);

    if (targetOrder) {
      const updatedOrder = { ...targetOrder, status };
      showToast(`Order #${orderId} status updated to "${status}"!`);

      // Construct pre-filled WhatsApp link
      const { whatsappUrl } = buildWhatsAppMessage(
        updatedOrder,
        status,
        data.settings?.store_name || storeName || 'Hyperlocal Store'
      );

      // Trigger automatic WhatsApp open if feature enabled
      if (autoOpenWhatsapp && whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }

      // Open notification modal for review or manual resend/custom note
      setWhatsappModalOrder({ order: updatedOrder, status });
      setCustomWhatsappNote('');
    }
  };

  // ---------------- WEBHOOK & N8N MANAGEMENT ----------------
  const handleSaveWebhook = async () => {
    setSaving(true);
    await onUpdateData({
      ...data,
      settings: {
        ...data.settings,
        n8n_webhook_enabled: n8nWebhookEnabled,
        n8n_webhook_url: webhookUrl.trim(),
        n8n_host: n8nHost.trim(),
        n8n_port: n8nPort ? String(n8nPort).trim() : '5678',
        n8n_protocol: n8nProtocol,
        n8n_webhook_secret: n8nWebhookSecret.trim(),
      },
    });
    setSaving(false);
    showToast('n8n Webhook configuration saved successfully!');
  };

  const handleTestN8nConnection = async () => {
    setN8nTestStatus({ type: 'testing', message: 'Testing connection to n8n instance...' });
    try {
      const res = await fetch('/api/test-n8n-connection', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          host: n8nHost.trim(),
          port: n8nPort ? String(n8nPort).trim() : '5678',
          protocol: n8nProtocol,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setN8nTestStatus({ type: 'success', message: result.message });
        showToast('n8n server connection verified!');
      } else {
        setN8nTestStatus({ type: 'failed', message: result.message });
        showToast(result.message || 'Connection failed', 'error');
      }
    } catch (err: any) {
      const msg = `FAILED: ${err?.message || 'Network connection error'}`;
      setN8nTestStatus({ type: 'failed', message: msg });
      showToast(msg, 'error');
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      showToast('Please specify a valid n8n Webhook URL first', 'error');
      return;
    }
    setWebhookTestStatus({ type: 'testing', message: 'Dispatching sample order payload to n8n Webhook...' });
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          webhook_url: webhookUrl.trim(),
          webhook_secret: n8nWebhookSecret.trim(),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setWebhookTestStatus({ type: 'success', message: result.message });
        showToast('Webhook payload delivered and acknowledged by n8n!');
      } else {
        setWebhookTestStatus({ type: 'failed', message: result.message || 'Webhook trigger failed' });
        showToast(result.message || 'Webhook trigger failed', 'error');
      }
    } catch (err: any) {
      const msg = `FAILED: ${err?.message || 'Network error triggering webhook'}`;
      setWebhookTestStatus({ type: 'failed', message: msg });
      showToast(msg, 'error');
    }
  };

  const handleRetryOrderWebhook = async (orderId: string) => {
    try {
      showToast('Retrying n8n webhook dispatch...');
      const res = await fetch(`/api/orders/${orderId}/retry-webhook`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        showToast('Webhook successfully dispatched to n8n!');
      } else {
        showToast(result.message || result.error || 'Retry failed', 'error');
      }
    } catch (err: any) {
      showToast('Retry error: ' + (err?.message || 'Network error'), 'error');
    }
  };

  // ---------------- STORE SETTINGS & ADMIN BRANDING ----------------
  const handleSaveSettings = async () => {
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      store_name: storeName.trim(),
      admin_logo: adminLogo,
      admin_username: adminUsername.trim(),
      admin_password: adminPassword,
      admin_login_banner: adminLoginBanner,
      admin_banner_title: adminBannerTitle.trim(),
      admin_banner_subtitle: adminBannerSubtitle.trim(),
      admin_pin: adminPassword || newPinInput,
    };
    if (adminPassword) {
      localStorage.setItem('ezmart_admin_pin', adminPassword);
    }
    await onUpdateData({
      ...data,
      settings: updatedSettings,
    });
    setSaving(false);
    showToast('Admin Credentials, Branding & Settings saved successfully!');
  };

  // ---------------- ZIP BACKUP EXPORT & RESTORE ----------------
  const handleDownloadZipBackup = async () => {
    try {
      setSaving(true);
      showToast('Generating full ZIP backup archive with images...', 'success');
      const zip = new JSZip();

      // 1. Raw database JSON file
      zip.file('database.json', JSON.stringify(data, null, 2));

      // 2. Folder for standalone extracted images
      const imgFolder = zip.folder('images');
      let imgCounter = 1;

      const extractImageAndGetRelPath = (base64OrUrl: string | undefined, prefix: string): string => {
        if (!base64OrUrl) return '';
        if (base64OrUrl.startsWith('data:image/')) {
          const parts = base64OrUrl.split(',');
          if (parts.length === 2) {
            const match = parts[0].match(/data:image\/(\w+);base64/);
            const ext = match ? match[1] : 'png';
            const filename = `${prefix}_${imgCounter++}.${ext}`;
            imgFolder?.file(filename, parts[1], { base64: true });
            return `images/${filename}`;
          }
        }
        return base64OrUrl;
      };

      // Create manifest copy with extracted relative image paths
      const dataManifest = JSON.parse(JSON.stringify(data));

      if (dataManifest.settings?.admin_logo) {
        dataManifest.settings.admin_logo = extractImageAndGetRelPath(
          dataManifest.settings.admin_logo,
          'admin_logo'
        );
      }

      if (dataManifest.products) {
        dataManifest.products = dataManifest.products.map((p: any) => ({
          ...p,
          image: extractImageAndGetRelPath(p.image, `prod_${p.id}`),
        }));
      }

      if (dataManifest.categories) {
        dataManifest.categories = dataManifest.categories.map((c: any) => ({
          ...c,
          image: extractImageAndGetRelPath(c.image, `cat_${c.id}`),
        }));
      }

      if (dataManifest.modules) {
        dataManifest.modules = dataManifest.modules.map((m: any) => ({
          ...m,
          image: extractImageAndGetRelPath(m.image, `mod_${m.id}`),
        }));
      }

      zip.file('manifest.json', JSON.stringify(dataManifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperlocal_full_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setSaving(false);
      showToast('Full ZIP Backup downloaded successfully!');
    } catch (err: any) {
      setSaving(false);
      showToast('Failed to create ZIP backup: ' + err.message, 'error');
    }
  };

  const handleRestoreZipOrJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.zip')) {
      try {
        setSaving(true);
        const zip = await JSZip.loadAsync(file);
        const dbFile = zip.file('database.json') || zip.file('manifest.json');
        if (!dbFile) {
          setSaving(false);
          return showToast('Invalid ZIP: database.json not found inside zip', 'error');
        }
        const jsonStr = await dbFile.async('string');
        const ok = await onRestoreBackup(jsonStr);
        setSaving(false);
        if (ok) showToast('ZIP Backup database successfully restored!');
        else showToast('Failed to restore database from ZIP.', 'error');
      } catch (err: any) {
        setSaving(false);
        showToast('Error reading ZIP file: ' + err.message, 'error');
      }
    } else {
      // Standard JSON file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const ok = await onRestoreBackup(content);
          if (ok) showToast('Database successfully restored!');
          else showToast('Failed to restore backup.', 'error');
        } catch {
          showToast('Invalid backup file format.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // SPLIT-SCREEN COMMERCIAL ADMIN LOGIN PAGE
  if (!isUnlocked) {
    const bannerImg =
      data.settings?.admin_login_banner ||
      adminLoginBanner ||
      'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=1200&auto=format&fit=crop&q=80';
    const bannerTitle =
      data.settings?.admin_banner_title || adminBannerTitle || 'Hyperlocal Merchant Portal';
    const bannerSubtitle =
      data.settings?.admin_banner_subtitle ||
      adminBannerSubtitle ||
      'Manage products, orders, inventory, delivery slots, and WhatsApp notifications seamlessly.';
    const logoImg = data.settings?.admin_logo || adminLogo;
    const storeTitle = data.settings?.store_name || storeName || 'Hyperlocal Merchant Portal';

    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto flex items-center justify-center font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT SIDE: Branding Banner Panel (Desktop & Tablet Split Screen) */}
          <div className="lg:col-span-7 xl:col-span-8 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-slate-900 border-r border-slate-800/80">
            {/* Background image with high quality banner */}
            <div className="absolute inset-0 z-0">
              <img
                src={bannerImg}
                alt="Admin Portal Banner"
                className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-emerald-950/40" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)]" />
            </div>

            {/* Top Branding Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                    {logoImg ? (
                      <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Store className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="font-black text-lg text-white tracking-tight">{storeTitle}</h1>
                  <p className="text-xs font-semibold text-emerald-400/90 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Multi-Vendor Admin Suite
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Protected Admin Portal</span>
              </div>
            </div>

            {/* Middle Decorative Feature Graphic / Banner Text */}
            <div className="relative z-10 max-w-xl my-auto py-12 text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Merchant Backoffice Platform
              </div>

              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                {bannerTitle}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium">
                {bannerSubtitle}
              </p>

              {/* Key Features Pill Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Syncing</h4>
                    <p className="text-[10px] text-slate-400">Live order status dispatch</p>
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">WhatsApp Webhooks</h4>
                    <p className="text-[10px] text-slate-400">Automated notification engine</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="relative z-10 text-[11px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-800/80 pt-6">
              <span>© {new Date().getFullYear()} {storeTitle}. All Rights Reserved.</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted Admin Portal
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Clean Modern Login Form Panel */}
          <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center p-6 sm:p-12 bg-slate-950/90 backdrop-blur-xl border-l border-slate-800/80 text-start min-h-screen">
            <div className="w-full max-w-sm space-y-8">
              {/* Header section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    {logoImg ? (
                      <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1 rounded-xl" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Return to Store
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Admin Sign In</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Enter your administrative credentials to access your store control dashboard.
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleAdminLogin} className="space-y-5">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-300">
                    Admin Username / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => {
                        setInputUsername(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter admin username or email"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-300">
                      Admin Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={inputPassword}
                      onChange={(e) => {
                        setInputPassword(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter account password"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
                  </span>
                </div>

                {/* Error Banner if login fails */}
                {loginError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-bold text-rose-400 flex items-center gap-2.5 animate-in fade-in zoom-in-95">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Dashboard</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Private Portal Footer Note */}
              <div className="pt-6 border-t border-slate-900 text-center">
                <p className="text-[11px] text-slate-500 font-medium">
                  Protected System • Unauthorized access attempts are monitored and logged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live numbers
  const totalOrdersCount = data.orders.length;
  const totalRevenue = data.orders.reduce((sum, o) => sum + o.total_amount, 0);

  // Low stock products list calculation
  const lowStockProductsList = data.products.filter((p) => {
    const currentStock = p.stock ?? 10;
    const threshold = p.stock_alert_threshold ?? 5;
    return currentStock <= threshold;
  });

  // Filter products for Products screen
  const filteredProductsList = data.products.filter((p) => {
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedModuleFilter !== 'all' && p.moduleId !== selectedModuleFilter) {
      return false;
    }
    if (stockFilter === 'low_stock') {
      const currentStock = p.stock ?? 10;
      const threshold = p.stock_alert_threshold ?? 5;
      if (currentStock > threshold) return false;
    } else if (stockFilter === 'enabled') {
      if (p.enabled === false || p.available === false) return false;
    } else if (stockFilter === 'disabled') {
      if (p.enabled !== false && p.available !== false) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-[#f4f2ee] dark:bg-slate-950 z-50 overflow-y-auto font-sans text-slate-800 dark:text-slate-100 selection:bg-orange-500 selection:text-white">
      <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto bg-[#f8f7f4] dark:bg-slate-900">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Custom Admin Brand Logo / Header */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2.5">
                {data.settings?.admin_logo ? (
                  <img
                    src={data.settings.admin_logo}
                    alt="Admin Logo"
                    className="w-9 h-9 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white p-2 flex items-center justify-center shadow-md shadow-orange-500/20">
                    <Store className="w-5 h-5" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight block truncate">
                    {data.settings?.store_name || 'Admin Suite'}
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Control Dashboard</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Menu Options */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'developer-api', label: 'Developer API & Gateway', icon: Code2, badge: 'REST v1' },
                { id: 'delivery-fleet', label: 'Delivery Rider Fleet', icon: Truck, badge: `${(data.delivery_riders || []).filter(r => r.status === 'online').length} Online` },
                { id: 'subscriptions', label: 'Merchant SaaS Tiers', icon: Crown, badge: (data.subscription_plans || []).length },
                { id: 'advertisements', label: 'Sponsored Ads', icon: Megaphone, badge: (data.advertisements || []).length },
                { id: 'reviews', label: 'Customer Reviews', icon: Star, badge: (data.reviews || []).filter(r => r.status === 'pending').length ? `${(data.reviews || []).filter(r => r.status === 'pending').length} Pending` : (data.reviews || []).length },
                { id: 'footer-panel', label: 'Footer Panel', icon: Compass, badge: `${bottomNavList.filter(i => i.enabled !== false).length} Active` },
                { id: 'profile-settings', label: 'Profile Options', icon: UserCheck, badge: 'Profile' },
                { id: 'royal-club', label: 'Royal Club VIP', icon: Award, badge: royalClubSettings.enabled !== false ? 'VIP Active' : 'Off' },
                { id: 'market', label: 'Market E-Commerce', icon: ShoppingBag, badge: 'New Market' },
                { id: 'template-engine', label: 'Template Engine', icon: Sparkles, badge: 'Platform Layout' },
                { id: 'stores', label: 'Merchant Stores', icon: Store, badge: data.stores?.length || 0 },
                { id: 'orders', label: 'Orders', icon: PackageCheck, badge: totalOrdersCount },
                { id: 'products', label: 'Products', icon: ShoppingBag, badge: data.products.length },
                { id: 'categories', label: 'Categories', icon: Grid, badge: data.categories.length },
                { id: 'modules', label: 'Modules', icon: Layers, badge: data.modules.length },
                { id: 'delivery', label: 'Delivery Slots', icon: Clock, badge: deliverySlots.length },
                { id: 'pwa', label: 'PWA Mobile App', icon: Smartphone, badge: 'PWA' },
                { id: 'whatsapp', label: 'Super Admin WhatsApp', icon: MessageCircle, badge: 'WhatsApp Control' },
                { id: 'payments', label: 'Payment Options', icon: CreditCard, badge: 'COD / UPI' },
                { id: 'roles', label: 'Roles & Staff Accounts', icon: Users, badge: usersList.length },
                { id: 'integrations', label: 'n8n Webhook', icon: Link2 },
                { id: 'reports', label: 'Backup & Restore', icon: FileArchive },
                { id: 'settings', label: 'Admin Branding', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FF7A00] text-white shadow-lg shadow-orange-500/25 font-black'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== '' && item.badge !== 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Info & Exit */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
            >
              Exit Admin Suite
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Toast Notification Alert */}
          {toastMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 ${
                toastMsg.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* Real-time New Order Banner Alert */}
          {newOrderAlert && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-4 shadow-xl border border-emerald-400 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl animate-bounce">
                  <PackageCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">🔔 Real-time New Order Received!</h4>
                  <p className="text-emerald-100 text-xs font-medium">{newOrderAlert}</p>
                </div>
              </div>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TOP BAR / HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'developer-api' && 'Developer Platform & Unified API Gateway (/api/v1/*)'}
                {activeTab === 'delivery-fleet' && 'Delivery Rider Fleet & Live Dispatch'}
                {activeTab === 'subscriptions' && 'Merchant SaaS Tiers & Store Subscriptions'}
                {activeTab === 'advertisements' && 'Sponsored Ad Campaigns & Banners'}
                {activeTab === 'reviews' && 'Customer Reviews & Feedback Moderation'}
                {(activeTab === 'footer-panel' || activeTab === 'navigation') && 'Footer Panel & Bottom Navigation Control'}
                {activeTab === 'profile-settings' && 'Customer Profile & Account View Settings'}
                {activeTab === 'royal-club' && 'Royal Club VIP Membership Management'}
                {activeTab === 'market' && 'Market E-Commerce Central Management'}
                {activeTab === 'template-engine' && 'Template Engine & Layouts'}
                {activeTab === 'stores' && 'Merchant Stores Management'}
                {activeTab === 'orders' && 'Orders Management'}
                {activeTab === 'products' && 'Product Inventory & Direct Uploads'}
                {activeTab === 'categories' && 'Module-Wise Categories'}
                {activeTab === 'modules' && 'Modules Configuration'}
                {activeTab === 'delivery' && 'Delivery Slots & Express Delivery Settings'}
                {activeTab === 'pwa' && 'PWA Mobile App Customization'}
                {activeTab === 'whatsapp' && 'Super Admin WhatsApp & Notifications'}
                {activeTab === 'payments' && 'Payment Gateway & COD Settings'}
                {activeTab === 'roles' && 'Staff Accounts & Role Permissions'}
                {activeTab === 'integrations' && 'n8n Webhooks Integration'}
                {activeTab === 'reports' && 'Full ZIP & Database Backup'}
                {activeTab === 'settings' && 'Admin Branding & Settings'}
              </h1>
            </div>

            {/* Top Search & Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* POS Cashier Button */}
              <button
                onClick={() => setIsPosOpen(true)}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0"
                title="Launch Cashier POS Terminal"
              >
                <Store className="w-4 h-4" />
                <span>POS Cashier</span>
              </button>

              {/* Theme Mode Toggle Button */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="hidden md:inline">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span className="hidden md:inline">Dark Mode</span>
                    </>
                  )}
                </button>
              )}

              {/* Log Out Button */}
              <button
                onClick={handleAdminLogout}
                className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0"
                title="Log Out Admin Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Log Out</span>
              </button>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search products, orders..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 shadow-xs"
                />
              </div>

              {/* Quick Save Status */}
              {saving && (
                <div className="bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DEVELOPER API PLATFORM TAB ---------------- */}
          {activeTab === 'developer-api' && (
            <DeveloperApiManagement
              apiKeys={data.api_keys || []}
              apiClients={data.api_clients || []}
              webhookSubscriptions={data.webhook_subscriptions || []}
              webhookLogs={data.webhook_logs || []}
              onUpdateData={async (updater) => {
                const next = updater(data);
                await onUpdateData(next);
              }}
              theme={theme}
            />
          )}

          {/* ---------------- DELIVERY FLEET TAB ---------------- */}
          {activeTab === 'delivery-fleet' && (
            <DeliveryFleetManagement
              riders={data.delivery_riders || []}
              onUpdateData={async (updater) => {
                const next = updater(data);
                await onUpdateData(next);
              }}
              theme={theme}
            />
          )}

          {/* ---------------- MERCHANT SUBSCRIPTIONS TAB ---------------- */}
          {activeTab === 'subscriptions' && (
            <SubscriptionManagement
              plans={data.subscription_plans || []}
              storeSubscriptions={data.store_subscriptions || []}
              stores={data.stores || []}
              onUpdateData={async (updater) => {
                const next = updater(data);
                await onUpdateData(next);
              }}
              theme={theme}
            />
          )}

          {/* ---------------- ADVERTISEMENTS & SPONSORED BANNERS TAB ---------------- */}
          {activeTab === 'advertisements' && (
            <AdvertisementsManagement
              advertisements={data.advertisements || []}
              onUpdateData={async (updater) => {
                const next = updater(data);
                await onUpdateData(next);
              }}
              theme={theme}
            />
          )}

          {/* ---------------- CUSTOMER REVIEWS TAB ---------------- */}
          {activeTab === 'reviews' && (
            <ReviewsModerationTab
              reviews={data.reviews || []}
              onUpdateData={async (updater) => {
                const next = updater(data);
                await onUpdateData(next);
              }}
              theme={theme}
            />
          )}

          {/* ---------------- MARKET E-COMMERCE MANAGEMENT TAB ---------------- */}
          {activeTab === 'market' && (
            <AdminMarketManagement
              data={data}
              onUpdateData={onUpdateData}
              showToast={showToast}
              handleImageFileRead={handleImageFileRead}
            />
          )}

          {/* ---------------- PLATFORM TEMPLATE ENGINE TAB ---------------- */}
          {activeTab === 'template-engine' && (
            <TemplateEngineAdmin appData={data} onUpdateAppData={onUpdateData} />
          )}

          {/* ---------------- STORES MANAGEMENT TAB ---------------- */}
          {activeTab === 'stores' && (
            <StoresManagementTab
              stores={data.stores || []}
              modules={data.modules || []}
              auditLogs={data.audit_logs || []}
              onOpenStoreCreationModal={() => setIsStoreCreationOpen(true)}
              onUpdateStoreStatus={handleUpdateStoreStatus}
              onUpdateStoreModules={handleUpdateStoreModules}
            />
          )}

          {/* ---------------- SCREEN 1: DASHBOARD OVERVIEW ---------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FFF4E8] dark:bg-amber-950/30 border border-orange-200/60 dark:border-orange-800/40 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Sales</span>
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                    ₹{(983410 + totalRevenue).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-md text-[11px]">+3.34%</span>
                    <span className="text-slate-400 font-medium text-[11px]">vs last week</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Orders</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                    {(58375 + totalOrdersCount).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-md text-[11px]">Live Sync</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Active Modules</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{data.modules.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {data.categories.length} Categories configured
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS ACTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-orange-400 dark:hover:border-orange-500 transition-all flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Add / Upload Product</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Direct image upload & price management</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-orange-400 dark:hover:border-orange-500 transition-all flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Grid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Module Categories</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Assign categories & logos per module</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-orange-400 dark:hover:border-orange-500 transition-all flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Export ZIP Backup</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Full backup with embedded images</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 2: ORDERS MANAGEMENT ---------------- */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Live Customer Orders</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Manage order statuses & trigger automated WhatsApp updates</p>
                </div>

                {/* Auto-launch WhatsApp Toggle */}
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-2xl">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <label htmlFor="auto-wa-toggle" className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 cursor-pointer select-none">
                    Auto-launch WhatsApp on status update
                  </label>
                  <input
                    id="auto-wa-toggle"
                    type="checkbox"
                    checked={autoOpenWhatsapp}
                    onChange={(e) => setAutoOpenWhatsapp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {data.orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.orders.map((order) => (
                    <div
                      key={order.order_id}
                      className="border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                        <div>
                          <div className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                            <span>{order.order_id}</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full font-bold">
                              {new Date(order.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Customer Phone: +{order.customer_phone}
                          </div>
                          {order.delivery_slot_time && (
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl w-fit mt-1.5 border border-emerald-200 dark:border-emerald-800">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>ഡെലിവറി സമയം: {order.delivery_slot_time}</span>
                              {order.delivery_fee ? (
                                <span className="text-orange-700 dark:text-orange-400 ml-1">(Fee: ₹{order.delivery_fee})</span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 ml-1 font-extrabold">(FREE)</span>
                              )}
                            </div>
                          )}

                          {/* Payment Method Badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              order.payment_method === 'upi_online'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            }`}>
                              <CreditCard className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{order.payment_method === 'upi_online' ? 'Online Payment (UPI/GPay)' : 'Cash on Delivery (COD)'}</span>
                            </span>

                            {order.payment_transaction_id && (
                              <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                Ref/UTR: {order.payment_transaction_id}
                              </span>
                            )}

                            {order.webhook_status && (
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                                order.webhook_status === 'success'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                  : order.webhook_status === 'failed'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}>
                                <Link2 className="w-2.5 h-2.5" />
                                <span>n8n: {order.webhook_status}</span>
                                {order.webhook_status === 'failed' && (
                                  <button
                                    onClick={() => handleRetryOrderWebhook(order.order_id)}
                                    className="ml-1 underline text-rose-800 dark:text-rose-300 font-extrabold hover:text-rose-950 cursor-pointer"
                                    title="Retry sending webhook to n8n"
                                  >
                                    Retry
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Select & Quick WhatsApp Trigger Button */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.order_id, e.target.value as OrderStatus)
                            }
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                          >
                            <option value="Order Placed" className="dark:bg-slate-800">Order Placed</option>
                            <option value="Preparing" className="dark:bg-slate-800">Preparing</option>
                            <option value="Out for Delivery" className="dark:bg-slate-800">Out for Delivery</option>
                            <option value="Delivered" className="dark:bg-slate-800">Delivered</option>
                            <option value="Cancelled" className="dark:bg-slate-800">Cancelled</option>
                          </select>

                          <button
                            onClick={() => {
                              setWhatsappModalOrder({ order, status: order.status });
                              setCustomWhatsappNote('');
                            }}
                            title="Send WhatsApp Update to Customer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Update</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between font-semibold">
                            <span>
                              {i.qty}x {i.name}
                            </span>
                            <span>₹{i.price * i.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 dark:border-slate-800 font-black text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Grand Total:</span>
                        <span className="text-orange-600 dark:text-orange-400 text-sm">₹{order.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------- SCREEN 3: PRODUCTS MANAGEMENT ---------------- */}
          {activeTab === 'products' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Manage Store Products</h3>
                  <p className="text-slate-500 text-xs">Enable/Disable items, stock levels & image uploads</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status & Stock Quick Filters */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setStockFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        stockFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({data.products.length})
                    </button>
                    <button
                      onClick={() => setStockFilter('enabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        stockFilter === 'enabled'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enabled ({data.products.filter(p => p.enabled !== false && p.available !== false).length})</span>
                    </button>
                    <button
                      onClick={() => setStockFilter('disabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        stockFilter === 'disabled'
                          ? 'bg-amber-600 text-white shadow-xs font-black'
                          : 'text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Disabled ({data.products.filter(p => p.enabled === false || p.available === false).length})</span>
                    </button>
                    <button
                      onClick={() => setStockFilter('low_stock')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        stockFilter === 'low_stock'
                          ? 'bg-rose-600 text-white shadow-xs font-black'
                          : 'text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Low Stock ({lowStockProductsList.length})</span>
                    </button>
                  </div>

                  <select
                    value={selectedModuleFilter}
                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-2xl focus:outline-none"
                  >
                    <option value="all">All Modules</option>
                    {data.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        price: 100,
                        oldPrice: undefined,
                        rating: 4.8,
                        deliveryTime: '20 min',
                        categoryId: data.categories[0]?.id || '',
                        moduleId: data.modules[0]?.id || '',
                        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
                        description: '',
                        available: true,
                        enabled: true,
                        stock: 10,
                        stock_alert_threshold: 5,
                      });
                      setIsNewProduct(true);
                    }}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              {/* Product Edit/Create Form */}
              {editingProduct && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-orange-300 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-orange-600 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isNewProduct ? 'Create New Product' : 'Edit Product Details'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAiUpscaleProduct}
                        disabled={isAiUpscalingProduct}
                        className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-[11px] flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                        title="Upscale product title, description, and tags with Gemini AI"
                      >
                        {isAiUpscalingProduct ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" /> Upscaling...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-200" /> Upscale with AI
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. Fresh Organic Tomatoes 1kg"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        placeholder="e.g. 120"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Original Price (Strike) (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.oldPrice || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                        placeholder="e.g. 160"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category & Module *</label>
                      <select
                        value={editingProduct.categoryId || ''}
                        onChange={(e) => {
                          const cat = data.categories.find((c) => c.id === e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            categoryId: e.target.value,
                            moduleId: cat?.moduleId || editingProduct.moduleId,
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {data.categories.map((c) => {
                          const m = data.modules.find((mod) => mod.id === c.moduleId);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({m?.name || 'General'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Stock Quantity & Low Stock Alert Threshold Fields */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Current Stock Quantity (Units) *</label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.stock ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 15"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Stock Alert Threshold *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.stock_alert_threshold ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock_alert_threshold: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 5"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* Product Enable / Disable Status Switch */}
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">Enable Product in Store</span>
                        <span className="text-[11px] text-slate-400 block">Disabled items will be hidden from customer store views</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.enabled !== false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              enabled: e.target.checked,
                              available: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Short item description..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* DIRECT IMAGE UPLOAD & URL SECTION */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-orange-600" /> Product Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview Thumbnail */}
                        <div className="w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 relative group">
                          {editingProduct.image ? (
                            <img
                              src={editingProduct.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        {/* Image Source Inputs */}
                        <div className="flex-1 space-y-2.5 w-full">
                          {/* Direct File Upload Button */}
                          <div>
                            <label className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-orange-600" /> Upload Image File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingProduct({ ...editingProduct, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              Supports PNG, JPG, WebP (Max 10MB)
                            </span>
                          </div>

                          {/* Image URL Input */}
                          <div>
                            <input
                              type="text"
                              value={editingProduct.image || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              placeholder="Or paste Image URL (https://...)"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#FF7A00] text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProductsList.map((prod) => {
                  const cat = data.categories.find((c) => c.id === prod.categoryId);
                  const mod = data.modules.find((m) => m.id === prod.moduleId);

                  const currentStock = prod.stock ?? 10;
                  const threshold = prod.stock_alert_threshold ?? 5;
                  const isLowStock = currentStock <= threshold;
                  const isProdEnabled = prod.enabled !== false && prod.available !== false;

                  return (
                    <div
                      key={prod.id}
                      className={`border p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                        !isProdEnabled
                          ? 'border-amber-200 bg-amber-50/40 opacity-75 hover:opacity-100'
                          : isLowStock
                          ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/80'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <img src={prod.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 bg-white" />
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{prod.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-orange-600 font-black text-sm">₹{prod.price}</span>
                            {prod.oldPrice && (
                              <span className="line-through text-slate-400 text-[11px]">₹{prod.oldPrice}</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {cat?.name || 'Category'} • <span className="font-bold text-slate-700">{mod?.name || 'Module'}</span>
                          </div>

                          {/* Visual Badges: Stock & Status */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {isProdEnabled ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" /> Enabled
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                <EyeOff className="w-3 h-3 text-amber-600 shrink-0" /> Disabled
                              </span>
                            )}

                            {isLowStock ? (
                              <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-2xs">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                Stock: {currentStock}
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                                <Package className="w-3 h-3 text-slate-400 shrink-0" />
                                Stock: {currentStock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Reorder Up / Down */}
                        <button
                          type="button"
                          onClick={() => {
                            const idx = data.products.findIndex((p) => p.id === prod.id);
                            if (idx !== -1) handleMoveProduct(idx, 'up');
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Move Product Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = data.products.findIndex((p) => p.id === prod.id);
                            if (idx !== -1) handleMoveProduct(idx, 'down');
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Move Product Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Enable/Disable Toggle Button */}
                        <button
                          onClick={() => handleToggleProductEnabled(prod.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isProdEnabled
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={isProdEnabled ? 'Click to Disable Product' : 'Click to Enable Product'}
                        >
                          {isProdEnabled ? <Power className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsNewProduct(false);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                          title="Delete Product"
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

          {/* ---------------- SCREEN 4: CATEGORIES MANAGEMENT (MODULE-WISE) ---------------- */}
          {activeTab === 'categories' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Module-Wise Categories</h3>
                  <p className="text-slate-500 text-xs">Enable/Disable categories, logo images & module links</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Status Filters */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setCategoryFilterTab('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        categoryFilterTab === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({data.categories.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilterTab('enabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        categoryFilterTab === 'enabled'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enabled ({data.categories.filter((c) => c.enabled !== false).length})</span>
                    </button>
                    <button
                      onClick={() => setCategoryFilterTab('disabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        categoryFilterTab === 'disabled'
                          ? 'bg-amber-600 text-white shadow-xs font-black'
                          : 'text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Disabled ({data.categories.filter((c) => c.enabled === false).length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCategory({
                        name: '',
                        icon: '🏷️',
                        image: '',
                        moduleId: data.modules[0]?.id || '',
                        enabled: true,
                      });
                      setIsNewCategory(true);
                    }}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                </div>
              </div>

              {/* Category Edit/Create Form Modal */}
              {editingCategory && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-emerald-400 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-emerald-700 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Grid className="w-4 h-4" />
                      {isNewCategory ? 'Create New Category' : 'Edit Category Details'}
                    </h4>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={editingCategory.name || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="e.g. Fresh Vegetables"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Association *</label>
                      <select
                        value={editingCategory.moduleId || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, moduleId: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {data.modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category Icon / Emoji</label>
                      <input
                        type="text"
                        value={editingCategory.icon || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="e.g. 🥬 or 🍕"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Category Enable / Disable Switch */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">Enable Category in Store</span>
                        <span className="text-[11px] text-slate-400 block">Disabled categories hide associated products</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingCategory.enabled !== false}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              enabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* DIRECT CATEGORY LOGO UPLOAD & URL */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" /> Category Logo Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          {editingCategory.image ? (
                            <img src={editingCategory.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{editingCategory.icon || '🏷️'}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-emerald-600" /> Upload Category Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingCategory({ ...editingCategory, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={editingCategory.image || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                            placeholder="Or paste Logo Image URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategory}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    >
                      Save Category
                    </button>
                  </div>
                </div>
              )}

              {/* Category List grouped/displayed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.categories
                  .filter((cat) => {
                    if (categoryFilterTab === 'enabled') return cat.enabled !== false;
                    if (categoryFilterTab === 'disabled') return cat.enabled === false;
                    return true;
                  })
                  .map((cat) => {
                    const mod = data.modules.find((m) => m.id === cat.moduleId);
                    const prodCount = data.products.filter((p) => p.categoryId === cat.id).length;
                    const isCatEnabled = cat.enabled !== false;

                    return (
                      <div
                        key={cat.id}
                        className={`border p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all ${
                          !isCatEnabled
                            ? 'border-amber-200 bg-amber-50/40 opacity-75 hover:opacity-100'
                            : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{cat.icon}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{cat.name}</div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                                Module: {mod?.name || 'General'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {prodCount} items
                              </span>

                              {isCatEnabled ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Enabled
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                  <EyeOff className="w-3 h-3 text-amber-600" /> Disabled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Reorder Up / Down */}
                          <button
                            type="button"
                            onClick={() => {
                              const idx = data.categories.findIndex((c) => c.id === cat.id);
                              if (idx !== -1) handleMoveCategory(idx, 'up');
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Move Category Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = data.categories.findIndex((c) => c.id === cat.id);
                              if (idx !== -1) handleMoveCategory(idx, 'down');
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Move Category Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Enable/Disable Toggle Button */}
                          <button
                            onClick={() => handleToggleCategoryEnabled(cat.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isCatEnabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={isCatEnabled ? 'Click to Disable Category' : 'Click to Enable Category'}
                          >
                            {isCatEnabled ? <Power className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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

          {/* ---------------- SCREEN 5: MODULES MANAGEMENT ---------------- */}
          {activeTab === 'modules' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Homepage Modules Configuration</h3>
                  <p className="text-slate-500 text-xs">Enable/Disable modules, logo images & size options</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Module Status Filters */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setModuleFilterTab('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        moduleFilterTab === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({data.modules.length})
                    </button>
                    <button
                      onClick={() => setModuleFilterTab('enabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        moduleFilterTab === 'enabled'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enabled ({data.modules.filter((m) => m.enabled !== false).length})</span>
                    </button>
                    <button
                      onClick={() => setModuleFilterTab('disabled')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        moduleFilterTab === 'disabled'
                          ? 'bg-amber-600 text-white shadow-xs font-black'
                          : 'text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Disabled ({data.modules.filter((m) => m.enabled === false).length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingModule({
                        name: '',
                        description: '',
                        time: '20-30 min',
                        icon: '📦',
                        image: '',
                        bgColor: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                        size: 'medium',
                        badge: '',
                        enabled: true,
                      });
                      setIsNewModule(true);
                    }}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                </div>
              </div>

              {/* Module Edit Form Modal */}
              {editingModule && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-purple-400 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-purple-700 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      {isNewModule ? 'Create New Homepage Module' : 'Edit Module Details'}
                    </h4>
                    <button
                      onClick={() => setEditingModule(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Title *</label>
                      <input
                        type="text"
                        value={editingModule.name || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                        placeholder="e.g. Supermarket"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Delivery Time Tag</label>
                      <input
                        type="text"
                        value={editingModule.time || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, time: e.target.value })}
                        placeholder="e.g. 15-20 min"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Card Size</label>
                      <select
                        value={editingModule.size || 'medium'}
                        onChange={(e) => setEditingModule({ ...editingModule, size: e.target.value as ModuleSize })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="large">Large (Full Width Banner)</option>
                        <option value="medium">Medium (Standard Card)</option>
                        <option value="small">Small (Compact Grid)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Badge / Tag Text</label>
                      <input
                        type="text"
                        value={editingModule.badge || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, badge: e.target.value })}
                        placeholder="e.g. Hot, 20% OFF"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    {/* Module Enable / Disable Switch */}
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">Enable Module in Store</span>
                        <span className="text-[11px] text-slate-400 block">Disabled modules hide from storefront navigation & products</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingModule.enabled !== false}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              enabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Short Subtitle / Description</label>
                      <input
                        type="text"
                        value={editingModule.description || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                        placeholder="e.g. Fresh, daily & trusted essentials"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    {/* DIRECT MODULE LOGO UPLOAD & URL */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-purple-600" /> Module Logo / Illustration Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          {editingModule.image ? (
                            <img src={editingModule.image} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-3xl">{editingModule.icon || '📦'}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-purple-600" /> Upload Module Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingModule({ ...editingModule, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={editingModule.image || ''}
                            onChange={(e) => setEditingModule({ ...editingModule, image: e.target.value })}
                            placeholder="Or paste Logo Image URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingModule(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModule}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                    >
                      Save Module
                    </button>
                  </div>
                </div>
              )}

              {/* Module List */}
              <div className="space-y-3">
                {data.modules
                  .filter((mod) => {
                    if (moduleFilterTab === 'enabled') return mod.enabled !== false;
                    if (moduleFilterTab === 'disabled') return mod.enabled === false;
                    return true;
                  })
                  .map((mod) => {
                    const catCount = data.categories.filter((c) => c.moduleId === mod.id).length;
                    const isModEnabled = mod.enabled !== false;

                    return (
                      <div
                        key={mod.id}
                        className={`border p-4 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all ${
                          !isModEnabled
                            ? 'border-amber-200 bg-amber-50/40 opacity-75 hover:opacity-100'
                            : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {mod.image ? (
                              <img src={mod.image} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-2xl">{mod.icon}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                              <span className="truncate">{mod.name}</span>
                              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                                {mod.size}
                              </span>
                              {isModEnabled ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Enabled
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                                  <EyeOff className="w-3 h-3 text-amber-600" /> Disabled
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-medium text-[11px] truncate mt-0.5">
                              {mod.description || 'No description'} • <span className="font-bold text-slate-700">{catCount} categories</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Reorder Up / Down */}
                          <button
                            type="button"
                            onClick={() => {
                              const idx = data.modules.findIndex((m) => m.id === mod.id);
                              if (idx !== -1) handleMoveModule(idx, 'up');
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Move Module Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = data.modules.findIndex((m) => m.id === mod.id);
                              if (idx !== -1) handleMoveModule(idx, 'down');
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Move Module Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Enable/Disable Toggle Button */}
                          <button
                            onClick={() => handleToggleModuleEnabled(mod.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isModEnabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={isModEnabled ? 'Click to Disable Module' : 'Click to Enable Module'}
                          >
                            {isModEnabled ? <Power className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              setEditingModule(mod);
                              setIsNewModule(false);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                            title="Edit Module"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                            title="Delete Module"
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

          {/* ---------------- SCREEN: DELIVERY SLOTS MANAGEMENT ---------------- */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {/* Express Delivery Fee Banner / Settings */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" /> Express / Urgent Delivery Fee (അർജന്റ് ഡെലിവറി)
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Set custom delivery charge for customers requesting immediate quick delivery.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={expressFeeInput}
                        onChange={(e) => setExpressFeeInput(Number(e.target.value))}
                        className="w-28 pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="40"
                      />
                    </div>
                    <button
                      onClick={handleSaveExpressFee}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Fee
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Slots Config Card */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" /> Scheduled Batch Delivery Time Slots
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Configure fixed delivery time slots (e.g. 11:00 AM, 12:00 PM Free Delivery Batch, 1:00 PM, 3:00 PM, 5:00 PM).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSlot({ time: '', label: '', fee: 0, isActive: true });
                      setIsNewSlot(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Delivery Time Slot
                  </button>
                </div>

                {/* Slot Editor Form Modal / Drawer */}
                {editingSlot && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 p-5 rounded-2xl space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      {isNewSlot ? '➕ Add New Delivery Time Slot' : '✏️ Edit Delivery Time Slot'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Time Slot Name / Hour *</label>
                        <input
                          type="text"
                          value={editingSlot.time || ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                          placeholder="E.g. 12:00 PM or 11:00 AM - 12:00 PM"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Description / Batch Label</label>
                        <input
                          type="text"
                          value={editingSlot.label || ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, label: e.target.value })}
                          placeholder="E.g. Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Delivery Fee (₹) (0 for Free)</label>
                        <input
                          type="number"
                          value={editingSlot.fee ?? 0}
                          onChange={(e) => setEditingSlot({ ...editingSlot, fee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={editingSlot.isActive !== false}
                            onChange={(e) => setEditingSlot({ ...editingSlot, isActive: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600 rounded"
                          />
                          <span>Active / Enable this Slot</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingSlot(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSlot}
                        className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md cursor-pointer"
                      >
                        Save Time Slot
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Slots List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deliverySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`border p-4 rounded-2xl space-y-2.5 transition-all ${
                        slot.isActive
                          ? 'border-emerald-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{slot.time}</span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            slot.fee === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {slot.fee === 0 ? 'FREE' : `₹${slot.fee}`}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-600 line-clamp-1">{slot.label}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleSlotActive(slot.id)}
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                            slot.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {slot.isActive ? 'Active' : 'Disabled'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const idx = deliverySlots.findIndex((s) => s.id === slot.id);
                              if (idx !== -1) handleMoveSlot(idx, 'up');
                            }}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                            title="Move Slot Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = deliverySlots.findIndex((s) => s.id === slot.id);
                              if (idx !== -1) handleMoveSlot(idx, 'down');
                            }}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                            title="Move Slot Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingSlot(slot);
                              setIsNewSlot(false);
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 6: INTEGRATIONS (N8N) ---------------- */}
          {activeTab === 'integrations' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-orange-600" /> n8n Automation & Webhook Integration
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Decoupled architecture: The website dispatches standard order payloads to n8n. Manage Webhook URLs, security tokens, and triggers directly from this admin panel.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700">Dispatch Webhooks:</span>
                    <button
                      type="button"
                      onClick={() => setN8nWebhookEnabled(!n8nWebhookEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        n8nWebhookEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          n8nWebhookEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-[11px] font-black ${n8nWebhookEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {n8nWebhookEnabled ? 'ENABLED' : 'PAUSED'}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border ${
                    !n8nWebhookEnabled
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : webhookUrl.trim()
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      !n8nWebhookEnabled ? 'bg-slate-400' : webhookUrl.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    {!n8nWebhookEnabled ? 'Webhook Paused' : webhookUrl.trim() ? 'Webhook Active' : 'Setup Required'}
                  </span>
                </div>
              </div>

              {/* Status and Last Test Overview Card */}
              {(data.settings?.n8n_last_test_status || data.settings?.n8n_last_test_time) && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold text-[11px]">Last Webhook Test:</span>
                    <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                      data.settings?.n8n_last_test_status?.startsWith('SUCCESS')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {data.settings?.n8n_last_test_status || 'NOT TESTED'}
                    </span>
                  </div>
                  {data.settings?.n8n_last_test_time && (
                    <span className="text-slate-500 text-[11px]">
                      Timestamp: {new Date(data.settings.n8n_last_test_time).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Visual Architecture Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-sm space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Provider-Independent Architecture
                  </span>
                  <span className="text-[10px] bg-slate-700/80 text-slate-300 px-2.5 py-0.5 rounded-md font-mono">
                    Website ➔ n8n Webhook ➔ WhatsApp Provider
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  No WhatsApp provider or API tokens are hard-coded on this website. Switch between <strong className="text-white">Evolution API</strong>, <strong className="text-white">Meta WhatsApp Cloud API</strong>, <strong className="text-white">WAHA</strong>, or custom providers directly inside your n8n workflow without changing website code.
                </p>
              </div>

              {/* Main Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Webhook Endpoint URL */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-extrabold text-xs">
                      Website ➔ n8n Webhook Endpoint URL <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Configured in Super Admin UI</span>
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    The HTTP POST endpoint in n8n where order creation events (<code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[10px]">order.created</code>) are transmitted.
                  </p>
                </div>

                {/* Webhook Signing Secret / Security Header */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-600" /> Webhook Authentication & Security
                  </h4>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-bold">Webhook Signing Secret / Token (Optional)</label>
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showSecret ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={n8nWebhookSecret}
                      onChange={(e) => setN8nWebhookSecret(e.target.value)}
                      placeholder="e.g. n8n_sec_99a8b7c6..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Sent as <code className="bg-slate-200 px-1 rounded">X-Webhook-Secret</code> header with every order payload for authenticity verification.
                    </p>
                  </div>
                </div>

                {/* Optional n8n Host & Connection Check (For Local / Self-Hosted Diagnostics) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-slate-600" /> n8n Instance Diagnostic (Optional)
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Protocol</label>
                      <select
                        value={n8nProtocol}
                        onChange={(e) => setN8nProtocol(e.target.value as 'http' | 'https')}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="https">HTTPS</option>
                        <option value="http">HTTP</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Host / Domain</label>
                      <input
                        type="text"
                        value={n8nHost}
                        onChange={(e) => setN8nHost(e.target.value)}
                        placeholder="n8n.domain.com or localhost"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Used only for testing direct server reachability if needed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSaveWebhook}
                  disabled={saving}
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save n8n Webhook Settings</span>
                </button>

                <button
                  onClick={handleTestWebhook}
                  disabled={saving || webhookTestStatus?.type === 'testing'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${webhookTestStatus?.type === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test Webhook Payload Dispatch</span>
                </button>

                <button
                  onClick={handleTestN8nConnection}
                  disabled={saving || n8nTestStatus?.type === 'testing'}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Test Instance Reachability</span>
                </button>
              </div>

              {/* Connection Diagnostic Feedbacks */}
              {n8nTestStatus && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                  n8nTestStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : n8nTestStatus.type === 'testing'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {n8nTestStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : n8nTestStatus.type === 'testing' ? (
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="font-extrabold text-xs">
                      Server Reachability: {n8nTestStatus.type === 'success' ? 'SUCCESS' : n8nTestStatus.type === 'testing' ? 'CHECKING...' : 'FAILED'}
                    </h5>
                    <p className="text-[11px] mt-0.5 opacity-90">{n8nTestStatus.message}</p>
                  </div>
                </div>
              )}

              {webhookTestStatus && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                  webhookTestStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : webhookTestStatus.type === 'testing'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {webhookTestStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : webhookTestStatus.type === 'testing' ? (
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="font-extrabold text-xs">
                      Webhook Trigger: {webhookTestStatus.type === 'success' ? 'SUCCESS' : webhookTestStatus.type === 'testing' ? 'DISPATCHING...' : 'FAILED'}
                    </h5>
                    <p className="text-[11px] mt-0.5 opacity-90">{webhookTestStatus.message}</p>
                  </div>
                </div>
              )}

              {/* Webhook JSON Payload Documentation Box */}
              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400">
                    Standard Order Webhook Payload Schema
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    Content-Type: application/json
                  </span>
                </div>
                <pre className="p-3 bg-black/50 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`{
  "event": "order.created",
  "order": {
    "order_id": "ORD-2026-0814-XYZ",
    "store_id": "store-1",
    "store_code": "STR01",
    "store_name": "Ajmeeri Restaurant & Hypermarket",
    "customer_name": "Muhammed Rashid",
    "customer_phone": "919876543210",
    "customer_whatsapp": "919876543210",
    "delivery_address": "Flat 4B, Emerald Heights, City Center",
    "delivery_slot": "Express 15-20 min",
    "payment_method": "cod",
    "payment_status": "Pending",
    "subtotal": 450,
    "delivery_fee": 30,
    "total_amount": 480,
    "currency": "INR",
    "items": [
      {
        "product_id": "prod-1",
        "name": "Chicken Biryani (Full)",
        "quantity": 2,
        "price": 180,
        "total": 360
      },
      {
        "product_id": "prod-2",
        "name": "Fresh Lime Juice",
        "quantity": 3,
        "price": 30,
        "total": 90
      }
    ]
  },
  "source": "website",
  "timestamp": "2026-08-14T02:00:00.000Z"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 7: FULL ENTERPRISE BACKUP, IMPORT, EXPORT & SNAPSHOT SUITE ---------------- */}
          {activeTab === 'reports' && (
            <AdminBackupManagement
              data={data}
              onUpdateData={onUpdateData}
              onRestoreBackup={onRestoreBackup}
              showToast={showToast}
              getAdminHeaders={() => {
                const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
                const userStr = sessionStorage.getItem('admin_user') || localStorage.getItem('admin_user');
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                if (userStr) {
                  try {
                    const u = JSON.parse(userStr);
                    headers['x-admin-role'] = u.role || 'super_admin';
                    headers['x-admin-username'] = u.username || 'admin';
                  } catch (e) {}
                }
                return headers;
              }}
            />
          )}

          {/* ---------------- SCREEN 8: ADMIN BRANDING & SETTINGS ---------------- */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" /> Admin Credentials, Branding & Store Customization
                </h3>
                <p className="text-slate-500 text-xs">
                  Customize your admin account login credentials, split-screen portal banner graphics, store name, and logo.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Account Security Credentials */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Security Credentials
                  </h4>

                  {/* Store / Business Name */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">Store / Business Name</label>
                    <p className="text-slate-500 text-[11px] mb-2">Displayed in header & admin dashboard</p>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. EzMart Supermarket"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {/* Admin Username */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">Admin Username / Email</label>
                    <p className="text-slate-500 text-[11px] mb-2">Username required to sign into Admin Portal</p>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. admin or storeowner@ezmart.com"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {/* Admin Password */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">Admin Password</label>
                    <p className="text-slate-500 text-[11px] mb-2">Password required for authenticating admin sessions</p>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setNewPinInput(e.target.value);
                        }}
                        placeholder="Enter new admin password"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-extrabold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Admin Logo Customization */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 pt-3">
                    <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-600" /> Admin Logo Image
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        {adminLogo ? (
                          <img src={adminLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Store className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <label className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-xs transition-colors">
                          <UploadCloud className="w-3.5 h-3.5 text-orange-600" /> Upload Admin Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileRead(file, (base64) => {
                                  setAdminLogo(base64);
                                });
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={adminLogo}
                          onChange={(e) => setAdminLogo(e.target.value)}
                          placeholder="Or paste Logo URL (https://...)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Split-Screen Login Page Branding */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Admin Login Split-Screen Branding
                  </h4>

                  {/* Banner Image Customization */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-extrabold">Split-Screen Banner Image</label>
                    <p className="text-slate-500 text-[11px]">Hero image displayed on the left panel of the login screen</p>
                    
                    <div className="h-32 rounded-2xl border border-slate-200 overflow-hidden relative bg-slate-900">
                      <img src={adminLoginBanner} alt="Banner Preview" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700">
                          Banner Preview
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <label className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-extrabold px-3 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-xs transition-colors shrink-0">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileRead(file, (base64) => {
                                setAdminLoginBanner(base64);
                              });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={adminLoginBanner}
                        onChange={(e) => setAdminLoginBanner(e.target.value)}
                        placeholder="Or paste Banner Image URL (https://...)"
                        className="flex-1 bg-white border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Banner Title */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">Banner Headline / Title</label>
                    <input
                      type="text"
                      value={adminBannerTitle}
                      onChange={(e) => setAdminBannerTitle(e.target.value)}
                      placeholder="e.g. Hyperlocal Merchant Portal"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Banner Subtitle */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">Banner Description / Subtitle</label>
                    <textarea
                      rows={3}
                      value={adminBannerSubtitle}
                      onChange={(e) => setAdminBannerSubtitle(e.target.value)}
                      placeholder="Describe your merchant platform..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Admin Credentials & Branding Settings
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 9: PWA MOBILE APP CUSTOMIZATION ---------------- */}
          {activeTab === 'pwa' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    Progressive Web App (PWA) Customization & Branding
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Customizable app icon, app name, description & theme colors. Automatically prompts website visitors to install the app.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onTestPWAInstallPrompt) {
                      onTestPWAInstallPrompt();
                      showToast('PWA Install Prompt Modal opened!');
                    } else {
                      showToast('PWA Modal triggered', 'success');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Preview / Test Install Modal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Inputs */}
                <form onSubmit={handleSavePwaSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  <div className="space-y-4">
                    {/* Enable / Disable PWA Master Toggle Box */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      pwaEnabled 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm flex items-center gap-2">
                          <Smartphone className={`w-4 h-4 ${pwaEnabled ? 'text-emerald-600' : 'text-rose-600'}`} />
                          <span>PWA Pop-up Installation System</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            pwaEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {pwaEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600">
                          {pwaEnabled 
                            ? 'Website visitors will automatically see the app installation window on page open.' 
                            : 'Installation popup is turned off. Users will not see automatic app install prompts.'}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={pwaEnabled}
                          onChange={(e) => setPwaEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2 pt-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> App Identity & Manifest Details
                    </h4>

                    {/* App Full Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Application Name (PWA Title) *
                      </label>
                      <input
                        type="text"
                        value={pwaName}
                        onChange={(e) => setPwaName(e.target.value)}
                        placeholder="e.g. Hyperlocal WhatsApp Store"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Title shown on the installation popup window & app header
                      </span>
                    </div>

                    {/* Short Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Short Name (Home Screen Badge) *
                      </label>
                      <input
                        type="text"
                        value={pwaShortName}
                        onChange={(e) => setPwaShortName(e.target.value)}
                        placeholder="e.g. HyperlocalApp"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Label displayed below the mobile phone app icon on home screen
                      </span>
                    </div>

                    {/* App Description */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Application Description *
                      </label>
                      <textarea
                        rows={3}
                        value={pwaDescription}
                        onChange={(e) => setPwaDescription(e.target.value)}
                        placeholder="Describe store highlights (e.g. 15-min delivery, direct WhatsApp ordering...)"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* PWA Icon Upload / Link */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" /> PWA App Icon / Logo Image *
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl border-2 border-emerald-500/20 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-md">
                          {pwaIcon ? (
                            <img src={pwaIcon} alt="PWA Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-emerald-600" /> Direct File Upload from Device
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setPwaIcon(base64);
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={pwaIcon}
                            onChange={(e) => setPwaIcon(e.target.value)}
                            placeholder="Or paste App Icon URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colors Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">Theme Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwaThemeColor}
                            onChange={(e) => setPwaThemeColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={pwaThemeColor}
                            onChange={(e) => setPwaThemeColor(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs font-bold text-slate-800 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">Splash Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwaBgColor}
                            onChange={(e) => setPwaBgColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={pwaBgColor}
                            onChange={(e) => setPwaBgColor(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs font-bold text-slate-800 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Mode Selection */}
                    <div className="space-y-2">
                      <label className="block text-slate-800 font-extrabold text-xs">
                        PWA Display Mode (ആപ്പ് ഡിസ്‌പ്ലേ മോഡ്) *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'standalone', name: 'Standalone', desc: 'Standard App (No Browser Bar)' },
                          { id: 'fullscreen', name: 'Fullscreen', desc: 'Full Screen Mobile Gaming/App' },
                          { id: 'minimal-ui', name: 'Minimal UI', desc: 'Minimal Navigation Bar' },
                          { id: 'browser', name: 'Browser Tab', desc: 'Standard Safari/Chrome Tab' },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setPwaDisplayMode(mode.id as any)}
                            className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                              pwaDisplayMode === mode.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 font-bold'
                            }`}
                          >
                            <div className="text-xs">{mode.name}</div>
                            <div className={`text-[9px] mt-0.5 leading-tight font-medium ${pwaDisplayMode === mode.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                              {mode.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save PWA Customization'}</span>
                    </button>
                  </div>
                </form>

                {/* Live Preview Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> Live Installation Window Preview
                      </span>
                      <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-700/50">
                        Pop-up Window
                      </span>
                    </div>

                    {/* Simulated Mobile Popup Box */}
                    <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
                      <div className="text-center space-y-2">
                        <img
                          src={pwaIcon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-md border border-slate-200"
                        />
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          {pwaName || 'Store App'}
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          {pwaShortName || 'App'} • ⚡ Official Application
                        </span>
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                          {pwaDescription}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 font-semibold text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>• 1-Tap Home Screen Access</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>• Offline Product Catalog</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{ backgroundColor: pwaThemeColor || '#059669' }}
                        className="w-full py-2.5 px-4 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>ഇൻസ്റ്റാൾ ആപ്ലിക്കേഷൻ (Install App)</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                      ℹ️ This installation prompt will automatically pop up when customers open your website on mobile or desktop browsers until the app is installed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 10: SUPER ADMIN WHATSAPP & ORDER ROUTING ---------------- */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    Super Admin WhatsApp & Full Management Control
                  </h3>
                  <p className="text-slate-500 text-xs">
                    സൂപ്പർ അഡ്മിൻ വാട്സാപ്പ് നമ്പർ, കടയുടമ വാട്സാപ്പ് നമ്പർ, കസ്റ്റമർ റൂട്ടിംഗ് ക്രമീകരണങ്ങൾ പൂർണ്ണമായി കൂട്ടിച്ചേർക്കാനും തിരുത്താനും ഇവിടെ സാധിക്കും.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Form */}
                <form onSubmit={handleSaveWhatsappSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  {/* Master Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    sendToCustomerWhatsapp 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="space-y-0.5">
                      <div className="font-black text-sm flex items-center gap-2">
                        <MessageCircle className={`w-4 h-4 ${sendToCustomerWhatsapp ? 'text-emerald-600' : 'text-rose-600'}`} />
                        <span>Customer WhatsApp Receipt System</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          sendToCustomerWhatsapp ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {sendToCustomerWhatsapp ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600">
                        {sendToCustomerWhatsapp
                          ? 'കസ്റ്റമർ ഓർഡർ കൺഫോം ചെയ്യുമ്പോൾ ഓർഡർ വിവരങ്ങൾ അവരുടെ വാട്സാപ്പിലേക്ക് ഡയറക്ട് അയക്കും.'
                          : 'Customer WhatsApp receipt generation is turned off.'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={sendToCustomerWhatsapp}
                        onChange={(e) => setSendToCustomerWhatsapp(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Mode Selector Cards */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-extrabold text-xs">
                      WhatsApp Order Dispatch Mode (വാട്സാപ്പ് ഡിസ്പാച്ച് റൂട്ടിംഗ് മോഡ്) *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option A: n8n + WhatsApp API */}
                      <button
                        type="button"
                        onClick={() => setWhatsappMode('n8n_api')}
                        className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          whatsappMode === 'n8n_api' || whatsappMode === 'both'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span>n8n + WhatsApp API Mode</span>
                        </div>
                        <p className={`text-[10px] leading-tight font-medium ${whatsappMode === 'n8n_api' || whatsappMode === 'both' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Automatic backend delivery via n8n webhook & WhatsApp API to Store Owner, Admin & Customer.
                        </p>
                      </button>

                      {/* Option B: Direct WhatsApp */}
                      <button
                        type="button"
                        onClick={() => setWhatsappMode('direct')}
                        className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          whatsappMode === 'direct'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs mb-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>Direct WhatsApp Mode</span>
                        </div>
                        <p className={`text-[10px] leading-tight font-medium ${whatsappMode === 'direct' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          No API, No n8n. Direct WhatsApp link/intent opening with pre-filled order summary.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Floating WhatsApp Support Button Toggle */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">
                        Enable Floating WhatsApp Support Button (ഇടതുവശത്തെ വാട്സാപ്പ് സപ്പോർട്ട് ബട്ടൺ)
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        ആപ്പിൽ താഴെ ഇടതുവശത്ത് സപ്പോർട്ട് വാട്സാപ്പ് ഫ്ലോട്ടിംഗ് ബട്ടൺ കാണിക്കുക / മറയ്ക്കുക
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={whatsappSupportEnabled}
                        onChange={(e) => setWhatsappSupportEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Auto Open Toggle */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">
                        Auto-Launch WhatsApp App on Order Submit
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        കസ്റ്റമർ "Confirm Order" അമർത്തിയാൽ വാട്സാപ്പ് ആപ്പ് തനിയെ തുറക്കുക
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={customerWaAutoOpen}
                        onChange={(e) => setCustomerWaAutoOpen(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Info Notice: Merchant Store WhatsApp Location */}
                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                    <span className="font-extrabold text-emerald-950 block text-xs flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-700" />
                      Merchant WhatsApp Numbers
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium block mt-0.5 leading-relaxed">
                      ഇനി മുതൽ ഓരോ കടയുടെയും വാട്സാപ്പ് നമ്പറുകൾ അതത് കടയുടെ <strong>Merchant Store Profile</strong>-ൽ മാത്രം ക്രമീകരിക്കുക. (Go to <strong>Stores Tab → Store Profile → Merchant WhatsApp</strong>)
                    </span>
                  </div>

                  {/* Super Admin WhatsApp Number */}
                  <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200">
                    <label className="block text-purple-950 font-extrabold mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      Super Admin WhatsApp Phone Number (സൂപ്പർ അഡ്മിൻ വാട്സാപ്പ് നമ്പർ)
                    </label>
                    <input
                      type="text"
                      value={superAdminWhatsappPhone}
                      onChange={(e) => setSuperAdminWhatsappPhone(e.target.value)}
                      placeholder="സൂപ്പർ അഡ്മിൻ നമ്പർ എന്റർ ചെയ്യുക (e.g. 919876543210)"
                      className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <span className="text-[10px] text-purple-800 font-semibold block mt-1">
                      👑 All store orders and audit alerts will be simultaneously dispatched to this Super Admin number!
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save WhatsApp Settings'}</span>
                    </button>
                  </div>
                </form>

                {/* Simulated WhatsApp Chat Message Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#0b141a] text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center font-black text-xs">
                          {storeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{storeName}</h4>
                          <span className="text-[9px] text-emerald-400 font-medium">WhatsApp Business Official</span>
                        </div>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800">
                        Live Message Preview
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="bg-[#202c33] text-slate-100 rounded-2xl p-3.5 space-y-2 text-[11px] shadow-md border border-slate-700/50 font-sans leading-relaxed">
                      <div className="font-bold text-emerald-400">
                        🛍️ *ORDER CONFIRMATION - {storeName}*
                      </div>

                      <div className="text-slate-300 text-[10px]">
                        👤 *Customer:* +919876543210<br />
                        📅 *Delivery:* Free Delivery Batch (12:00 PM Slot)
                      </div>

                      <div className="border-t border-slate-700 pt-1.5 text-slate-200 space-y-0.5">
                        <div className="font-bold text-emerald-300">📦 Order Items:</div>
                        <div>• Fresh Apple (Kashmir) x 2 = ₹240</div>
                        <div>• Organic Farm Milk (1L) x 1 = ₹60</div>
                      </div>

                      <div className="border-t border-slate-700 pt-1.5 flex justify-between font-bold text-slate-100">
                        <span>Grand Total:</span>
                        <span className="text-emerald-400">₹300</span>
                      </div>

                      <div className="text-[9px] text-slate-400 italic pt-1">
                        ✅ Order confirmed via Hyperlocal Store.
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      ℹ️ This formatted message will automatically open in the customer's WhatsApp application when they complete an order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 11: PAYMENT OPTIONS & UPI CONFIGURATION ---------------- */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Payment Options & Personal UPI Scanner Settings
                  </h3>
                  <p className="text-slate-500 text-xs">
                    ക്യാഷ് ഓൺ ഡെലിവറിയും (COD) പേഴ്സണൽ Google Pay, PhonePe, QR സ്കാനറും യാതൊരു എപിഐ നിരക്കുകളുമില്ലാതെ ലിങ്ക് ചെയ്യാം.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Zero API Gateway Fee</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Form */}
                <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  {/* Master Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* COD Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      codEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {codEnabled ? 'COD Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={codEnabled}
                          onChange={(e) => setCodEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Online UPI Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      upiEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Online UPI / QR</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {upiEnabled ? 'UPI Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={upiEnabled}
                          onChange={(e) => setUpiEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Wallet Gateway Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      walletEnabled ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-purple-600" />
                          <span>Store Wallet</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {walletEnabled ? 'Wallet Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={walletEnabled}
                          onChange={(e) => setWalletEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Wallet Configuration Section */}
                  {walletEnabled && (
                    <div className="space-y-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
                      <h4 className="font-black text-purple-950 text-xs flex items-center gap-2 border-b border-purple-200 pb-2">
                        <Wallet className="w-4 h-4 text-purple-600" />
                        <span>Wallet Payment Gateway Settings</span>
                      </h4>
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">
                          Default Customer Demo Wallet Balance (₹) *
                        </label>
                        <input
                          type="number"
                          value={walletDemoBalance}
                          onChange={(e) => setWalletDemoBalance(Number(e.target.value))}
                          placeholder="500"
                          required
                          className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <p className="text-[10px] text-purple-700 font-medium mt-1">
                          Customers can select Store Wallet at checkout to instantly deduct their order total from this initial balance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPI Details Inputs */}
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Personal UPI & Account Details</span>
                    </h4>

                    {/* UPI ID */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Personal UPI ID (ഉദാഹരണത്തിന്: 9876543210@paytm / store@okaxis) *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@paytm"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* GPay / PhonePe Phone Number */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Google Pay / PhonePe Phone Number (ഗൂഗിൾ പേ നമ്പർ) *
                      </label>
                      <input
                        type="text"
                        value={upiPhone}
                        onChange={(e) => setUpiPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Payee Account Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Payee / Business Account Name (അക്കൗണ്ട് ഉടമയുടെ പേര്) *
                      </label>
                      <input
                        type="text"
                        value={upiPayeeName}
                        onChange={(e) => setUpiPayeeName(e.target.value)}
                        placeholder="e.g. Anas Hyperlocal Store"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Store Personal QR Image */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Store Personal UPI QR Code Image (നിങ്ങളുടെ സ്കാനർ ക്യൂആർ ചിത്രം)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiQrImage}
                          onChange={(e) => setUpiQrImage(e.target.value)}
                          placeholder="Paste image URL or upload below"
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <label className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setUpiQrImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Payment Options'}</span>
                    </button>
                  </div>
                </form>

                {/* Simulated Checkout Payment Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span className="font-extrabold text-xs">Customer Checkout Preview</span>
                      </div>
                      <span className="bg-emerald-900 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>

                    <div className="bg-white text-slate-900 p-3.5 rounded-2xl space-y-3 border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        പേയ്മെന്റ് രീതി (Payment Option)
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-xl border text-xs font-bold ${codEnabled ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'opacity-40 line-through'}`}>
                          <Banknote className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                          <div>Cash on Delivery</div>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-xs font-bold ${upiEnabled ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'opacity-40 line-through'}`}>
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                          <div>Online Payment</div>
                        </div>
                      </div>

                      {upiEnabled && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2 text-center">
                          <div className="text-[10px] font-bold text-emerald-800">
                            Scan & Pay via GPay / PhonePe
                          </div>

                          {upiQrImage ? (
                            <img src={upiQrImage} alt="QR Code Preview" className="w-28 h-28 object-contain mx-auto rounded-lg border border-slate-200 shadow-xs" />
                          ) : (
                            <div className="w-28 h-28 bg-slate-200 rounded-lg flex items-center justify-center mx-auto text-slate-400 text-[10px] font-bold">
                              No QR Image
                            </div>
                          )}

                          <div className="text-[10px] font-mono font-bold text-slate-800">
                            UPI: {upiId}
                          </div>
                          <div className="text-[10px] font-bold text-slate-700">
                            GPay: +91 {upiPhone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 12: ROLE-BASED ACCESS CONTROL (RBAC) & STAFF ACCOUNTS ---------------- */}
          {activeTab === 'roles' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Role-Based Access Control (RBAC) & Staff Accounts
                  </h3>
                  <p className="text-slate-500 text-xs">
                    സൂപ്പർ അഡ്മിൻ, അഡ്മിൻ, മാനേജർ, സ്റ്റാഫ് റോളുകൾ സെറ്റ് ചെയ്ത് ഓരോ ജീവനക്കാരനും ലോഗിൻ അനുമതി നൽകാം.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingUser({
                      username: '',
                      password: '',
                      name: '',
                      role: 'staff',
                      whatsapp_phone: '919876543210',
                      active: true,
                      permissions: {
                        can_manage_products: true,
                        can_manage_categories: true,
                        can_manage_orders: true,
                        can_manage_settings: false,
                        can_view_reports: true,
                      },
                    });
                    setIsNewUser(true);
                  }}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-purple-600/20 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Staff Account
                </button>
              </div>

              {/* Edit / Create User Modal */}
              {editingUser && (
                <div className="bg-purple-50/60 p-5 rounded-3xl border-2 border-purple-400 space-y-4 text-xs shadow-md">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                    <h4 className="font-black text-purple-900 uppercase tracking-wider text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      {isNewUser ? 'Create New Staff Account' : 'Edit Staff Role & Permissions'}
                    </h4>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="p-1 bg-purple-200 text-purple-800 rounded-full hover:bg-purple-300 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">Username (ലോഗിൻ യൂസർനെയിം) *</label>
                      <input
                        type="text"
                        value={editingUser.username || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        placeholder="e.g. manager1"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">Password (പാസ്‌വേഡ്) *</label>
                      <input
                        type="password"
                        value={editingUser.password || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                        placeholder="e.g. Pass123456"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">Full Name (പേര്)</label>
                      <input
                        type="text"
                        value={editingUser.name || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        placeholder="e.g. Rahul Manager"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">Staff Role (റോൾ) *</label>
                      <select
                        value={editingUser.role || 'staff'}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setEditingUser({
                            ...editingUser,
                            role: r,
                            permissions: {
                              can_manage_products: true,
                              can_manage_categories: true,
                              can_manage_orders: true,
                              can_manage_settings: r === 'super_admin' || r === 'admin',
                              can_view_reports: r !== 'staff',
                            },
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-extrabold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="super_admin">👑 Super Admin (Full Master Control)</option>
                        <option value="admin">🛡️ Admin (Store Management)</option>
                        <option value="manager">💼 Manager (Products & Orders)</option>
                        <option value="staff">👤 Staff (Order Fulfillment)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">WhatsApp Phone (വാട്സാപ്പ് ഫോൺ)</label>
                      <input
                        type="text"
                        value={editingUser.whatsapp_phone || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, whatsapp_phone: e.target.value })}
                        placeholder="വാട്സാപ്പ് ഫോൺ നൽകുക (e.g. 919876543210)"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    {/* Active Status Switch */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-black text-slate-900 block text-xs">Account Status</span>
                        <span className="text-[10px] text-slate-500 font-bold">Active Login Allowed</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingUser.active !== false}
                          onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="bg-white p-4 rounded-2xl border border-purple-200 space-y-2">
                    <span className="font-extrabold text-purple-950 text-xs block">Granular Feature Permissions:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'can_manage_products', label: 'Manage Products' },
                        { key: 'can_manage_categories', label: 'Manage Categories' },
                        { key: 'can_manage_orders', label: 'Manage Orders' },
                        { key: 'can_manage_settings', label: 'Store Settings' },
                      ].map((p) => (
                        <label key={p.key} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editingUser.permissions?.[p.key as keyof RolePermissions]}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                permissions: {
                                  ...editingUser.permissions!,
                                  [p.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-bold text-slate-800 text-[11px]">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUser}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-700 text-white hover:bg-purple-800 shadow-md cursor-pointer"
                    >
                      Save Account
                    </button>
                  </div>
                </div>
              )}

              {/* Users Accounts List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {usersList.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs ${
                          usr.role === 'super_admin' ? 'bg-purple-700' : usr.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}>
                          {usr.role === 'super_admin' ? '👑' : usr.role === 'admin' ? '🛡️' : '👤'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs">{usr.name || usr.username}</h4>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">@{usr.username}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        usr.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : usr.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {usr.role}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 font-semibold space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                      <div>📱 WhatsApp: +{usr.whatsapp_phone}</div>
                      <div>🔑 Password: ••••••••</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className={`w-2 h-2 rounded-full ${usr.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{usr.active !== false ? 'Active Account' : 'Disabled Account'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setEditingUser(usr);
                          setIsNewUser(false);
                        }}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Role
                      </button>

                      {usr.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- 1. FOOTER PANEL (BOTTOM NAVIGATION) CONFIGURATION TAB ---------------- */}
          {(activeTab === 'footer-panel' || activeTab === 'navigation') && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                      Mobile & Web Bar
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-orange-500" />
                      Footer Panel Navigation Control
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Manage bottom navigation bar buttons, custom shortcuts, order, badges, and target actions.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsAddingNavItem(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Button</span>
                  </button>
                  <button
                    onClick={handleResetBottomNav}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    onClick={handleSaveBottomNav}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Layout Presets */}
              <div className="bg-white dark:bg-slate-850 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Quick Navigation Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleApplyBottomNavPreset('profile_only')}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-extrabold text-xs rounded-xl border border-orange-200 dark:border-orange-800/50 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Profile Only (Default Clean Bar)
                  </button>
                  <button
                    onClick={() => handleApplyBottomNavPreset('five_tabs')}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded-xl border border-purple-200 dark:border-purple-800/50 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" /> Food + Grocery + Market + Royal Club + Profile
                  </button>
                  <button
                    onClick={() => handleApplyBottomNavPreset('standard')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Standard 5 Tabs (Home, Categories, Stores, Market, Account)
                  </button>
                </div>
              </div>

              {/* Live Mobile Bottom Nav Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                      Live Customer Preview Bar
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {bottomNavList.filter((i) => i.enabled !== false).length} Active Buttons Displayed
                  </span>
                </div>

                {/* Mock Phone Bottom Bar */}
                <div className="max-w-md mx-auto bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:text-slate-100 rounded-2xl p-2.5 shadow-2xl border border-white/20 flex items-center justify-around">
                  {bottomNavList
                    .filter((i) => i.enabled !== false)
                    .map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold relative ${
                          item.id === 'account' || item.id === 'profile'
                            ? 'text-red-600 dark:text-red-500 font-black'
                            : item.id === 'royal_club' || item.id === 'royalclub'
                            ? 'text-amber-500 dark:text-amber-400 font-black'
                            : idx === 0
                            ? 'text-orange-500 font-black'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1 bg-amber-400 text-amber-950 text-[7px] font-black px-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                          {item.icon === 'Utensils' || item.icon === 'UtensilsCrossed' ? (
                            <UtensilsCrossed className="w-4 h-4" />
                          ) : item.icon === 'Store' || item.icon === 'ShoppingBag' ? (
                            <Store className="w-4 h-4" />
                          ) : item.icon === 'Crown' ? (
                            <Crown className="w-4 h-4" />
                          ) : item.icon === 'User' || item.icon === 'Users' ? (
                            <Users className="w-4 h-4" />
                          ) : item.icon === 'Grid' ? (
                            <Grid className="w-4 h-4" />
                          ) : item.icon === 'Heart' ? (
                            <Heart className="w-4 h-4" />
                          ) : item.icon === 'Clock' ? (
                            <Clock className="w-4 h-4" />
                          ) : item.icon === 'Wallet' ? (
                            <Wallet className="w-4 h-4" />
                          ) : item.icon === 'Sparkles' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : item.icon === 'Gift' ? (
                            <Gift className="w-4 h-4" />
                          ) : (
                            <Compass className="w-4 h-4" />
                          )}
                        </div>
                        <span className="truncate max-w-[54px]">{item.label}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Navigation Items Reordering & Customization List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Navigation Buttons List & Controls
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    Use arrows to reorder • Toggle to enable/disable • Configure action and label
                  </span>
                </div>

                <div className="space-y-2.5">
                  {bottomNavList.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === bottomNavList.length - 1;

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                          item.enabled !== false
                            ? 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 shadow-xs'
                            : 'bg-slate-100/70 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Position Order Badge */}
                          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-black text-xs flex items-center justify-center shrink-0">
                            #{index + 1}
                          </div>

                          {/* Icon Preview */}
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                            {item.icon === 'Utensils' || item.icon === 'UtensilsCrossed' ? (
                              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                            ) : item.icon === 'Store' || item.id === 'stores' ? (
                              <Store className="w-4 h-4 text-emerald-600" />
                            ) : item.icon === 'Crown' || item.id === 'royal_club' ? (
                              <Crown className="w-4 h-4 text-amber-500" />
                            ) : item.icon === 'User' || item.id === 'account' ? (
                              <Users className="w-4 h-4 text-red-500" />
                            ) : item.icon === 'Grid' || item.id === 'categories' ? (
                              <Grid className="w-4 h-4 text-indigo-500" />
                            ) : item.icon === 'ShoppingBag' || item.id === 'market' ? (
                              <ShoppingBag className="w-4 h-4 text-rose-500" />
                            ) : item.icon === 'Heart' || item.id === 'wishlist' ? (
                              <Heart className="w-4 h-4 text-pink-500" />
                            ) : item.icon === 'Wallet' || item.id === 'wallet' ? (
                              <Wallet className="w-4 h-4 text-purple-500" />
                            ) : (
                              <Compass className="w-4 h-4 text-slate-600" />
                            )}
                          </div>

                          {/* ID & Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white capitalize">
                                {item.label || item.id}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                (ID: {item.id})
                              </span>
                              {item.is_custom && (
                                <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  Custom
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              Action Target: <code className="text-orange-600 font-bold">{item.action || item.id}</code>
                            </span>
                          </div>
                        </div>

                        {/* Controls: Label, Action, Badge, Reorder, Toggle, Delete */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end md:self-auto">
                          {/* Custom Label Input */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400 font-bold hidden lg:inline">Label:</span>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleUpdateBottomNavLabel(index, e.target.value)}
                              className="w-24 sm:w-28 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              placeholder="Label"
                            />
                          </div>

                          {/* Target Action */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400 font-bold hidden lg:inline">Action:</span>
                            <select
                              value={item.action || item.id}
                              onChange={(e) => handleUpdateBottomNavAction(index, e.target.value)}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="home">Home (Food)</option>
                              <option value="categories">Categories</option>
                              <option value="stores">Stores</option>
                              <option value="market">Market</option>
                              <option value="royal_club">Royal Club VIP</option>
                              <option value="account">Profile (Account)</option>
                              <option value="cart">Cart Drawer</option>
                              <option value="orders">Orders History</option>
                              <option value="wishlist">Wishlist</option>
                              <option value="wallet">Wallet</option>
                              <option value="modules">Modules</option>
                            </select>
                          </div>

                          {/* Badge text */}
                          <input
                            type="text"
                            value={item.badge || ''}
                            onChange={(e) => handleUpdateBottomNavBadge(index, e.target.value)}
                            className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder="Badge"
                            title="Optional Badge Text (e.g. Free, VIP, New)"
                          />

                          {/* Up / Down Move Buttons */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              onClick={() => handleMoveBottomNavItem(index, 'up')}
                              disabled={isFirst}
                              title="Move Up"
                              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveBottomNavItem(index, 'down')}
                              disabled={isLast}
                              title="Move Down"
                              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Enable / Disable Toggle Switch */}
                          <button
                            onClick={() => handleToggleBottomNavItem(index)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              item.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300'
                            }`}
                          >
                            {item.enabled !== false ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>Enabled</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-slate-400" />
                                <span>Disabled</span>
                              </>
                            )}
                          </button>

                          {/* Delete if custom */}
                          {item.is_custom && (
                            <button
                              onClick={() => handleDeleteBottomNavItem(index)}
                              className="p-1.5 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 cursor-pointer"
                              title="Delete custom button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Nav Item Modal */}
              {isAddingNavItem && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-orange-500" /> Add Custom Footer Button
                      </h3>
                      <button
                        onClick={() => setIsAddingNavItem(false)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Button Label *</label>
                        <input
                          type="text"
                          value={newNavItem.label}
                          onChange={(e) => setNewNavItem({ ...newNavItem, label: e.target.value })}
                          placeholder="e.g. VIP Lounge, Rewards, Deals"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Action Destination</label>
                        <select
                          value={newNavItem.action}
                          onChange={(e) => setNewNavItem({ ...newNavItem, action: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="home">Home (Food Grid)</option>
                          <option value="market">Market Marketplace</option>
                          <option value="royal_club">Royal Club VIP</option>
                          <option value="account">Profile (Account)</option>
                          <option value="stores">Merchant Stores</option>
                          <option value="categories">Categories</option>
                          <option value="wishlist">Wishlist</option>
                          <option value="orders">Orders</option>
                          <option value="wallet">Wallet</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Icon Style</label>
                        <select
                          value={newNavItem.icon}
                          onChange={(e) => setNewNavItem({ ...newNavItem, icon: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Compass">Compass (Explore)</option>
                          <option value="Sparkles">Sparkles (Special)</option>
                          <option value="Crown">Crown (Royal VIP)</option>
                          <option value="Gift">Gift (Rewards)</option>
                          <option value="Utensils">Utensils (Food)</option>
                          <option value="Store">Store (Grocery/Shops)</option>
                          <option value="ShoppingBag">Shopping Bag</option>
                          <option value="User">User Profile</option>
                          <option value="Heart">Heart (Wishlist)</option>
                          <option value="Wallet">Wallet</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Badge Tag (Optional)</label>
                        <input
                          type="text"
                          value={newNavItem.badge}
                          onChange={(e) => setNewNavItem({ ...newNavItem, badge: e.target.value })}
                          placeholder="e.g. NEW, FREE, HOT"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setIsAddingNavItem(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNewBottomNavItem}
                        className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        Add Button
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 2. CUSTOMER PROFILE PAGE OPTIONS TAB ---------------- */}
          {activeTab === 'profile-settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      Customer App View
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-rose-500" />
                      Profile & Account View Settings
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Control which circular quick actions, cards, menu sections, and custom links appear on the customer profile page.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsAddingProfileMenu(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Menu Item</span>
                  </button>
                  <button
                    onClick={handleSaveProfileSettings}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Toggle Switches for Profile Components */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Profile Cards & Section Visibility
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'enable_royal_club', label: 'Royal Club Circular Action', desc: 'Shows Royal Club quick action at top' },
                    { key: 'enable_vouchers', label: 'Vouchers Circular Action', desc: 'Shows Vouchers quick action at top' },
                    { key: 'enable_get_help', label: 'Get Help Circular Action', desc: 'Shows WhatsApp/support help button' },
                    { key: 'enable_free_delivery_banner', label: 'Royal Club Free Delivery Banner', desc: 'Promotional VIP banner on profile' },
                    { key: 'enable_orders', label: 'Order History Menu Item', desc: 'Links to past and active orders' },
                    { key: 'enable_tickets', label: 'HM-Q City Tickets Item', desc: 'Local metro & event tickets' },
                    { key: 'enable_esim', label: 'eSIM Travel Data Item', desc: 'International and local eSIMs' },
                    { key: 'enable_tamwin', label: 'Tamwin Qatar Marketplace Item', desc: 'Direct link to Tamwin grocery/market' },
                    { key: 'enable_country_selector', label: 'Country & Currency Selector', desc: 'Allows selecting Qatar, UAE, KSA, India' },
                    { key: 'enable_wallet', label: 'Finances & Wallet Balance Card', desc: 'Shows wallet balance, top-up, transfer' },
                    { key: 'enable_settings', label: 'Account Preferences & Settings', desc: 'Language, notifications, personal info' },
                    { key: 'enable_app_version', label: 'App Version Branding Card', desc: 'Shows HM-Q App version card at bottom' },
                  ].map((item) => {
                    const isEnabled = (profileSettings as any)[item.key] !== false;
                    return (
                      <div
                        key={item.key}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{item.label}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{item.desc}</span>
                        </div>

                        <button
                          onClick={() =>
                            setProfileSettings({
                              ...profileSettings,
                              [item.key]: !isEnabled,
                            })
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            isEnabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          <span>{isEnabled ? 'On' : 'Off'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Menu Items Section */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Custom Profile Menu Items & Links
                  </h3>
                  <button
                    onClick={() => setIsAddingProfileMenu(true)}
                    className="text-xs font-black text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {profileSettings.custom_menu_items && profileSettings.custom_menu_items.length > 0 ? (
                  <div className="space-y-2.5">
                    {profileSettings.custom_menu_items.map((menuItem) => (
                      <div
                        key={menuItem.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">{menuItem.title}</span>
                              {menuItem.badge && (
                                <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  {menuItem.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {menuItem.subtitle || 'Custom Profile Navigation'} • Action: {menuItem.linkTab || menuItem.url || 'Internal Tab'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleProfileMenuItem(menuItem.id)}
                            className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              menuItem.enabled !== false ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {menuItem.enabled !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteProfileMenuItem(menuItem.id)}
                            className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium">No custom menu items added yet. Click "+ Add Custom Menu Item" above to add new links to the customer profile.</p>
                  </div>
                )}
              </div>

              {/* Add Custom Profile Menu Modal */}
              {isAddingProfileMenu && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-rose-500" /> Add Profile Menu Item
                      </h3>
                      <button
                        onClick={() => setIsAddingProfileMenu(false)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
                        <input
                          type="text"
                          value={newProfileMenu.title}
                          onChange={(e) => setNewProfileMenu({ ...newProfileMenu, title: e.target.value })}
                          placeholder="e.g. VIP Concierge, Loyalty Points, Gift Cards"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subtitle (Optional)</label>
                        <input
                          type="text"
                          value={newProfileMenu.subtitle}
                          onChange={(e) => setNewProfileMenu({ ...newProfileMenu, subtitle: e.target.value })}
                          placeholder="e.g. Redeem rewards and special perks"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Action Destination</label>
                        <select
                          value={newProfileMenu.action}
                          onChange={(e) => setNewProfileMenu({ ...newProfileMenu, action: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="royal_club">Royal Club VIP</option>
                          <option value="market">Market Marketplace</option>
                          <option value="wallet">Wallet Balance</option>
                          <option value="orders">Orders History</option>
                          <option value="wishlist">Wishlist</option>
                          <option value="vouchers">Vouchers</option>
                          <option value="tickets">HM-Q Tickets</option>
                          <option value="esim">eSIM Data</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Badge (Optional)</label>
                        <input
                          type="text"
                          value={newProfileMenu.badge}
                          onChange={(e) => setNewProfileMenu({ ...newProfileMenu, badge: e.target.value })}
                          placeholder="e.g. NEW, 50% OFF, VIP"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setIsAddingProfileMenu(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNewProfileMenuItem}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                      >
                        Add to Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 3. ROYAL CLUB VIP MEMBERSHIP CONFIGURATION TAB ---------------- */}
          {activeTab === 'royal-club' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      VIP Program
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                      Royal Club VIP Membership Control
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Manage Royal Club VIP pricing, free trial privileges, perk descriptions, and member benefits.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveRoyalClubSettings}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Royal Club Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Pricing & Free Trial Card */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Membership Pricing & Free Trial Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly Subscription Price</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={royalClubSettings.monthly_price || 39}
                        onChange={(e) =>
                          setRoyalClubSettings({
                            ...royalClubSettings,
                            monthly_price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-slate-900 dark:text-white"
                      />
                      <span className="font-extrabold text-slate-500">{royalClubSettings.currency || 'QAR'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Yearly Pass Price (Annual)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={royalClubSettings.yearly_price || 299}
                        onChange={(e) =>
                          setRoyalClubSettings({
                            ...royalClubSettings,
                            yearly_price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-slate-900 dark:text-white"
                      />
                      <span className="font-extrabold text-slate-500">{royalClubSettings.currency || 'QAR'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Free Trial Duration (Days)</label>
                    <input
                      type="number"
                      value={royalClubSettings.trial_days || 30}
                      onChange={(e) =>
                        setRoyalClubSettings({
                          ...royalClubSettings,
                          trial_days: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">VIP Badge Text</label>
                    <input
                      type="text"
                      value={royalClubSettings.badge_text || '★ FREE TRIAL'}
                      onChange={(e) =>
                        setRoyalClubSettings({
                          ...royalClubSettings,
                          badge_text: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={royalClubSettings.hero_title || 'Get Endless Free Delivery'}
                      onChange={(e) =>
                        setRoyalClubSettings({
                          ...royalClubSettings,
                          hero_title: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      value={royalClubSettings.hero_subtitle || 'Experience the pinnacle of convenience with zero delivery fees and exclusive VIP dining privileges.'}
                      onChange={(e) =>
                        setRoyalClubSettings({
                          ...royalClubSettings,
                          hero_subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* VIP Perks List Management */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  VIP Membership Privileges & Perks
                </h3>

                {/* Add Perk Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPerkInput}
                    onChange={(e) => setNewPerkInput(e.target.value)}
                    placeholder="e.g. Free secret gift on birthday orders, priority concierge access..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleAddRoyalClubPerk}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Perk
                  </button>
                </div>

                {/* Existing Perks */}
                <div className="space-y-2">
                  {royalClubSettings.perks &&
                    royalClubSettings.perks.map((perk: any, idx: number) => {
                      const title = typeof perk === 'string' ? perk : perk.title || perk.desc;
                      const desc = typeof perk === 'object' ? perk.desc : '';
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                              ✓
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{title}</span>
                              {desc && <span className="text-[11px] text-slate-500 font-medium block">{desc}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteRoyalClubPerk(idx)}
                            className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}


          {/* ---------------- WHATSAPP AUTOMATED NOTIFICATION MODAL ---------------- */}
          {whatsappModalOrder && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">WhatsApp Order Notification</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Real-time update for Order #{whatsappModalOrder.order.order_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWhatsappModalOrder(null)}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Summary Header */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800">Order #{whatsappModalOrder.order.order_id}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Customer Phone: +{whatsappModalOrder.order.customer_phone}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-black text-[11px] inline-block shadow-2xs">
                      {whatsappModalOrder.status}
                    </span>
                  </div>
                </div>

                {/* Optional Custom Note Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>Add Custom Message / Delivery Note (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customWhatsappNote}
                    onChange={(e) => setCustomWhatsappNote(e.target.value)}
                    placeholder="e.g. Delivery partner: Rahul (9876543210)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Live Message Preview */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Pre-filled Message Preview:
                  </label>
                  <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap border border-emerald-800 leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                    {buildWhatsAppMessage(
                      whatsappModalOrder.order,
                      whatsappModalOrder.status,
                      data.settings?.store_name || storeName || 'Hyperlocal Store',
                      customWhatsappNote
                    ).message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      const { message } = buildWhatsAppMessage(
                        whatsappModalOrder.order,
                        whatsappModalOrder.status,
                        data.settings?.store_name || storeName || 'Hyperlocal Store',
                        customWhatsappNote
                      );
                      navigator.clipboard.writeText(message);
                      showToast('WhatsApp message text copied to clipboard!');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Copy Text</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setWhatsappModalOrder(null)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <a
                      href={
                        buildWhatsAppMessage(
                          whatsappModalOrder.order,
                          whatsappModalOrder.status,
                          data.settings?.store_name || storeName || 'Hyperlocal Store',
                          customWhatsappNote
                        ).whatsappUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        showToast('Opening WhatsApp link...');
                        setWhatsappModalOrder(null);
                      }}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send via WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <StoreCreationModal
        isOpen={isStoreCreationOpen}
        onClose={() => setIsStoreCreationOpen(false)}
        availableModules={data.modules || []}
        onStoreCreated={handleStoreCreated}
      />

      {isPosOpen && (
        <PosTerminalModal
          products={data.products || []}
          onClose={() => setIsPosOpen(false)}
          onUpdateData={async (updater) => {
            const next = updater(data);
            await onUpdateData(next);
          }}
          theme={theme}
        />
      )}
    </div>
  );
};

export default AdminPanel;

