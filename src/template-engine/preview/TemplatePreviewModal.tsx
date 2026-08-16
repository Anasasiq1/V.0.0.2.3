import React, { useState } from 'react';
import { PlatformTemplate, AppData } from '../../types';
import { TemplateRegistry } from '../core/TemplateRegistry';
import { Smartphone, Tablet, Monitor, X, CheckCircle, Shield } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: PlatformTemplate;
  appData: AppData;
  isActive: boolean;
  onClose: () => void;
  onActivate: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  appData,
  isActive,
  onClose,
  onActivate,
}) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const TemplateComponent = TemplateRegistry.getTemplateComponent(template.id);

  // Mock props for preview rendering
  const dummyProps: any = {
    appData,
    activeModuleId: 'all',
    activeCategoryId: 'all',
    searchQuery: '',
    cart: [
      {
        cartId: 'c1',
        productId: appData.products?.[0]?.id || 'p1',
        name: appData.products?.[0]?.name || 'Demo Item',
        price: appData.products?.[0]?.price || 100,
        image: appData.products?.[0]?.image || '',
        qty: 2,
        categoryId: appData.products?.[0]?.categoryId || 'c1',
      },
    ],
    sortedProducts: (appData.products || []).slice(0, 6),
    deliveryAddress: appData.settings?.delivery_address || 'Tirur, Kerala',
    customerPhone: '919876543210',
    customerName: 'Demo Customer',
    isWhatsappLoggedIn: true,
    navTab: 'home',
    filterOptions: {},
    theme: 'light',
    onSelectModule: () => {},
    onSelectCategory: () => {},
    onSearchChange: () => {},
    onOpenSearchOverlay: () => {},
    onOpenFilterSheet: () => {},
    onOpenDetailProduct: () => {},
    onOpenStoreDetail: () => {},
    onAddToCart: () => {},
    onUpdateCartQty: () => {},
    onNavigateTab: () => {},
    onOpenCartDrawer: () => {},
    onToggleTheme: () => {},
    onOpenLinkModal: () => {},
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[750px]';
      case 'tablet':
        return 'w-[768px] h-[800px]';
      case 'desktop':
        return 'w-full max-w-[1200px] h-[850px]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 text-white p-3 rounded-2xl flex items-center justify-between shadow-2xl z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">{template.manifest.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                v{template.manifest.version}
              </span>
              {isActive && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 fill-current" /> Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Isolated Sandbox Preview</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'mobile' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'tablet' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'desktop' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isActive && (
            <button
              onClick={() => {
                onActivate(template.id);
                onClose();
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg transition-all"
            >
              Apply Template
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Simulated Device Sandbox Container */}
      <div className="flex-1 w-full my-4 flex items-center justify-center overflow-auto">
        <div
          className={`${getDeviceWidth()} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-y-auto transition-all duration-300 relative`}
        >
          <TemplateComponent {...dummyProps} />
        </div>
      </div>

      <div className="text-center text-[11px] font-bold text-slate-400 shrink-0">
        Previewing in Isolated Sandbox. Store Templates & Storefront configurations remain 100% unaffected.
      </div>
    </div>
  );
};
