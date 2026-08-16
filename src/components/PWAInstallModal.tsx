import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, ShieldCheck, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../types';

interface PWAInstallModalProps {
  settings?: Partial<StoreSettings>;
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  settings,
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // Detect iOS devices (Safari doesn't support automatic beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
  }, []);

  if (!isOpen) return null;

  const appName = settings?.pwa_name || settings?.store_name || 'Hyperlocal Store';
  const appShortName = settings?.pwa_short_name || 'HyperlocalApp';
  const appDesc =
    settings?.pwa_description ||
    'Order fresh groceries, food, meat & home services with 1-click WhatsApp delivery updates directly from your home screen!';
  const appIcon =
    settings?.pwa_icon ||
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80';
  const themeColor = settings?.pwa_theme_color || '#059669';

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('Error launching install prompt:', err);
        setShowManualGuide(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Show clean inline manual installation guide if browser native event is unavailable
      setShowManualGuide(true);
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xs sm:max-w-sm w-full p-4.5 sm:p-5 shadow-2xl border border-emerald-100 relative overflow-hidden my-auto space-y-3.5 animate-in zoom-in-95 duration-200">
        
        {/* Background Decorative Accent */}
        <div 
          className="absolute -top-20 -right-20 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        {/* Top Header & Dismiss Button */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            Install Mobile App
          </span>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-all cursor-pointer shrink-0"
            title="Close / ഡീമിസ്സ്"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Icon & Title Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="relative inline-block">
            <img
              src={appIcon}
              alt={appName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover mx-auto shadow-md border border-emerald-500/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-lg shadow-sm border border-white">
              <Smartphone className="w-3 h-3" />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
              {appName}
            </h2>
            <p className="text-emerald-700 font-bold text-[11px]">
              {appShortName} • ⚡ Mobile App
            </p>
          </div>

          <p className="text-slate-500 text-[11px] font-medium leading-normal line-clamp-2 px-1">
            {appDesc}
          </p>
        </div>

        {/* App Highlights / Advantages */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5 text-[10px] text-slate-700 font-semibold relative z-10">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">1-Tap Fast Launch</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <Zap className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">Superfast Load</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Live Order Track</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Home Screen App</span>
            </div>
          </div>
        </div>

        {/* iOS / Browser Manual Instructions if native prompt unavailable */}
        {(isIOS || showManualGuide) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[10px] text-amber-900 space-y-1 animate-in fade-in">
            <div className="font-extrabold flex items-center gap-1 text-amber-950">
              <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {isIOS ? 'iPhone / iPad Installation:' : 'Manual Installation Guide:'}
              </span>
            </div>
            {isIOS ? (
              <p className="text-[10px] text-amber-800 font-medium leading-tight">
                Tap <span className="font-black text-amber-950">Share</span> → <span className="font-black text-amber-950">"Add to Home Screen" <PlusSquare className="w-3 h-3 inline text-amber-700" /></span>
              </p>
            ) : (
              <p className="text-[10px] text-amber-800 font-medium leading-tight">
                Click browser menu (<span className="font-bold">⋮</span> or <span className="font-bold">⫶</span>) → Select <span className="font-black text-amber-950">"Install App"</span> or <span className="font-black text-amber-950">"Add to Home Screen"</span>
              </p>
            )}
          </div>
        )}


        {/* Action Buttons */}
        <div className="space-y-1.5 relative z-10 pt-0.5">
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            style={{ backgroundColor: themeColor }}
            className="w-full py-2.5 px-4 text-white font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/20"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>
              {isInstalling
                ? 'Installing...'
                : 'ഇൻസ്റ്റാൾ ചെയ്യുക (Install App)'}
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1.5 text-slate-400 hover:text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
          >
            ഇപ്പൊൾ വേണ്ട (Dismiss)
          </button>
        </div>

      </div>
    </div>
  );
};
