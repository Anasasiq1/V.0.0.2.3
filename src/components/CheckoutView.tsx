import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, CreditCard, ShieldCheck, CheckCircle2, Wallet, Smartphone, AlertTriangle, Loader2 } from 'lucide-react';
import { CartItem, StoreSettings, VendorStore, Product } from '../types';
import { isSlotExpired, validateDeliverySlot } from '../utils/deliverySlots';
import { savePendingUpiCheckout, getPendingUpiCheckout, clearPendingUpiCheckout } from '../utils/upiCheckoutHandler';

export interface CheckoutViewProps {
  cart: CartItem[];
  settings: StoreSettings;
  stores?: VendorStore[];
  products?: Product[];
  deliveryAddress: string;
  customerPhone: string;
  isWhatsappLoggedIn?: boolean;
  onBack: () => void;
  onPlaceOrder: (
    notes: string,
    deliveryType: 'scheduled' | 'urgent',
    deliverySlotTime: string,
    deliveryFee: number,
    paymentMethod: 'cod' | 'upi_online' | 'wallet',
    paymentTransactionId: string
  ) => Promise<boolean>;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  settings,
  stores = [],
  products = [],
  deliveryAddress,
  customerPhone,
  isWhatsappLoggedIn = false,
  onBack,
  onPlaceOrder,
}) => {
  const [phoneInput, setPhoneInput] = useState<string>(customerPhone || '');
  
  const rawSlots = settings.delivery_slots && settings.delivery_slots.length > 0
    ? settings.delivery_slots.filter((s) => s.isActive !== false)
    : [
        { id: 'slot-1', time: '11:00 AM', label: 'Morning Slot', fee: 0, isFree: true, isActive: true },
        { id: 'slot-2', time: '12:00 PM', label: 'Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)', fee: 0, isFree: true, isActive: true },
        { id: 'slot-3', time: '01:00 PM', label: 'Post Lunch Slot', fee: 0, isFree: true, isActive: true },
        { id: 'slot-4', time: '03:00 PM', label: 'Afternoon Slot', fee: 0, isFree: true, isActive: true },
        { id: 'slot-5', time: '05:00 PM', label: 'Evening Batch', fee: 0, isFree: true, isActive: true },
      ];

  const firstValidSlot = rawSlots.find((s) => !isSlotExpired(s.time));

  const [selectedSlot, setSelectedSlot] = useState<string>(() => {
    return firstValidSlot?.time || rawSlots[0]?.time || '12:00 PM';
  });

  // Auto-switch to valid slot if selected becomes expired
  useEffect(() => {
    if (selectedSlot && isSlotExpired(selectedSlot)) {
      const valid = rawSlots.find((s) => !isSlotExpired(s.time));
      if (valid) {
        setSelectedSlot(valid.time);
      }
    }
  }, [rawSlots, selectedSlot]);

  const [slotError, setSlotError] = useState<string>('');

  const availablePaymentMethods = [
    settings.cod_enabled !== false && { id: 'cod' as const, label: 'Cash on Delivery (COD)', icon: <CreditCard className="w-4 h-4" /> },
    settings.upi_enabled !== false && { id: 'upi_online' as const, label: 'UPI Instant Online (GPay / PhonePe)', icon: <Smartphone className="w-4 h-4 text-purple-600" /> },
    settings.wallet_enabled !== false && { id: 'wallet' as const, label: 'Hyperlocal Wallet (Demo Bal: ₹500)', icon: <Wallet className="w-4 h-4 text-amber-500" /> },
  ].filter(Boolean) as Array<{ id: 'cod' | 'upi_online' | 'wallet'; label: string; icon: React.ReactNode }>;

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_online' | 'wallet'>(
    availablePaymentMethods[0]?.id || 'cod'
  );
  const [upiTxId, setUpiTxId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingUpiReturn, setIsWaitingUpiReturn] = useState(false);

  const isPhoneLocked = isWhatsappLoggedIn || Boolean(customerPhone && customerPhone.length >= 10);

  const itemsSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0; // Free delivery or standard
  const grandTotal = itemsSubtotal + deliveryFee;

  const firstCartProduct = cart[0] ? products.find((p) => p.id === cart[0].productId) : null;
  const cartStore = firstCartProduct?.store_id ? stores.find((s) => s.id === firstCartProduct.store_id) : null;

  const upiPayee = (cartStore as any)?.upi_payee_name || (cartStore as any)?.settings?.upi_payee_name || cartStore?.name || settings.upi_payee_name || settings.store_name || 'Hyperlocal Store';
  const upiId = (cartStore as any)?.upi_id || (cartStore as any)?.settings?.upi_id || settings.upi_id || '9847000001@upi';
  const upiPhone = (cartStore as any)?.upi_phone || (cartStore as any)?.settings?.upi_phone || cartStore?.phone || settings.upi_phone || '9847000001';
  const upiQrImage = (cartStore as any)?.upi_qr_image || (cartStore as any)?.settings?.upi_qr_image || settings.upi_qr_image;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&am=${grandTotal.toFixed(2)}&cu=INR`;

  const handleLaunchUpi = () => {
    const finalPhone = (isPhoneLocked ? customerPhone : phoneInput || '').replace(/\D/g, '');
    if (finalPhone) {
      localStorage.setItem('hyperlocal_customer_phone', finalPhone);
    }
    const savedName = localStorage.getItem('hyperlocal_customer_name') || 'Customer';
    savePendingUpiCheckout({
      phone: finalPhone,
      name: savedName,
      notes,
      deliveryType: 'scheduled',
      deliverySlotTime: selectedSlot,
      deliveryFee,
      paymentMethod: 'upi_online',
      cart,
      totalAmount: grandTotal,
      storeId: cartStore?.id,
    });
    setIsWaitingUpiReturn(true);
  };

  const handleConfirmOrder = async (overrideTxId?: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSlotError('');

    // Pre-validation of delivery slot time
    const slotValidation = validateDeliverySlot('scheduled', selectedSlot);
    if (!slotValidation.isValid) {
      const err = slotValidation.error || 'This delivery batch has expired. Please select another available batch.';
      setSlotError(err);
      alert(err);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    const activePhone = (isPhoneLocked ? customerPhone : phoneInput || '').replace(/\D/g, '');
    if (activePhone) {
      localStorage.setItem('hyperlocal_customer_phone', activePhone);
    }

    // If customer is unregistered, register customer first on backend
    if (!isPhoneLocked && phoneInput.trim().length >= 10) {
      try {
        const norm = phoneInput.replace(/\D/g, '');
        const res = await fetch('/api/customer/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: norm, name: 'Customer' }),
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('hyperlocal_customer_token', data.token);
          localStorage.setItem('hyperlocal_customer_phone', data.customer?.whatsapp_number || norm);
          localStorage.setItem('hyperlocal_is_wa_login', 'true');
        }
      } catch (e) {
        console.error('Error registering customer during checkout:', e);
      }
    }

    const txIdToUse = overrideTxId || upiTxId || (paymentMethod === 'upi_online' ? 'UPI_DIRECT' : '');
    clearPendingUpiCheckout();

    try {
      const success = await onPlaceOrder(
        notes,
        'scheduled',
        selectedSlot,
        deliveryFee,
        paymentMethod,
        txIdToUse
      );
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setIsWaitingUpiReturn(false);
    }
  };

  // Automatic Order Processing on return from UPI App
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && isWaitingUpiReturn && !isSubmittingRef.current) {
        const pending = getPendingUpiCheckout();
        if (pending) {
          // Automatic submission without duplicate race conditions
          handleConfirmOrder('UPI_RETURN_AUTO');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isWaitingUpiReturn, selectedSlot, notes, paymentMethod, isPhoneLocked, phoneInput, customerPhone]);

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black text-slate-900 dark:text-white">Order Checkout</h1>
      </div>

      {/* Address Confirmation Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-2">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">1. Delivery Address</span>
        <div className="flex items-start gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{deliveryAddress}</span>
        </div>
      </div>

      {/* Customer WhatsApp Registration & Phone Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">2. Customer WhatsApp Number</span>
          {isPhoneLocked ? (
            <span className="text-[9px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>Registered & Locked</span>
            </span>
          ) : (
            <span className="text-[9px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full">
              Enter Phone Number
            </span>
          )}
        </div>

        {isPhoneLocked ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <div className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>നിങ്ങളുടെ WhatsApp നമ്പർ (+91 {customerPhone || phoneInput}) രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.</span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              ചെക്കൗട്ടിൽ ഫോൺ നമ്പർ മാറ്റാൻ പാടില്ല (Disabled / Read-Only). ഓർഡർ ഈ നമ്പറിലേക്ക് സ്ഥിരീകരിക്കും.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            ഓർഡർ കൺഫർമേഷനും ട്രാക്കിംഗിനുമായി നിങ്ങളുടെ 10 ഡിജിറ്റ് വാട്സാപ്പ് നമ്പർ നൽകുക.
          </p>
        )}

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 select-none">
            +91
          </span>
          <input
            type="tel"
            disabled={isPhoneLocked}
            readOnly={isPhoneLocked}
            value={isPhoneLocked ? customerPhone || phoneInput : phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Enter 10-digit WhatsApp number"
            className={`w-full pl-12 pr-4 py-2.5 border rounded-2xl text-xs font-mono font-bold outline-none transition-all ${
              isPhoneLocked
                ? 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-not-allowed select-none'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
            }`}
          />
        </div>
      </div>

      {/* Delivery Slot Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">3. Select Delivery Slot</span>
          <span className="text-[10px] text-slate-400 font-bold">IST (Asia/Kolkata)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rawSlots.map((slot) => {
            const expired = isSlotExpired(slot.time);
            const isSelected = selectedSlot === slot.time;
            return (
              <button
                key={slot.id}
                disabled={expired}
                onClick={() => {
                  if (!expired) {
                    setSelectedSlot(slot.time);
                    setSlotError('');
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  expired
                    ? 'bg-slate-100/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 cursor-pointer'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Clock className={`w-3.5 h-3.5 ${expired ? 'text-slate-400' : 'text-emerald-600'}`} />
                  {isSelected && !expired && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {expired && (
                    <span className="text-[9px] font-black bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                      സമയം കഴിഞ്ഞു
                    </span>
                  )}
                </div>
                <span className="text-xs font-black block">{slot.time}</span>
                <span className="text-[10px] text-slate-400 font-semibold truncate block">{slot.label}</span>
              </button>
            );
          })}
        </div>

        {slotError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{slotError}</span>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">4. Payment Method</span>

        <div className="space-y-2">
          {availablePaymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setPaymentMethod(pm.id)}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                paymentMethod === pm.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {pm.icon}
                <span className="text-xs font-extrabold">{pm.label}</span>
              </div>
              {paymentMethod === pm.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>

        {paymentMethod === 'upi_online' && (
          <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-purple-900 dark:text-purple-200">
                  Direct Store Merchant UPI
                </p>
                <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                  Payee: <span className="font-bold">{upiPayee}</span>
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2.5 py-1 rounded-xl">
                ₹{grandTotal}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900">
              <span className="text-[10px] font-extrabold text-slate-400">UPI VPA:</span>
              <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 select-all">
                {upiId}
              </span>
            </div>

            {upiQrImage && (
              <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-purple-100 dark:border-purple-900">
                <p className="text-[10px] font-extrabold text-purple-800 dark:text-purple-300 mb-1.5">Scan QR Code to Pay ₹{grandTotal}</p>
                <img src={upiQrImage} alt="UPI QR Code" className="w-40 h-40 object-contain rounded-xl border border-slate-200 shadow-sm" />
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={upiDeepLink}
                onClick={handleLaunchUpi}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-center py-2.5 rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open GPay / PhonePe App</span>
              </a>
            </div>

            {isWaitingUpiReturn && (
              <div className="p-2.5 bg-purple-100/90 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 rounded-xl flex items-center gap-2 text-purple-950 dark:text-purple-200 text-[11px] font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600 shrink-0" />
                <span>പെയ്മെന്റ് പൂർത്തിയാക്കി തിരിച്ചെത്തുമ്പോൾ ഓർഡർ തനിയെ പ്രോസസ്സ് ആകും.</span>
              </div>
            )}

            <div className="pt-1 space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block">
                Enter UPI UTR / Transaction Reference ID (Optional)
              </label>
              <input
                type="text"
                value={upiTxId}
                onChange={(e) => setUpiTxId(e.target.value)}
                placeholder="e.g. 320512894012"
                className="w-full text-xs font-mono font-bold px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Order Summary & Place Order */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between text-xs font-bold text-slate-300">
          <span>Items Subtotal</span>
          <span>₹{itemsSubtotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-emerald-400">
          <span>Delivery Fee</span>
          <span>FREE</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
          <span className="text-xs font-black uppercase text-slate-300">Grand Total</span>
          <span className="text-xl font-black text-white">₹{grandTotal}</span>
        </div>

        <button
          onClick={() => handleConfirmOrder()}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-80"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Order Automatically...</span>
            </>
          ) : isWaitingUpiReturn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for UPI Return...</span>
            </>
          ) : (
            'Confirm & Place Order'
          )}
        </button>
      </div>
    </div>
  );
};
