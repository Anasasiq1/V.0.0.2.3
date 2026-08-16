import React, { useState, useEffect } from 'react';
import {
  Heart,
  Ticket,
  Crown,
  MessageCircle,
  Receipt,
  Smartphone,
  ShoppingBag,
  Globe,
  Wallet,
  CreditCard,
  User,
  Settings,
  FileText,
  Lock,
  ThumbsUp,
  ChevronRight,
  Plus,
  ArrowRightLeft,
  X,
  Check,
  Star,
  Sparkles,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Moon,
  Sun,
  Headphones,
  CheckCircle2,
  ExternalLink,
  LogOut,
  LogIn,
  MessageSquare,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { StoreSettings } from '../types';

export interface AccountViewProps {
  phone: string;
  name?: string;
  isWhatsappLoggedIn: boolean;
  onOpenLinkModal: () => void;
  onUnlinkAccount: () => void;
  onNavigateTab: (tab: string) => void;
  deliveryAddress: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  settings?: StoreSettings;
}

export const AccountView: React.FC<AccountViewProps> = ({
  phone,
  name = 'Anas cp',
  isWhatsappLoggedIn,
  onOpenLinkModal,
  onUnlinkAccount,
  onNavigateTab,
  deliveryAddress,
  theme,
  onToggleTheme,
  settings,
}) => {
  const { lang, setLang, languages } = useI18n();
  const themeUtil = useTheme();

  const pSettings = settings?.profile_settings;
  const rcSettings = settings?.royal_club_settings;

  const currentTheme = theme || themeUtil.theme;
  const isDark = currentTheme === 'dark';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      themeUtil.toggleTheme();
    }
  };

  // User state
  const [userName, setUserName] = useState<string>(() => {
    return isWhatsappLoggedIn ? (localStorage.getItem('hyperlocal_customer_name') || name || 'Customer') : '';
  });
  const [userEmail, setUserEmail] = useState<string>('anas.cp@gmail.com');
  const [userPhone, setUserPhone] = useState<string>(() => {
    return isWhatsappLoggedIn ? (phone || localStorage.getItem('hyperlocal_customer_phone') || '') : '';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isWhatsappLoggedIn) {
      const storedName = localStorage.getItem('hyperlocal_customer_name');
      const storedPhone = localStorage.getItem('hyperlocal_customer_phone');
      setUserName(name || storedName || 'Customer');
      setUserPhone(phone || storedPhone || '');
    } else {
      setUserName('');
      setUserPhone('');
    }
  }, [isWhatsappLoggedIn, name, phone]);

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('hyperlocal_wallet_balance');
    return saved ? Number(saved) : 0;
  });
  const [country, setCountry] = useState<string>(() => {
    return localStorage.getItem('hyperlocal_country') || 'India';
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('hyperlocal_currency') || 'INR';
  });
  const [freeTrialActive, setFreeTrialActive] = useState<boolean>(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    | null
    | 'vouchers'
    | 'royal_club'
    | 'get_help'
    | 'tickets'
    | 'esim'
    | 'country'
    | 'topup'
    | 'transfer'
    | 'payment_methods'
    | 'personal_info'
    | 'settings'
    | 'terms'
    | 'privacy'
    | 'review'
  >(null);

  // Form states for modals
  const [topupAmount, setTopupAmount] = useState<string>('50');
  const [transferPhone, setTransferPhone] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [voucherCopied, setVoucherCopied] = useState<string | null>(null);

  const initialLetter = userName.trim() ? userName.trim().charAt(0).toUpperCase() : 'A';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hyperlocal_customer_name', userName);
    localStorage.setItem('hyperlocal_customer_phone', userPhone);
    setActiveModal(null);
  };

  const handleTopup = (amountToAdd: number) => {
    const newBal = walletBalance + amountToAdd;
    setWalletBalance(newBal);
    localStorage.setItem('hyperlocal_wallet_balance', String(newBal));
    setActiveModal(null);
  };

  const vouchers = [
    { code: 'HM-Q25', discount: '25% OFF', min: 'Min. 50 QAR', desc: 'On first 3 food & grocery orders', tag: 'EXCLUSIVE' },
    { code: 'FREEDEL', discount: 'FREE DELIVERY', min: 'Min. 30 QAR', desc: 'Valid across all local market stores', tag: 'POPULAR' },
    { code: 'ROYAL50', discount: '50 QAR CASHBACK', min: 'Min. 100 QAR', desc: 'Royal Club weekend special voucher', tag: 'VIP' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] dark:bg-slate-950 px-4 pt-4 pb-28 space-y-4 animate-in fade-in duration-300 font-sans">
      {/* 1. Header Profile Info (Logged In) OR Single Primary Login Card (Logged Out) */}
      {isWhatsappLoggedIn ? (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3.5">
            {/* Avatar Circle */}
            <div className="w-14 h-14 rounded-full bg-[#E5E3DC] dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center text-xl font-black shrink-0 border border-slate-300/60 dark:border-slate-700 shadow-xs">
              {initialLetter}
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Hi, {userName || 'Customer'}
              </h1>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>+{userPhone} (Verified WhatsApp)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('personal_info')}
            className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-black border border-slate-200/90 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/50 shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              Login to access your account, orders, wallet, favorites & saved addresses.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={onOpenLinkModal}
              className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Login to Account (ലോഗിൻ)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Quick Circular Action Icons */}
      <div className="flex items-center justify-around gap-2 pt-1 pb-1">
        {/* Favorites */}
        <button
          onClick={() => onNavigateTab('wishlist')}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Favorites
          </span>
        </button>

        {/* Vouchers */}
        {pSettings?.enable_vouchers !== false && (
          <button
            onClick={() => setActiveModal('vouchers')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300/80 flex items-center justify-center text-amber-700 dark:text-amber-300 font-black text-xs shadow-2xs">
                %
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Vouchers
            </span>
          </button>
        )}

        {/* Royal Club */}
        {pSettings?.enable_royal_club !== false && (
          <button
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('royal_club');
              } else {
                setActiveModal('royal_club');
              }
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all">
                <Crown className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              {/* Free Badge */}
              <span className="absolute -top-1 right-0 bg-[#EAB308] text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-xs uppercase">
                {rcSettings?.badge_text || 'Free'}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Royal Club
            </span>
          </button>
        )}

        {/* Get Help */}
        {pSettings?.enable_get_help !== false && (
          <button
            onClick={() => setActiveModal('get_help')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all">
              <MessageCircle className="w-6 h-6 text-slate-500 dark:text-slate-300 fill-slate-100 dark:fill-slate-800" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Get Help
            </span>
          </button>
        )}
      </div>

      {/* 3. Primary Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-3 sm:p-4 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
        {/* Promotional Free Delivery Box */}
        {pSettings?.enable_free_delivery_banner !== false && (
          <div className="bg-gradient-to-r from-[#FCE7F3]/90 via-[#FFF1F2]/80 to-[#FCE7F3]/90 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-rose-950/40 p-3.5 rounded-2xl border border-pink-200/60 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                S+
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                {rcSettings?.hero_title || 'Get Endless Free Delivery on Select Brands'}
              </span>
            </div>

            {freeTrialActive ? (
              <div className="w-full py-2.5 bg-emerald-500 text-white font-black text-xs rounded-full flex items-center justify-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4" /> Free Trial Active ({rcSettings?.trial_days || 30} Days Left)
              </div>
            ) : (
              <button
                onClick={() => {
                  setFreeTrialActive(true);
                  if (onNavigateTab) {
                    onNavigateTab('royal_club');
                  } else {
                    setActiveModal('royal_club');
                  }
                }}
                className="w-full py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xs sm:text-sm rounded-full shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer text-center border border-pink-100 dark:border-slate-700"
              >
                Start Free Trial
              </button>
            )}
          </div>
        )}

        {/* Section List Items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Order History */}
          {pSettings?.enable_orders !== false && (
            <button
              onClick={() => onNavigateTab('orders')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Order History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* HM-Q City Tickets */}
          {pSettings?.enable_tickets !== false && (
            <button
              onClick={() => setActiveModal('tickets')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">HM-Q City Tickets</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* eSIM */}
          {pSettings?.enable_esim !== false && (
            <button
              onClick={() => setActiveModal('esim')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">eSIM</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* Tamwin Qatar */}
          {pSettings?.enable_tamwin !== false && (
            <button
              onClick={() => onNavigateTab('market')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left relative"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {/* Red dot badge */}
                  <span className="absolute -top-0.5 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">Tamwin Qatar</span>
                  <span className="text-xs text-slate-500 font-medium block">Get your items delivered</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* Country Selection */}
          {pSettings?.enable_country_selector !== false && (
            <button
              onClick={() => setActiveModal('country')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 text-base">
                  {country === 'Qatar' ? '🇶🇦' : country === 'United Arab Emirates' ? '🇦🇪' : country === 'Saudi Arabia' ? '🇸🇦' : '🇮🇳'}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">{country}</span>
                  <span className="text-xs text-slate-500 font-medium block">Country ({currency})</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* Custom profile items */}
          {pSettings?.custom_menu_items &&
            pSettings.custom_menu_items
              .filter((item) => item.enabled !== false)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.linkTab) {
                      onNavigateTab(item.linkTab);
                    } else if (item.url) {
                      window.open(item.url, '_blank');
                    }
                  }}
                  className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left relative"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white block">{item.title}</span>
                        {item.badge && (
                          <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span className="text-xs text-slate-500 font-medium block">{item.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
        </div>
      </div>

      {/* 4. Section: Finances */}
      {pSettings?.enable_wallet !== false && (
        <div className="space-y-2.5 pt-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white px-1">Finances</h2>

          {/* Wallet Balance Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
            <div
              onClick={() => onNavigateTab('wallet')}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Wallet Balance</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {walletBalance} <span className="text-2xl">{currency}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Action Buttons: Top-up & Transfer */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setActiveModal('topup')}
                className="flex-1 py-3 px-4 bg-[#F1F0EC] dark:bg-slate-800 hover:bg-[#E8E6E0] dark:hover:bg-slate-750 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Top-up
              </button>

              <button
                onClick={() => setActiveModal('transfer')}
                className="flex-1 py-3 px-4 bg-[#F1F0EC] dark:bg-slate-800 hover:bg-[#E8E6E0] dark:hover:bg-slate-750 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowRightLeft className="w-4 h-4" /> Transfer
              </button>
            </div>

            {/* Payment Methods */}
            <div className="pt-2 border-t border-slate-100 dark:divide-slate-800/80">
              <button
                onClick={() => setActiveModal('payment_methods')}
                className="w-full py-2 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-1 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">Payment Methods</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Section: Account & Preferences */}
      {pSettings?.enable_settings !== false && (
        <div className="space-y-2.5 pt-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white px-1">Account & Preferences</h2>

          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-3 sm:p-4 border border-slate-200/70 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Personal Info */}
            <button
              onClick={() => setActiveModal('personal_info')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Personal Info</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveModal('settings')}
              className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">Settings</span>
                  <span className="text-xs text-slate-500 font-medium block">Language, Notifications & more</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Section: Additional */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white px-1">Additional</h2>

        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-3 sm:p-4 border border-slate-200/70 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Terms & Conditions */}
          <button
            onClick={() => setActiveModal('terms')}
            className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Terms & Conditions</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          {/* Give a Review */}
          <button
            onClick={() => setActiveModal('review')}
            className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl px-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Give a Review</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 7. App Version Card */}
      {pSettings?.enable_app_version !== false && (
        <div className="bg-[#EBE9E3] dark:bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3.5 border border-slate-300/40 dark:border-slate-800 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            H
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">HM-Q App</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Version 0.0.3</p>
          </div>
        </div>
      )}

      {/* 8. Logout Button (Only when logged in) */}
      {isWhatsappLoggedIn && (
        <div className="pt-1">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold text-sm rounded-full transition-all cursor-pointer text-center border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout (ലോഗൗട്ട് ചെയ്യുക)</span>
          </button>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                ലോഗ് ഔട്ട് ചെയ്യണോ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Are you sure you want to log out of your WhatsApp customer account?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl cursor-pointer transition-colors"
              >
                Cancel (വേണ്ട)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onUnlinkAccount();
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/25 cursor-pointer transition-all"
              >
                Logout (ലോഗൗട്ട്)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          INTERACTIVE MODALS & BOTTOM SHEETS
      ============================================================ */}

      {/* VOUCHERS MODAL */}
      {activeModal === 'vouchers' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" /> Available Vouchers
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 font-mono font-black text-xs">
                        {v.code}
                      </span>
                      <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                        {v.tag}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{v.discount}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{v.desc} • {v.min}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(v.code);
                      setVoucherCopied(v.code);
                      setTimeout(() => setVoucherCopied(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    {voucherCopied === v.code ? 'Copied!' : 'Apply'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROYAL CLUB MODAL */}
      {activeModal === 'royal_club' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500" /> Royal Club VIP
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950 text-white space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Free Trial Available</span>
              <h4 className="text-lg font-black">Unlimited Free Delivery Across Qatar</h4>
              <p className="text-xs text-slate-300">Enjoy 0 delivery fee on food, grocery, and local market orders with exclusive priority support.</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero delivery fees on 10,000+ restaurants & stores</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>2X Reward Points & Instant Cashback</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exclusive member-only discounts up to 40%</span>
              </div>
            </div>

            <button
              onClick={() => {
                setFreeTrialActive(true);
                setActiveModal(null);
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-sm cursor-pointer shadow-md"
            >
              Activate 30-Day Free Trial
            </button>
          </div>
        </div>
      )}

      {/* GET HELP / SUPPORT MODAL */}
      {activeModal === 'get_help' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-indigo-600" /> Customer Support
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Need help with your live order, payment refund, or account? Our 24/7 concierge team is here for you.
            </p>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/97455551234?text=Hi%20HM-Q%20Support%2C%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between font-bold text-xs hover:bg-emerald-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="block font-black text-sm">WhatsApp Live Chat</span>
                    <span className="text-[11px] text-emerald-600 font-medium">Instant reply (under 2 mins)</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="tel:+97440001234"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-between font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-600" />
                  <div>
                    <span className="block font-black text-sm">Call Center</span>
                    <span className="text-[11px] text-slate-400 font-medium">+974 4000 1234 (Toll-Free)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CITY TICKETS MODAL */}
      {activeModal === 'tickets' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" /> HM-Q City Tickets
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Doha Quest Theme Park Pass', loc: 'Doha Oasis', price: '150 QAR' },
                { title: 'Lusail Winter Wonderland', loc: 'Al Maha Island', price: '95 QAR' },
                { title: 'Desert Safari & Dune Bashing', loc: 'Sealine Beach', price: '220 QAR' },
              ].map((ticket, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{ticket.title}</h4>
                    <p className="text-[11px] text-slate-500">{ticket.loc}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white font-black text-xs rounded-xl">
                    {ticket.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* eSIM MODAL */}
      {activeModal === 'esim' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" /> HM-Q Travel eSIM
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Instant digital 5G eSIM for Qatar and 120+ countries. Zero roaming fees.
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Qatar Unlimited 5G (7 Days)', data: 'Unlimited 5G Data', price: '45 QAR' },
                { name: 'GCC Travel Pack (Saudi, UAE, Qatar)', data: '10 GB High Speed', price: '75 QAR' },
                { name: 'Global Explorer (120 Countries)', data: '20 GB Global Data', price: '120 QAR' },
              ].map((plan, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{plan.name}</h4>
                    <p className="text-[11px] text-emerald-600 font-bold">{plan.data}</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs rounded-xl">
                    {plan.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COUNTRY / CURRENCY SELECTOR MODAL */}
      {activeModal === 'country' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" /> Select Region & Currency
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: 'India', curr: 'INR', flag: '🇮🇳' },
                { name: 'Qatar', curr: 'QAR', flag: '🇶🇦' },
                { name: 'United Arab Emirates', curr: 'AED', flag: '🇦🇪' },
                { name: 'Saudi Arabia', curr: 'SAR', flag: '🇸🇦' },
              ].map((c) => (
                <button
                  key={c.curr}
                  onClick={() => {
                    setCountry(c.name);
                    setCurrency(c.curr);
                    localStorage.setItem('hyperlocal_country', c.name);
                    localStorage.setItem('hyperlocal_currency', c.curr);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-colors cursor-pointer ${
                    country === c.name || currency === c.curr
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-xs font-black">{c.name}</span>
                  </div>
                  <span className="text-xs font-extrabold">{c.curr}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOP-UP MODAL */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Top-up Wallet
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Amount ({currency})</label>
              <div className="grid grid-cols-3 gap-2">
                {['50', '100', '250', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className={`py-2.5 rounded-xl font-black text-xs border cursor-pointer ${
                      topupAmount === amt
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    +{amt} {currency}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
              />

              <button
                onClick={() => handleTopup(Number(topupAmount) || 50)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-full text-sm cursor-pointer shadow-md"
              >
                Confirm & Add {topupAmount} {currency}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Transfer Balance
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Recipient Phone</label>
                <input
                  type="tel"
                  value={transferPhone}
                  onChange={(e) => setTransferPhone(e.target.value)}
                  placeholder="+974 5555 xxxx"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <button
                onClick={() => {
                  const amt = Number(transferAmount) || 0;
                  if (amt > 0 && amt <= walletBalance) {
                    setWalletBalance(walletBalance - amt);
                    localStorage.setItem('hyperlocal_wallet_balance', String(walletBalance - amt));
                  }
                  setActiveModal(null);
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full text-sm cursor-pointer shadow-md"
              >
                Send Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHODS MODAL */}
      {activeModal === 'payment_methods' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Saved Payment Methods
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    VISA
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Visa •••• 4242</span>
                    <span className="text-[10px] text-slate-400">Expires 12/28</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  PRIMARY
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    Pay
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Apple Pay</span>
                    <span className="text-[10px] text-slate-400">One-touch biometric checkout</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    CASH
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-400">Pay at your doorstep</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL INFO MODAL */}
      {activeModal === 'personal_info' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Personal Info
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm text-slate-900 dark:text-white focus:outline-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-full text-sm cursor-pointer shadow-md mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" /> App Settings & Preferences
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {/* Language Selection */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Language</span>
                </div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl border-none focus:outline-none cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Appearance</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isDark ? 'Dark Theme' : 'Light Theme'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    isDark ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TERMS MODAL */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Terms & Conditions
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>1. <strong>Service Usage:</strong> By using the HM-Q platform, you agree to timely acceptance of ordered food, groceries, and merchandise.</p>
              <p>2. <strong>Delivery & Timeframes:</strong> Standard express delivery aims for under 30 minutes in municipal city zones.</p>
              <p>3. <strong>Refunds & Cancellation:</strong> Orders can be cancelled prior to kitchen acceptance. Wallet credits are refunded instantly.</p>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY MODAL */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" /> Privacy Policy
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>1. <strong>Data Encryption:</strong> All transactions and WhatsApp notifications are protected with 256-bit SSL encryption.</p>
              <p>2. <strong>Location Privacy:</strong> GPS coordinates are exclusively accessed during order dispatch for accurate doorstep delivery.</p>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {activeModal === 'review' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-amber-500" /> Rate & Review App
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-500">Your review helps us keep Qatar delivered faster.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you love or how we can improve..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-medium text-xs text-slate-900 dark:text-white focus:outline-amber-500 resize-none"
                />

                <button
                  onClick={() => setReviewSubmitted(true)}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-sm cursor-pointer shadow-md"
                >
                  Submit Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
