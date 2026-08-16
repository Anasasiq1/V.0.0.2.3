import React, { useState } from 'react';
import { VendorStore, StoreTemplateConfig, StoreTemplateType } from '../../types';
import { StoreTemplateRegistry } from '../core/StoreTemplateRegistry';
import { Palette, Layout, Eye, Save, Sparkles, Check, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface StoreTemplateCustomizerProps {
  store: VendorStore;
  currentConfig?: StoreTemplateConfig;
  onSaveConfig: (updatedConfig: StoreTemplateConfig) => void;
}

export const StoreTemplateCustomizer: React.FC<StoreTemplateCustomizerProps> = ({
  store,
  currentConfig,
  onSaveConfig,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplateType>(
    currentConfig?.template_id || 'default-store'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(currentConfig?.primaryColor || '#059669');
  const [secondaryColor, setSecondaryColor] = useState<string>(currentConfig?.secondaryColor || '#10b981');
  const [heroTitle, setHeroTitle] = useState<string>(currentConfig?.heroTitle || store.name);
  const [heroSubtitle, setHeroSubtitle] = useState<string>(
    currentConfig?.heroSubtitle || 'Quality products delivered straight to your doorstep.'
  );
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(
    currentConfig?.heroBannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
  );
  const [productCardStyle, setProductCardStyle] = useState<'grid' | 'list' | 'compact' | 'feature'>(
    currentConfig?.productCardStyle || 'grid'
  );
  const [showCategoriesBar, setShowCategoriesBar] = useState<boolean>(
    currentConfig?.showCategoriesBar ?? true
  );
  const [showStoreHours, setShowStoreHours] = useState<boolean>(
    currentConfig?.showStoreHours ?? true
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const availableTemplates = StoreTemplateRegistry.availableStoreTemplates;

  const handleSelectTemplate = (templateId: StoreTemplateType) => {
    setSelectedTemplate(templateId);
    const info = StoreTemplateRegistry.getTemplateInfo(templateId);
    setPrimaryColor(info.defaultColors.primary);
    setSecondaryColor(info.defaultColors.secondary);
  };

  const handleSave = () => {
    const updated: StoreTemplateConfig = {
      id: currentConfig?.id || `st-config-${store.id}`,
      store_id: store.id,
      template_id: selectedTemplate,
      primaryColor,
      secondaryColor,
      heroBannerUrl,
      heroTitle,
      heroSubtitle,
      productCardStyle,
      showCategoriesBar,
      showStoreHours,
      status: 'published',
      version: '1.0.0',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Storefront Design & Store Template
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Customize how your storefront appears to customers when visiting {store.name}.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Published!' : 'Publish Store Template'}</span>
        </button>
      </div>

      {/* 1. Select Store Template Layout */}
      <div>
        <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 block">
          1. Choose Storefront Template:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTemplates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-3 h-28 bg-slate-100 dark:bg-slate-800">
                    <img src={tpl.previewImage} alt={tpl.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {tpl.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">{tpl.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400">Default Palette</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tpl.defaultColors.primary }} />
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tpl.defaultColors.secondary }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Brand Colors & Hero Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-4">
          <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
            2. Brand Colors:
          </label>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Primary Brand Color
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700"
                />
                <span className="font-mono text-xs font-bold uppercase">{primaryColor}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Accent / Secondary Color
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700"
                />
                <span className="font-mono text-xs font-bold uppercase">{secondaryColor}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Storefront Hero Headline
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-extrabold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Storefront Hero Subtitle
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Product Display Options */}
        <div className="space-y-4">
          <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
            3. Product Display Options:
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Product Card Layout:</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'grid', label: '2-Column Grid' },
                { id: 'compact', label: 'Compact Grid' },
                { id: 'list', label: 'Single List' },
                { id: 'feature', label: 'Featured Banner' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setProductCardStyle(style.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    productCardStyle === style.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCategoriesBar}
                onChange={(e) => setShowCategoriesBar(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Show Store Categories Bar
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showStoreHours}
                onChange={(e) => setShowStoreHours(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Show Store Operating Hours & Address Badge
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Live Storefront Mock Preview */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block mb-2">
          Live Storefront Preview (Scoped to {store.name}):
        </label>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950">
          <div className="p-4 rounded-xl text-white shadow-md relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
            <h3 className="text-lg font-black">{heroTitle}</h3>
            <p className="text-xs opacity-90 font-medium mt-1">{heroSubtitle}</p>
            <span
              className="mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: secondaryColor, color: '#fff' }}
            >
              Verified Merchant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
