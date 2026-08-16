import React, { useState, useEffect } from 'react';
import { VendorStore, Module, AuditLog, Product, Category, Order } from '../types';
import {
  Store,
  Plus,
  Shield,
  Layers,
  Power,
  ExternalLink,
  Search,
  Check,
  AlertTriangle,
  Eye,
  Edit3,
  Clock,
  Phone,
  Mail,
  MapPin,
  Lock,
  MessageCircle,
  Key,
  Trash2,
  UserCheck,
  Package,
  ShoppingBag,
  List,
  Users,
  FileText,
  X,
  Sparkles,
  RefreshCw,
  LogOut,
  ChevronRight,
  Save,
} from 'lucide-react';

interface StoresManagementTabProps {
  stores: VendorStore[];
  modules: Module[];
  auditLogs?: AuditLog[];
  onOpenStoreCreationModal: () => void;
  onUpdateStoreStatus: (storeId: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') => Promise<void>;
  onUpdateStoreModules: (storeId: string, moduleIds: string[]) => Promise<void>;
  onImpersonateStore?: (storeId: string) => Promise<void>;
  onRefreshData?: () => void;
}

export const StoresManagementTab: React.FC<StoresManagementTabProps> = ({
  stores,
  modules,
  auditLogs = [],
  onOpenStoreCreationModal,
  onUpdateStoreStatus,
  onUpdateStoreModules,
  onImpersonateStore,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingModulesStore, setEditingModulesStore] = useState<VendorStore | null>(null);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);

  const handleDeleteStore = async (store: VendorStore) => {
    const confirmMsg = `Are you sure you want to delete or archive merchant store "${store.name}"? Historical order records will be preserved safely.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingStoreId(store.id);
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch(`/api/stores/${store.id}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Store deleted/archived successfully.');
        if (selectedStoreForProfile?.id === store.id) {
          setSelectedStoreForProfile(null);
        }
        if (onRefreshData) onRefreshData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete store.');
      }
    } catch (err) {
      console.error('Delete store error:', err);
      alert('Failed to connect to server.');
    } finally {
      setDeletingStoreId(null);
    }
  };
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [savingModules, setSavingModules] = useState(false);

  // Store Profile Drawer/Modal state
  const [selectedStoreForProfile, setSelectedStoreForProfile] = useState<VendorStore | null>(null);
  const [profileTab, setProfileTab] = useState<'info' | 'whatsapp' | 'modules' | 'products' | 'orders' | 'staff' | 'audit'>('info');
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Reset Modal state
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetNotice, setResetNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Edit State
  const [editStoreName, setEditStoreName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editWaPhone, setEditWaPhone] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveNotice, setProfileSaveNotice] = useState<string | null>(null);

  // Demo Data Removal State
  const [removingDemoData, setRemovingDemoData] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Impersonating state
  const [impersonatingStoreId, setImpersonatingStoreId] = useState<string | null>(null);

  const filteredStores = stores.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      (st.store_code && st.store_code.toLowerCase().includes(search.toLowerCase())) ||
      st.slug.toLowerCase().includes(search.toLowerCase()) ||
      (st.whatsapp_phone && st.whatsapp_phone.includes(search));

    const matchesCategory = selectedCategory === 'all' || st.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenModuleModal = (st: VendorStore) => {
    setEditingModulesStore(st);
    setSelectedModuleIds(st.modules || []);
  };

  const handleSaveModules = async () => {
    if (!editingModulesStore) return;
    setSavingModules(true);
    await onUpdateStoreModules(editingModulesStore.id, selectedModuleIds);
    setSavingModules(false);
    setEditingModulesStore(null);
    if (selectedStoreForProfile?.id === editingModulesStore.id) {
      loadStoreFullProfile(editingModulesStore.id);
    }
  };

  const toggleModuleSelection = (id: string) => {
    if (selectedModuleIds.includes(id)) {
      setSelectedModuleIds(selectedModuleIds.filter((m) => m !== id));
    } else {
      setSelectedModuleIds([...selectedModuleIds, id]);
    }
  };

  const loadStoreFullProfile = async (storeId: string) => {
    setLoadingProfile(true);
    setProfileSaveNotice(null);
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch(`/api/stores/${storeId}/full-profile`, {
        headers: {
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProfileData(json);
          setEditStoreName(json.store.name || '');
          setEditOwnerName(json.store.owner_name || '');
          setEditWaPhone(json.store.whatsapp_phone || '');
          setEditPhone(json.store.phone || '');
          setEditEmail(json.store.email || '');
          setEditAddress(json.store.address || '');
          setEditCategory(json.store.category || '');
        }
      }
    } catch (err) {
      console.error('Failed to load store profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenStoreProfile = (st: VendorStore) => {
    setSelectedStoreForProfile(st);
    setProfileTab('info');
    loadStoreFullProfile(st.id);
  };

  const handleSaveProfileInfo = async () => {
    if (!selectedStoreForProfile) return;
    setSavingProfile(true);
    setProfileSaveNotice(null);
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch(`/api/stores/${selectedStoreForProfile.id}/profile-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editStoreName,
          owner_name: editOwnerName,
          whatsapp_phone: editWaPhone,
          phone: editPhone,
          email: editEmail,
          address: editAddress,
          category: editCategory,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProfileSaveNotice('Store Profile updated successfully!');
        loadStoreFullProfile(selectedStoreForProfile.id);
        if (onRefreshData) onRefreshData();
      } else {
        setProfileSaveNotice(json.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileSaveNotice(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetOwnerPassword = async () => {
    if (!selectedStoreForProfile) return;
    if (newPassword !== confirmPassword) {
      setResetNotice({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 4) {
      setResetNotice({ type: 'error', message: 'Password must be at least 4 characters long.' });
      return;
    }

    setResettingPassword(true);
    setResetNotice(null);

    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch(`/api/stores/${selectedStoreForProfile.id}/reset-owner-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const json = await res.json();
      if (json.success) {
        setResetNotice({ type: 'success', message: json.message || 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setIsResetPasswordOpen(false), 1500);
      } else {
        setResetNotice({ type: 'error', message: json.error || 'Failed to reset password.' });
      }
    } catch (err: any) {
      setResetNotice({ type: 'error', message: err.message || 'Error resetting password.' });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleRemoveDemoData = async () => {
    if (!selectedStoreForProfile) return;
    setRemovingDemoData(true);
    setDemoNotice(null);
    try {
      const token = localStorage.getItem('hyperlocal_admin_token') || '';
      const res = await fetch(`/api/stores/${selectedStoreForProfile.id}/remove-demo-data`, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        setDemoNotice(json.message);
        loadStoreFullProfile(selectedStoreForProfile.id);
        if (onRefreshData) onRefreshData();
      } else {
        setDemoNotice(json.error || 'Failed to remove demo data.');
      }
    } catch (err: any) {
      setDemoNotice(err.message || 'Error removing demo data.');
    } finally {
      setRemovingDemoData(false);
    }
  };

  const handleTriggerImpersonation = async (storeId: string) => {
    setImpersonatingStoreId(storeId);
    if (onImpersonateStore) {
      await onImpersonateStore(storeId);
    } else {
      try {
        const token = localStorage.getItem('hyperlocal_admin_token') || '';
        const res = await fetch('/api/admin/impersonate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ storeId }),
        });
        const json = await res.json();
        if (json.success && json.token) {
          localStorage.setItem('hyperlocal_admin_token', json.token);
          window.location.reload();
        } else {
          alert(json.error || 'Failed to login as store owner.');
        }
      } catch (err: any) {
        alert(err.message || 'Impersonation error');
      }
    }
    setImpersonatingStoreId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black bg-white/20 px-3 py-1 rounded-full text-white">
            Super Admin Governance
          </span>
          <h2 className="text-xl font-black mt-2">Centralized Store Creation & Management</h2>
          <p className="text-xs text-emerald-100 font-medium max-w-xl mt-1">
            Provision merchant stores, manage merchant WhatsApp numbers, securely impersonate store owners, and audit store performance.
          </p>
        </div>

        <button
          onClick={onOpenStoreCreationModal}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-600" /> Create New Merchant Store
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search store name, code, owner, phone, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold outline-none"
          >
            <option value="all">All Store Categories</option>
            <option value="General Store">General Store</option>
            <option value="Supermarket">Supermarket</option>
            <option value="Bakery & Sweets">Bakery & Sweets</option>
            <option value="Meat & Fish Market">Meat & Fish Market</option>
            <option value="Restaurant & Cafe">Restaurant & Cafe</option>
            <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
            <option value="Electronics & Mobiles">Electronics & Mobiles</option>
          </select>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
            Total Stores: {stores.length}
          </span>
        </div>
      </div>

      {/* Stores Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((st) => {
          const isSuspended = st.status === 'SUSPENDED';
          const storeCode = st.store_code || st.id;

          return (
            <div
              key={st.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isSuspended
                  ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Top Row: Store Info & Status */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80'}
                      alt={st.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                        <span>{st.name}</span>
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                        Code: {storeCode} • {st.category || 'Store'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {st.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Details Pills */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Store Owner:
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{st.owner_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Merchant WhatsApp:
                    </span>
                    <a
                      href={`https://wa.me/91${st.whatsapp_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      +{st.whatsapp_phone}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Registered:
                    </span>
                    <span className="font-medium text-slate-500">
                      {st.registered_at ? new Date(st.registered_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Active Modules Badges */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Active Modules ({st.modules?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(st.modules || []).map((mId) => {
                      const modObj = modules.find((m) => m.id === mId);
                      return (
                        <span
                          key={mId}
                          className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"
                        >
                          <span>{modObj?.icon || '📦'}</span>
                          <span>{modObj?.name || mId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenStoreProfile(st)}
                    className="py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Store Profile</span>
                  </button>

                  <a
                    href={`/store/${st.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Storefront</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Impersonate Button */}
                  <button
                    onClick={() => handleTriggerImpersonation(st.id)}
                    disabled={impersonatingStoreId === st.id}
                    className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    title="Super Admin Impersonation (Login as Store Owner)"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{impersonatingStoreId === st.id ? 'Switching...' : 'Login as Owner'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenModuleModal(st)}
                    className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px] flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Modules</span>
                  </button>
                </div>

                <div className="pt-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStoreStatus(st.id, isSuspended ? 'ACTIVE' : 'SUSPENDED')}
                    className={`py-1.5 px-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      isSuspended
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteStore(st)}
                    disabled={deletingStoreId === st.id}
                    className="py-1.5 px-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    title="Delete or Safe Archive Merchant Store"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deletingStoreId === st.id ? 'Deleting...' : 'Delete Store'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
          <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h4 className="font-extrabold text-base text-slate-800 dark:text-white">No merchant stores found</h4>
          <p className="text-xs text-slate-400 mt-1">Try refining your search query or category filter.</p>
        </div>
      )}

      {/* ---------------- STORE MODULES MODAL ---------------- */}
      {editingModulesStore && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Assign Modules to {editingModulesStore.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which business vertical modules this merchant store can operate.
                </p>
              </div>

              <button
                onClick={() => setEditingModulesStore(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {modules.map((m) => {
                const isSelected = selectedModuleIds.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleModuleSelection(m.id)}
                    className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-extrabold dark:bg-emerald-950/80 dark:text-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-base">{m.icon}</span>
                      <span>{m.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingModulesStore(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveModules}
                disabled={savingModules}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {savingModules ? 'Saving...' : 'Save Modules'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STORE PROFILE DRAWER / MODAL ---------------- */}
      {selectedStoreForProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStoreForProfile.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                      {selectedStoreForProfile.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                      Code: {selectedStoreForProfile.store_code || selectedStoreForProfile.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Owner: <strong className="text-slate-800 dark:text-white">{selectedStoreForProfile.owner_name}</strong> • Merchant WhatsApp: <strong className="text-emerald-600">+{selectedStoreForProfile.whatsapp_phone}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTriggerImpersonation(selectedStoreForProfile.id)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Login as Owner</span>
                </button>

                <button
                  onClick={() => setSelectedStoreForProfile(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Inside Store Profile */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
              <button
                onClick={() => setProfileTab('info')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'info'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Merchant Profile & Owner Info</span>
              </button>

              <button
                onClick={() => setProfileTab('whatsapp')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Merchant WhatsApp</span>
              </button>

              <button
                onClick={() => setProfileTab('products')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'products'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products & Categories ({profileData?.counts?.products || 0})</span>
              </button>

              <button
                onClick={() => setProfileTab('orders')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'orders'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders ({profileData?.counts?.orders || 0})</span>
              </button>

              <button
                onClick={() => setProfileTab('staff')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'staff'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff & Managers</span>
              </button>

              <button
                onClick={() => setProfileTab('audit')}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileTab === 'audit'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            {loadingProfile ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-bold text-slate-500">Loading full store profile data...</p>
              </div>
            ) : (
              <div>
                {/* ---------------- TAB 1: MERCHANT PROFILE & OWNER INFO ---------------- */}
                {profileTab === 'info' && (
                  <div className="space-y-6 text-xs">
                    {profileSaveNotice && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                        ✅ {profileSaveNotice}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Store General Details */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                          <Store className="w-4 h-4 text-emerald-600" />
                          Store Profile Details
                        </h4>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Store Name
                          </label>
                          <input
                            type="text"
                            value={editStoreName}
                            onChange={(e) => setEditStoreName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Business Category
                          </label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none"
                          >
                            <option value="General Store">General Store</option>
                            <option value="Supermarket">Supermarket</option>
                            <option value="Bakery & Sweets">Bakery & Sweets</option>
                            <option value="Meat & Fish Market">Meat & Fish Market</option>
                            <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                            <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                            <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Store Address
                          </label>
                          <textarea
                            rows={2}
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleSaveProfileInfo}
                            disabled={savingProfile}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Save className="w-4 h-4" />
                            <span>{savingProfile ? 'Saving...' : 'Save Store Profile Changes'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Store Owner Details & Security */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          Store Owner Information
                        </h4>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Owner Name
                          </label>
                          <input
                            type="text"
                            value={editOwnerName}
                            onChange={(e) => setEditOwnerName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Owner Login ID / Username (Read-Only)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={profileData?.owner?.username || selectedStoreForProfile.username}
                            className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-600 dark:text-slate-400 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Owner Email Address
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Reset Password Action Box */}
                        <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                              <Lock className="w-4 h-4 text-amber-600" />
                              Store Owner Password
                            </span>
                            <span className="text-[10px] font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md text-slate-600">
                              ••••••••
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-800 dark:text-amber-300">
                            Plaintext passwords are never shown for security. Super Admin can securely issue a new password below.
                          </p>
                          <button
                            onClick={() => setIsResetPasswordOpen(true)}
                            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Reset Store Owner Password</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 2: MERCHANT WHATSAPP ---------------- */}
                {profileTab === 'whatsapp' && (
                  <div className="space-y-5 text-xs bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-emerald-600" />
                          Merchant Store WhatsApp Number
                        </h4>
                        <p className="text-slate-500 text-xs">
                          All customer order receipts and store dispatches for {selectedStoreForProfile.name} will be routed to this WhatsApp number.
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/91${editWaPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Test WhatsApp Link</span>
                      </a>
                    </div>

                    <div className="space-y-3 max-w-lg">
                      <label className="block text-slate-800 dark:text-slate-200 font-extrabold">
                        Store Owner WhatsApp Number (കടയുടമയുടെ വാട്സാപ്പ് നമ്പർ) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 font-extrabold rounded-xl text-slate-700 dark:text-slate-300">
                          +91
                        </span>
                        <input
                          type="text"
                          value={editWaPhone}
                          onChange={(e) => setEditWaPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        This phone number belongs exclusively to {selectedStoreForProfile.name}.
                      </p>

                      <button
                        onClick={handleSaveProfileInfo}
                        disabled={savingProfile}
                        className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingProfile ? 'Saving...' : 'Update Merchant WhatsApp'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 3: PRODUCTS & CATEGORIES ---------------- */}
                {profileTab === 'products' && (
                  <div className="space-y-5 text-xs">
                    {demoNotice && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                        ℹ️ {demoNotice}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Store Inventory ({profileData?.counts?.products || 0} Products)
                        </h4>
                        <p className="text-slate-500 text-xs">
                          Demo Products: <strong className="text-purple-600">{profileData?.counts?.demoProducts || 0}</strong>
                        </p>
                      </div>

                      {profileData?.counts?.demoProducts > 0 && (
                        <button
                          onClick={handleRemoveDemoData}
                          disabled={removingDemoData}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{removingDemoData ? 'Removing...' : 'Remove Demo Data'}</span>
                        </button>
                      )}
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-3">Product Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Demo Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          {(profileData?.products || []).map((p: Product) => (
                            <tr key={p.id}>
                              <td className="p-3 font-bold flex items-center gap-2">
                                <img src={p.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
                                <span>{p.name}</span>
                              </td>
                              <td className="p-3">{p.categoryId}</td>
                              <td className="p-3 font-bold text-emerald-600">₹{p.price}</td>
                              <td className="p-3">{p.stock ?? 'Unlimited'}</td>
                              <td className="p-3">
                                {p.is_demo ? (
                                  <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                                    DEMO ITEM
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                                    REAL ITEM
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 4: ORDERS ---------------- */}
                {profileTab === 'orders' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Order History ({profileData?.counts?.orders || 0} Orders)
                    </h4>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer Phone</th>
                            <th className="p-3">Total Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          {(profileData?.orders || []).map((o: any) => (
                            <tr key={o.order_id || o.id}>
                              <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">#{o.order_id || o.id}</td>
                              <td className="p-3 font-bold text-emerald-600">{o.customer_phone || o.customerPhone || 'N/A'}</td>
                              <td className="p-3 font-extrabold text-slate-900 dark:text-white">₹{o.total_amount ?? o.totalAmount ?? 0}</td>
                              <td className="p-3">
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {o.order_time || o.createdAt ? new Date(o.order_time || o.createdAt).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 5: STAFF & MANAGERS ---------------- */}
                {profileTab === 'staff' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Staff & Manager Accounts ({profileData?.counts?.staff || 0})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(profileData?.staff || []).map((u: any) => (
                        <div key={u.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-white">{u.name}</span>
                            <span className="bg-purple-100 text-purple-800 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Username: {u.username}</p>
                          <p className="text-[11px] text-slate-500">Phone: {u.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 6: AUDIT TRAIL ---------------- */}
                {profileTab === 'audit' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Store Audit Logs ({profileData?.auditLogs?.length || 0})
                    </h4>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {(profileData?.auditLogs || []).map((log: AuditLog) => (
                        <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-emerald-700 dark:text-emerald-400">{log.action}</span>
                            <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- RESET OWNER PASSWORD MODAL ---------------- */}
      {isResetPasswordOpen && selectedStoreForProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Reset Store Owner Password
              </h3>

              <button
                onClick={() => setIsResetPasswordOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Set a new password for Store Owner <strong>{selectedStoreForProfile.owner_name}</strong> ({selectedStoreForProfile.name}).
            </p>

            {resetNotice && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold ${
                  resetNotice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {resetNotice.message}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsResetPasswordOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleResetOwnerPassword}
                disabled={resettingPassword}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>{resettingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
