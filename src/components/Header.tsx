import React, { useState } from 'react';
import { MapPin, ChevronDown, RotateCcw, Smartphone, ShoppingBag } from 'lucide-react';

export interface HeaderProps {
  phone?: string;
  isWhatsappLoggedIn?: boolean;
  onSetPhone?: (phone: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenCartDrawer?: () => void;
  onOpenAdmin?: () => void;
  onOpenOrders?: () => void;
  onOpenPWA?: () => void;
  onClearCache?: () => void;
  deliveryAddress?: string;
  onUpdateAddress?: (addr: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenLinkModal?: () => void;
  variant?: 'indigo' | 'classic' | 'amber';
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onOpenCart,
  onOpenCartDrawer,
  onOpenPWA,
  onClearCache,
  deliveryAddress = '6MR8+QQV, Tirur, Kerala',
  onUpdateAddress,
  variant = 'indigo',
}) => {
  const [editingAddr, setEditingAddr] = useState(false);
  const [addrText, setAddrText] = useState(deliveryAddress);

  const handleSaveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrText.trim() && onUpdateAddress) {
      onUpdateAddress(addrText.trim());
      setEditingAddr(false);
    }
  };

  const handleCartClick = () => {
    if (onOpenCartDrawer) onOpenCartDrawer();
    else if (onOpenCart) onOpenCart();
  };

  const bgClasses = variant === 'amber'
    ? 'bg-amber-400 text-slate-900 dark:bg-amber-500'
    : variant === 'classic'
    ? 'bg-slate-900 text-white'
    : 'bg-indigo-700 text-white';

  return (
    <header className={`${bgClasses} px-4 pt-3.5 pb-3 sticky top-0 z-40 shadow-md transition-colors`}>
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Location Dropdown */}
        <div className="flex-1 min-w-0">
          {editingAddr ? (
            <form onSubmit={handleSaveAddr} className="flex items-center gap-1 max-w-xs">
              <input
                type="text"
                value={addrText}
                onChange={(e) => setAddrText(e.target.value)}
                className="text-xs font-bold bg-white text-slate-800 rounded px-2 py-1 focus:outline-none w-full border border-slate-300"
                autoFocus
              />
              <button type="submit" className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-black cursor-pointer hover:bg-emerald-600">
                Save
              </button>
            </form>
          ) : (
            <div onClick={() => setEditingAddr(true)} className="cursor-pointer group">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-400/20" />
                <span className="font-black text-sm group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                  pathampad
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </span>
              </div>
              <p className="text-[11px] opacity-80 font-medium truncate pl-5 max-w-[220px] sm:max-w-xs">
                {deliveryAddress || '6MR8+QQV, Tirur, Kerala'}
              </p>
            </div>
          )}
        </div>

        {/* Clean Action Controls: ONLY Reload, PWA, and Add Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Reload / Refresh Cache */}
          {onClearCache && (
            <button
              onClick={onClearCache}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Reload / Clear Cache"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Install PWA App */}
          {onOpenPWA && (
            <button
              onClick={onOpenPWA}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Install PWA App"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          {/* Add Cart */}
          {(onOpenCart || onOpenCartDrawer) && (
            <button
              onClick={handleCartClick}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center relative transition-colors cursor-pointer shadow-sm"
              title="Add Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border-2 border-indigo-700 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

