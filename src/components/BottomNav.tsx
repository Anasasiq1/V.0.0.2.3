import React from 'react';
import {
  Utensils,
  Store,
  ShoppingBag,
  Crown,
  User,
  Home,
  Grid,
  Heart,
  Clock,
  Wallet,
  Tag,
  Layers,
  ShoppingCart,
  Sparkles,
  Star,
  Gift,
  Smartphone,
  MapPin,
  Zap,
  MessageCircle,
  HelpCircle,
  CreditCard,
  Search,
  Compass,
} from 'lucide-react';
import { BottomNavItem } from '../types';

export interface BottomNavProps {
  activeTab: string;
  onChangeTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  cartCount?: number;
  items?: BottomNavItem[];
  onOpenCartDrawer?: () => void;
}

export const defaultNavItems: BottomNavItem[] = [
  { id: 'home', label: 'Food', icon: 'Utensils', enabled: false, order: 1, action: 'home' },
  { id: 'categories', label: 'Grocery', icon: 'Store', enabled: false, order: 2, action: 'categories' },
  { id: 'market', label: 'Market', icon: 'ShoppingBag', enabled: false, order: 3, action: 'market' },
  { id: 'royal_club', label: 'Royal Club', icon: 'Crown', enabled: false, order: 4, action: 'royal_club' },
  { id: 'account', label: 'Profile', icon: 'User', enabled: true, order: 5, action: 'account' },
];

/**
 * Normalizes customer bottom navigation items ensuring standard tabs exist and configured order/enabled states are respected.
 */
export const normalizeBottomNavItems = (items?: BottomNavItem[]): BottomNavItem[] => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return defaultNavItems;
  }

  const existingMap = new Map<string, BottomNavItem>();
  items.forEach((item) => {
    existingMap.set(item.id, item);
  });

  // Ensure default items exist in map if not present
  defaultNavItems.forEach((defItem) => {
    if (!existingMap.has(defItem.id)) {
      existingMap.set(defItem.id, defItem);
    }
  });

  const merged = Array.from(existingMap.values());
  return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onSelectTab,
  cartCount = 0,
  items,
  onOpenCartDrawer,
}) => {
  const handleTabChange = (item: BottomNavItem) => {
    const tabId = item.action || item.id;
    if (tabId === 'cart' && onOpenCartDrawer) {
      onOpenCartDrawer();
      return;
    }
    if (typeof onChangeTab === 'function') {
      onChangeTab(tabId);
    } else if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    }
  };

  const navItems = normalizeBottomNavItems(items && items.length > 0 ? items : defaultNavItems)
    .filter((item) => item.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const isItemActive = (id: string, action?: string): boolean => {
    const checkId = action || id;
    switch (checkId) {
      case 'home':
      case 'food':
        return activeTab === 'home' || activeTab === 'food';
      case 'categories':
      case 'grocery':
        return activeTab === 'categories' || activeTab === 'category_detail' || activeTab === 'grocery';
      case 'market':
        return activeTab === 'market';
      case 'royal_club':
      case 'royalclub':
        return activeTab === 'royal_club' || activeTab === 'royalclub';
      case 'account':
      case 'profile':
        return ['account', 'profile', 'orders', 'wallet', 'wishlist', 'referral', 'notifications'].includes(activeTab);
      case 'stores':
        return activeTab === 'stores' || activeTab === 'store_detail';
      case 'modules':
        return activeTab === 'modules' || activeTab === 'module_detail';
      case 'cart':
        return activeTab === 'cart';
      default:
        return activeTab === checkId;
    }
  };

  const renderIcon = (iconName: string, id: string, active: boolean) => {
    const iconClass = "w-5 h-5";

    switch (iconName?.toLowerCase() || id.toLowerCase()) {
      case 'utensils':
      case 'food':
        return <Utensils className={iconClass} />;
      case 'store':
      case 'grocery':
        return <Store className={iconClass} />;
      case 'market':
      case 'shoppingbag':
        return <ShoppingBag className={iconClass} />;
      case 'crown':
      case 'royal_club':
      case 'royalclub':
        return <Crown className={iconClass} />;
      case 'user':
      case 'account':
      case 'profile':
        return <User className={iconClass} />;
      case 'home':
        return <Home className={iconClass} />;
      case 'grid':
      case 'categories':
        return <Grid className={iconClass} />;
      case 'heart':
      case 'wishlist':
        return <Heart className={iconClass} />;
      case 'clock':
      case 'orders':
        return <Clock className={iconClass} />;
      case 'wallet':
        return <Wallet className={iconClass} />;
      case 'layers':
      case 'modules':
        return <Layers className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'gift':
        return <Gift className={iconClass} />;
      case 'smartphone':
      case 'esim':
        return <Smartphone className={iconClass} />;
      case 'mappin':
        return <MapPin className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      case 'messagecircle':
      case 'whatsapp':
        return <MessageCircle className={iconClass} />;
      case 'helpcircle':
      case 'support':
        return <HelpCircle className={iconClass} />;
      case 'creditcard':
        return <CreditCard className={iconClass} />;
      case 'search':
        return <Search className={iconClass} />;
      case 'compass':
        return <Compass className={iconClass} />;
      case 'shoppingcart':
      case 'cart':
        return (
          <div className="relative">
            <ShoppingCart className={iconClass} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
        );
      default:
        return <Tag className={iconClass} />;
    }
  };

  // If all items are disabled, don't render empty floating container
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 z-40 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const active = isItemActive(item.id, item.action);
        const isProfileItem = item.id === 'account' || item.id === 'profile' || item.action === 'account';
        const isRoyalClub = item.id === 'royal_club' || item.id === 'royalclub' || item.action === 'royal_club';

        let activeClasses = 'text-slate-900 dark:text-white font-black scale-105';
        if (active) {
          if (isProfileItem) {
            activeClasses = 'text-red-600 dark:text-red-500 font-extrabold scale-105';
          } else if (isRoyalClub) {
            activeClasses = 'text-amber-500 dark:text-amber-400 font-black scale-105';
          } else {
            activeClasses = 'text-slate-900 dark:text-white font-black scale-105';
          }
        }

        return (
          <button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => handleTabChange(item)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer min-w-[52px] relative ${
              active
                ? activeClasses
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {item.badge && (
              <span className="absolute -top-1 right-1 bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                {item.badge}
              </span>
            )}
            {renderIcon(item.icon, item.id, active)}
            <span className="truncate max-w-[62px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
