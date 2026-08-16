import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types';
import { CreditCard, Banknote, Wallet, QrCode, UploadCloud, Save, Sparkles, Smartphone, CheckCircle } from 'lucide-react';

interface PaymentConfigProps {
  settings: StoreSettings;
  onSavePaymentSettings: (updatedSettings: Partial<StoreSettings>) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PaymentConfig: React.FC<PaymentConfigProps> = ({
  settings,
  onSavePaymentSettings,
  showToast,
}) => {
  const [saving, setSaving] = useState(false);
  const [codEnabled, setCodEnabled] = useState<boolean>(settings?.cod_enabled !== false);
  const [upiEnabled, setUpiEnabled] = useState<boolean>(settings?.upi_enabled !== false);
  const [walletEnabled, setWalletEnabled] = useState<boolean>(settings?.wallet_enabled !== false);
  const [walletDemoBalance, setWalletDemoBalance] = useState<number>(settings?.wallet_demo_balance ?? 500);
  const [upiId, setUpiId] = useState(settings?.upi_id || '');
  const [upiPhone, setUpiPhone] = useState(settings?.upi_phone || '');
  const [upiPayeeName, setUpiPayeeName] = useState(settings?.upi_payee_name || settings?.store_name || '');
  const [upiQrImage, setUpiQrImage] = useState(settings?.upi_qr_image || '');

  useEffect(() => {
    if (settings) {
      setCodEnabled(settings.cod_enabled !== false);
      setUpiEnabled(settings.upi_enabled !== false);
      setWalletEnabled(settings.wallet_enabled !== false);
      setWalletDemoBalance(settings.wallet_demo_balance ?? 500);
      setUpiId(settings.upi_id ?? '');
      setUpiPhone(settings.upi_phone ?? '');
      setUpiPayeeName(settings.upi_payee_name ?? settings.store_name ?? '');
      setUpiQrImage(settings.upi_qr_image ?? '');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePaymentSettings({
        cod_enabled: codEnabled,
        upi_enabled: upiEnabled,
        wallet_enabled: walletEnabled,
        wallet_demo_balance: walletDemoBalance,
        upi_id: upiId,
        upi_phone: upiPhone,
        upi_payee_name: upiPayeeName,
        upi_qr_image: upiQrImage,
      });
      showToast('Payment Options & QR Scanner settings saved instantly!');
    } catch {
      showToast('Failed to save payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageRead = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const token = localStorage.getItem('hyperlocal_admin_token') || '';
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token,
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const json = await res.json();
        if (json.success && json.url) {
          setUpiQrImage(json.url);
          showToast('QR Code image saved to server!');
        } else {
          setUpiQrImage(dataUrl);
        }
      } catch {
        setUpiQrImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Modular Payment Gateway & QR Scanner Settings
          </h3>
          <p className="text-slate-500 text-xs">
            Configure Cash on Delivery, Personal UPI ID, and Upload QR Code scanner image for customer checkout.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Instant Admin-to-Frontend Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* COD */}
            <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
              codEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div>
                <span className="font-extrabold text-xs block flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>COD</span>
                </span>
                <span className="text-[10px] opacity-80 block font-medium">
                  {codEnabled ? 'Active' : 'Disabled'}
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

            {/* UPI */}
            <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
              upiEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div>
                <span className="font-extrabold text-xs block flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>UPI / QR</span>
                </span>
                <span className="text-[10px] opacity-80 block font-medium">
                  {upiEnabled ? 'Active' : 'Disabled'}
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

            {/* Wallet */}
            <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
              walletEnabled ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div>
                <span className="font-extrabold text-xs block flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span>Wallet</span>
                </span>
                <span className="text-[10px] opacity-80 block font-medium">
                  {walletEnabled ? 'Active' : 'Disabled'}
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

          {/* UPI Details */}
          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
            <h4 className="font-black text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Personal UPI & QR Scanner Details</span>
            </h4>

            <div>
              <label className="block text-slate-800 font-extrabold mb-1">UPI ID *</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 9876543210@paytm"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-extrabold mb-1">GPay / PhonePe Number *</label>
              <input
                type="text"
                value={upiPhone}
                onChange={(e) => setUpiPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-extrabold mb-1">Payee Name *</label>
              <input
                type="text"
                value={upiPayeeName}
                onChange={(e) => setUpiPayeeName(e.target.value)}
                placeholder="e.g. Hyperlocal Store"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* QR Image Upload */}
            <div>
              <label className="block text-slate-800 font-extrabold mb-1">
                Upload Scanner QR Code Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiQrImage}
                  onChange={(e) => setUpiQrImage(e.target.value)}
                  placeholder="Paste URL or upload image file"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <label className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageRead(file);
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

        {/* Live Preview Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> Customer Checkout Payment Preview
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800">
                Live Customer Screen
              </span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>UPI ID: {upiId || 'Not Configured'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Payee: {upiPayeeName}</span>
              </div>

              {upiQrImage ? (
                <div className="bg-white p-3 rounded-2xl text-slate-900 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Scan to Pay (ക്യൂആർ കോഡ്)
                  </div>
                  <img
                    src={upiQrImage}
                    alt="UPI QR Scanner"
                    className="w-36 h-36 object-contain mx-auto rounded-xl border border-slate-200"
                  />
                  <div className="text-xs font-extrabold text-slate-800">{upiPayeeName}</div>
                </div>
              ) : (
                <div className="bg-slate-700/50 p-6 rounded-2xl text-center text-slate-400 text-xs italic">
                  No QR Code Image Uploaded Yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
