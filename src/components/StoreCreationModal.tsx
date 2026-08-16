import React, { useState, useEffect } from 'react';
import { VendorStore, Module } from '../types';
import { Store, X, Plus, Check, Copy, Share2, Sparkles, Shield, Phone, Mail, MapPin, Key, Layers, ExternalLink, CheckSquare, Square, Search } from 'lucide-react';

interface StoreCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableModules: Module[];
  onStoreCreated: (store: VendorStore, ownerUser: any, storefrontUrl: string) => void;
}

export const StoreCreationModal: React.FC<StoreCreationModalProps> = ({
  isOpen,
  onClose,
  availableModules,
  onStoreCreated,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('store1234');
  const [category, setCategory] = useState('Supermarket');
  const [address, setAddress] = useState('Ring Road, Tirur, Kerala');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [moduleSearch, setModuleSearch] = useState('');

  // Sync selectedModuleIds with availableModules when modal opens or availableModules changes
  useEffect(() => {
    if (isOpen) {
      if (availableModules && availableModules.length > 0) {
        // Default to all enabled modules
        const enabledIds = availableModules.filter((m) => m.enabled !== false).map((m) => m.id);
        setSelectedModuleIds(enabledIds.length > 0 ? enabledIds : availableModules.map((m) => m.id));
      } else {
        // Fallback defaults
        setSelectedModuleIds(['mod-grocery', 'mod-food', 'mod-supermarket', 'mod-meat']);
      }
    }
  }, [isOpen, availableModules]);

  // Created Store Result
  const [createdResult, setCreatedResult] = useState<{
    store: VendorStore;
    owner: any;
    storefrontUrl: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleModule = (id: string) => {
    if (selectedModuleIds.includes(id)) {
      setSelectedModuleIds(selectedModuleIds.filter((m) => m !== id));
    } else {
      setSelectedModuleIds([...selectedModuleIds, id]);
    }
  };

  const handleSelectAllModules = () => {
    setSelectedModuleIds(availableModules.map((m) => m.id));
  };

  const handleClearAllModules = () => {
    setSelectedModuleIds([]);
  };

  const handleSelectPreset = (presetType: 'grocery' | 'food' | 'fashion') => {
    if (presetType === 'grocery') {
      const groceryIds = availableModules
        .filter((m) => ['mod-grocery', 'mod-supermarket', 'mod-meat', 'mod-bakery', 'mod-pharmacy'].includes(m.id) || m.id.includes('grocery') || m.id.includes('super'))
        .map((m) => m.id);
      setSelectedModuleIds(groceryIds.length > 0 ? groceryIds : ['mod-grocery', 'mod-supermarket']);
    } else if (presetType === 'food') {
      const foodIds = availableModules
        .filter((m) => ['mod-food', 'mod-bakery'].includes(m.id) || m.id.includes('food') || m.id.includes('restaurant'))
        .map((m) => m.id);
      setSelectedModuleIds(foodIds.length > 0 ? foodIds : ['mod-food']);
    } else if (presetType === 'fashion') {
      const fashionIds = availableModules
        .filter((m) => ['mod-fashion', 'mod-beauty'].includes(m.id) || m.id.includes('fashion') || m.id.includes('beauty'))
        .map((m) => m.id);
      setSelectedModuleIds(fashionIds.length > 0 ? fashionIds : ['mod-fashion', 'mod-beauty']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim() || !whatsappPhone.trim()) {
      setError('Store Name, Owner Name, and WhatsApp Phone are required.');
      return;
    }

    if (selectedModuleIds.length === 0) {
      setError('Please select at least one module for this store.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stores/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName.trim(),
          owner_name: ownerName.trim(),
          whatsapp_phone: whatsappPhone.trim(),
          phone: phone.trim() || whatsappPhone.trim(),
          email: email.trim(),
          password: password.trim() || 'store1234',
          modules: selectedModuleIds,
          category,
          address,
          logo,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreatedResult({
          store: json.store,
          owner: json.owner,
          storefrontUrl: json.storefront_url,
        });
        setStep('success');
        onStoreCreated(json.store, json.owner, json.storefront_url);
      } else {
        setError(json.error || 'Failed to create store.');
      }
    } catch (err: any) {
      setError('Network error: ' + (err.message || 'Server unavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `
🏪 *Store Onboarding Details*
Store Name: ${createdResult.store.name}
Store Code: ${createdResult.store.store_code}
Storefront URL: ${window.location.origin}${createdResult.storefrontUrl}
Owner Username: ${createdResult.owner.username}
Owner Password: ${createdResult.store.password}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToWhatsapp = () => {
    if (!createdResult) return;
    const cleanWa = createdResult.store.whatsapp_phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `🎉 *Welcome to ${createdResult.store.name}!*\n\n` +
        `Your store has been created on the Hyperlocal Platform.\n\n` +
        `🆔 *Store Code:* ${createdResult.store.store_code}\n` +
        `🔗 *Storefront Link:* ${window.location.origin}${createdResult.storefrontUrl}\n` +
        `🔑 *Owner Username:* ${createdResult.owner.username}\n` +
        `🔒 *Password:* ${createdResult.store.password}\n\n` +
        `Access your management portal anytime from the Vendor menu.`
    );
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                {step === 'form' ? 'Create New Store' : 'Store Created Successfully'}
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold dark:bg-emerald-950 dark:text-emerald-300">
                  Centralized Multi-Store
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'form'
                  ? 'Super Admin store provisioning flow'
                  : 'Share credentials with store owner'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Store Basics */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" /> Store Profile & Category
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC Supermarket"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Supermarket">Supermarket</option>
                      <option value="Grocery & Staples">Grocery & Staples</option>
                      <option value="Food & Restaurant">Food & Restaurant</option>
                      <option value="Fresh Meat & Seafood">Fresh Meat & Seafood</option>
                      <option value="Beauty Care & Cosmetics">Beauty Care & Cosmetics</option>
                      <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                      <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store Location / Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring Road, Tirur, Kerala"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Owner Info & WhatsApp */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Owner Account & WhatsApp
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sameer"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 919633594302"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="sameer@abc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Owner Password
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="store1234"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Module Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Select Allowed Business Modules *
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose which business verticals this store is allowed to sell in
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                      {selectedModuleIds.length} / {availableModules.length} Active
                    </span>
                  </div>
                </div>

                {/* Quick Selection Presets & Mass Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="text-[10px] uppercase text-slate-400 font-black mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset('grocery')}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer text-[10px] font-bold"
                    >
                      🥦 Grocery & Staples
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset('food')}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer text-[10px] font-bold"
                    >
                      🍔 Food & Dining
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset('fashion')}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer text-[10px] font-bold"
                    >
                      ✨ Fashion & Beauty
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3 h-3" /> Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllModules}
                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-3 h-3" /> Clear
                    </button>
                  </div>
                </div>

                {/* Module Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {availableModules.map((mod) => {
                    const isSelected = selectedModuleIds.includes(mod.id);
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative group ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm ring-1 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl">{mod.icon || '🛍️'}</span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-white shadow-sm scale-105'
                                : 'border border-slate-300 dark:border-slate-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-black block leading-tight line-clamp-1">{mod.name}</span>
                          {mod.description && (
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                              {mod.description}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    'Provisioning Store...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Create & Provision Store
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success View */
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Store Onboarded & Active!
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  The store is now provisioned in the centralized multi-store ecosystem.
                </p>
              </div>

              {createdResult && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Store Name</span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {createdResult.store.name}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300">
                      {createdResult.store.store_code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Owner Name</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">
                        {createdResult.store.owner_name}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400">WhatsApp Phone</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">
                        {createdResult.store.whatsapp_phone}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Owner Username</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {createdResult.owner.username}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Owner Password</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {createdResult.store.password}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400">Direct Storefront Link</span>
                    <a
                      href={createdResult.storefrontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {window.location.origin}{createdResult.storefrontUrl} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShareToWhatsapp}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Share2 className="w-4 h-4" /> Share Onboarding Credentials on WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied Details!' : 'Copy Onboarding Text'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
