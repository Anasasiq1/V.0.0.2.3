import React, { useState, useEffect, useRef } from 'react';
import { CartItem, StoreSettings, DeliverySlot, ItemPrescription } from '../types';
import { ShoppingBag, X, Plus, Minus, CheckCircle, ArrowRight, Clock, Zap, ShieldCheck, MessageCircle, Smartphone, ExternalLink, CreditCard, QrCode, Copy, Check, Banknote, Share2, UploadCloud, FileText, Trash2, Wallet, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from 'lucide-react';
import { isSlotExpired, validateDeliverySlot } from '../utils/deliverySlots';
import { savePendingUpiCheckout, getPendingUpiCheckout, clearPendingUpiCheckout } from '../utils/upiCheckoutHandler';

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (cartId: string, change: number) => void;
  onClearCart: () => void;
  onAttachItemPrescription?: (cartId: string, prescription?: ItemPrescription) => void;
  customerPhone: string;
  isWhatsappLoggedIn?: boolean;
  settings?: StoreSettings;
  onPlaceOrder: (
    notes: string,
    deliveryType: 'scheduled' | 'urgent',
    selectedSlotTime?: string,
    deliveryFee?: number,
    paymentMethod?: 'cod' | 'upi_online' | 'wallet',
    paymentTransactionId?: string
  ) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQty,
  onAttachItemPrescription,
  customerPhone,
  isWhatsappLoggedIn = false,
  settings,
  onPlaceOrder,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'scheduled' | 'urgent'>('scheduled');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_online' | 'wallet'>(
    settings?.upi_enabled !== false ? 'upi_online' : 'cod'
  );
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrderSummary, setCopiedOrderSummary] = useState(false);

  const handlePrescriptionFileUpload = (cartId: string, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    if (!validExts.includes(ext || '')) {
      alert('Please upload a valid prescription file in PDF, JPG, PNG, DOC, or DOCX format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onAttachItemPrescription?.(cartId, {
        fileName: file.name,
        fileData: base64,
        fileType: file.type || ext,
      });
    };
    reader.readAsDataURL(file);
  };

  const activeSlots = settings?.delivery_slots?.filter((s) => s.isActive !== false) || [
    { id: 'slot-1', time: '11:00 AM', label: 'Morning Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-2', time: '12:00 PM', label: 'Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)', fee: 0, isFree: true, isActive: true },
    { id: 'slot-3', time: '01:00 PM', label: 'Post Lunch Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-4', time: '03:00 PM', label: 'Afternoon Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-5', time: '05:00 PM', label: 'Evening Batch', fee: 0, isFree: true, isActive: true },
  ];

  const [isDeliverySectionOpen, setIsDeliverySectionOpen] = useState(false);

  // Auto-select first non-expired slot if default/selected slot is expired
  const firstValidSlot = activeSlots.find((s) => !isSlotExpired(s.time)) || activeSlots[0];

  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    (() => {
      const defaultTwelve = activeSlots.find((s) => s.time.includes('12:00') && !isSlotExpired(s.time));
      if (defaultTwelve) return defaultTwelve.id;
      return firstValidSlot?.id || 'slot-2';
    })()
  );

  useEffect(() => {
    const cur = activeSlots.find((s) => s.id === selectedSlotId);
    if (cur && isSlotExpired(cur.time)) {
      const valid = activeSlots.find((s) => !isSlotExpired(s.time));
      if (valid) {
        setSelectedSlotId(valid.id);
      }
    }
  }, [activeSlots, selectedSlotId]);

  const expressFee = settings?.express_delivery_fee ?? 40;

  const selectedSlot = activeSlots.find((s) => s.id === selectedSlotId) || activeSlots[0];
  const currentDeliveryFee = deliveryType === 'urgent' ? expressFee : (selectedSlot?.fee || 0);

  const [isPlacing, setIsPlacing] = useState(false);
  const [isWaitingUpiReturn, setIsWaitingUpiReturn] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedSnapshot, setPlacedSnapshot] = useState<{
    itemsText: string;
    subtotal: number;
    deliveryFee: number;
    grandTotal: number;
    slotTimeStr: string;
    notes: string;
    customerPhoneStr: string;
    paymentMethodStr: string;
    transactionIdStr: string;
  } | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = subtotal + currentDeliveryFee;

  const handleCopy = (text: string, type: 'upi' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const getFormattedOrderSummary = () => {
    if (!placedSnapshot) return '';
    const storeName = settings?.store_name || 'Hyperlocal Store';
    return (
      `🛍️ *ORDER SUMMARY - ${storeName}*\n` +
      `----------------------------------\n` +
      `👤 *Customer Phone:* +${placedSnapshot.customerPhoneStr}\n` +
      `📅 *Delivery Slot:* ${placedSnapshot.slotTimeStr}\n` +
      `💳 *Payment Method:* ${placedSnapshot.paymentMethodStr}\n` +
      (placedSnapshot.transactionIdStr ? `🔢 *UTR / Ref No:* ${placedSnapshot.transactionIdStr}\n` : '') +
      `----------------------------------\n` +
      `📦 *Items Ordered:*\n${placedSnapshot.itemsText}\n` +
      `----------------------------------\n` +
      `🚚 *Delivery Fee:* ${placedSnapshot.deliveryFee === 0 ? 'FREE' : '₹' + placedSnapshot.deliveryFee}\n` +
      `💵 *Grand Total:* ₹${placedSnapshot.grandTotal}\n` +
      (placedSnapshot.notes ? `📝 *Notes:* ${placedSnapshot.notes}\n` : '') +
      `----------------------------------\n` +
      `Thank you for shopping with us!`
    );
  };

  const handleShareOrderSummary = async () => {
    const summaryText = getFormattedOrderSummary();
    if (!summaryText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Summary - ${settings?.store_name || 'Store'}`,
          text: summaryText,
        });
        return;
      } catch (err) {
        // Fallback to WhatsApp link if share dialog closed or unsupported
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyOrderSummary = () => {
    const summaryText = getFormattedOrderSummary();
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopiedOrderSummary(true);
    setTimeout(() => setCopiedOrderSummary(false), 2000);
  };

  const [custPhoneInput, setCustPhoneInput] = useState<string>(() => {
    return localStorage.getItem('hyperlocal_customer_phone') || customerPhone || '';
  });

  useEffect(() => {
    if (customerPhone) {
      setCustPhoneInput(customerPhone);
    }
  }, [customerPhone]);
  const [custNameInput, setCustNameInput] = useState<string>(() => {
    return localStorage.getItem('hyperlocal_customer_name') || '';
  });
  const [phoneError, setPhoneError] = useState('');

  const handleLaunchUpi = () => {
    const cleanCustPhone = (custPhoneInput || customerPhone || '').replace(/\D/g, '');
    if (cleanCustPhone.length >= 10) {
      localStorage.setItem('hyperlocal_customer_phone', cleanCustPhone);
    }
    if (custNameInput) {
      localStorage.setItem('hyperlocal_customer_name', custNameInput);
    }
    savePendingUpiCheckout({
      phone: cleanCustPhone,
      name: custNameInput || 'Customer',
      notes,
      deliveryType,
      deliverySlotTime: selectedSlot?.time,
      deliveryFee: currentDeliveryFee,
      paymentMethod: 'upi_online',
      cart,
      totalAmount: grandTotal,
    });
    setIsWaitingUpiReturn(true);
  };

  const handleCheckout = async (overrideTxId?: string) => {
    if (cart.length === 0) return;

    const cleanCustPhone = (custPhoneInput || customerPhone || '').replace(/\D/g, '');
    if (cleanCustPhone.length < 10) {
      setPhoneError('വാട്സാപ്പ് നമ്പർ കൃത്യമായി നൽകുക (Valid 10-digit phone required)');
      return;
    }
    setPhoneError('');
    localStorage.setItem('hyperlocal_customer_phone', cleanCustPhone);
    if (custNameInput) {
      localStorage.setItem('hyperlocal_customer_name', custNameInput);
    }

    // MANDATORY BATCH DELIVERY EXPIRY CHECK
    if (deliveryType === 'scheduled') {
      const slotValidation = validateDeliverySlot(deliveryType, selectedSlot?.time);
      if (!slotValidation.isValid) {
        alert(slotValidation.error || 'This delivery batch has expired. Please select another available batch.');
        return;
      }
    }

    setIsPlacing(true);
    const slotTimeStr = deliveryType === 'scheduled'
      ? `${selectedSlot?.time || ''} (${selectedSlot?.label || 'Batch Delivery'})`
      : 'Urgent Express Delivery';

    const storeName = settings?.store_name || 'WhatsApp Hyperlocal Store';
    const storeWaPhone = (settings?.store_whatsapp_phone || settings?.store_phone || '').replace(/\D/g, '');
    const superAdminWaPhone = (settings?.super_admin_whatsapp_phone || storeWaPhone || '').replace(/\D/g, '');

    const itemsText = cart
      .map((i) => {
        let line = `• ${i.name}${i.variantName ? ` (${i.variantName})` : ''} x ${i.qty} = ₹${i.price * i.qty}`;
        if (i.prescription) {
          line += `\n   📄 [Prescription Attached: ${i.prescription.fileName}]`;
        }
        return line;
      })
      .join('\n');

    const paymentMethodStr = paymentMethod === 'upi_online'
      ? `Online Payment (UPI/GPay/PhonePe)`
      : paymentMethod === 'wallet'
      ? `Store Wallet Payment`
      : `Cash on Delivery (COD)`;

    const txIdToUse = overrideTxId || paymentTransactionId || (paymentMethod === 'upi_online' ? 'UPI_DIRECT' : '');

    const snapshot = {
      itemsText,
      subtotal,
      deliveryFee: currentDeliveryFee,
      grandTotal,
      slotTimeStr,
      notes,
      customerPhoneStr: cleanCustPhone,
      paymentMethodStr,
      transactionIdStr: txIdToUse,
    };

    setPlacedSnapshot(snapshot);

    const success = await onPlaceOrder(notes, deliveryType, slotTimeStr, currentDeliveryFee, paymentMethod, txIdToUse);
    clearPendingUpiCheckout();
    setIsPlacing(false);
    setIsWaitingUpiReturn(false);
    if (success) {
      setOrderSuccess(true);

      // WhatsApp Message Formatting
      const waText = `🛍️ *ORDER CONFIRMATION - ${storeName}*\n\n` +
        `👤 *Customer:* ${custNameInput ? `${custNameInput} (+${cleanCustPhone})` : `+${cleanCustPhone}`}\n` +
        `📅 *Delivery Slot:* ${slotTimeStr}\n` +
        `💳 *Payment Method:* ${paymentMethodStr}\n` +
        (txIdToUse ? `🔢 *UTR / Ref No:* ${txIdToUse}\n` : '') +
        `\n📦 *Order Items:*\n${itemsText}\n\n` +
        `🚚 *Delivery Fee:* ${currentDeliveryFee === 0 ? 'FREE' : '₹' + currentDeliveryFee}\n` +
        `💵 *Grand Total:* ₹${grandTotal}\n` +
        (notes ? `📝 *Notes:* ${notes}\n\n` : '\n') +
        `Thank you for ordering with us!`;

      const encodedWaText = encodeURIComponent(waText);
      const customerWaUrl = `https://wa.me/${cleanCustPhone}?text=${encodedWaText}`;
      const storeWaUrl = `https://wa.me/${storeWaPhone}?text=${encodedWaText}`;
      const superAdminWaUrl = `https://wa.me/${superAdminWaPhone}?text=${encodedWaText}`;

      // Auto-launch WhatsApp if enabled in settings
      if (settings?.customer_wa_auto_open !== false) {
        const targetUrl = settings?.whatsapp_mode === 'store_only' ? storeWaUrl : customerWaUrl;
        window.open(targetUrl, '_blank');
        if (superAdminWaPhone !== storeWaPhone && settings?.whatsapp_mode === 'both') {
          setTimeout(() => {
            window.open(superAdminWaUrl, '_blank');
          }, 800);
        }
      }
    }
  };

  // Automatic Order Processing on return from UPI App
  const isPlacingRef = useRef(isPlacing);
  isPlacingRef.current = isPlacing;

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && isWaitingUpiReturn && !isPlacingRef.current) {
        const pending = getPendingUpiCheckout();
        if (pending) {
          handleCheckout('UPI_RETURN_AUTO');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isWaitingUpiReturn, custPhoneInput, custNameInput, notes, deliveryType, selectedSlot, currentDeliveryFee, paymentMethod, paymentTransactionId]);

  const handleResetSuccess = () => {
    setOrderSuccess(false);
    setNotes('');
    setPlacedSnapshot(null);
    onClose();
  };

  // Floating sticky bottom bar when cart drawer is closed but cart is not empty
  if (!isOpen) {
    if (totalItems === 0) return null;
    return (
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-center justify-between z-40 shadow-xl border border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs">
            {totalItems}
          </div>
          <div className="text-start">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</div>
            <div className="text-sm font-black text-emerald-400" dir="ltr">₹{subtotal}</div>
          </div>
        </div>

        <button
          onClick={onOpenCart || onClose}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[88vh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Fixed Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">Your Cart & Checkout</h3>
            {totalItems > 0 && (
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderSuccess ? (
          <div className="flex-1 overflow-y-auto p-6 text-center space-y-5 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 font-medium">
                നിങ്ങളുടെ ഓർഡർ വിജയകരമായി സബ്മിറ്റ് ചെയ്തു!
              </p>
            </div>

            {/* Order Brief Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-start space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Order ID:</span>
                <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {placedSnapshot?.orderId || 'ORD-SUCCESS'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Total Amount:</span>
                <span className="font-black text-emerald-600 text-sm">
                  ₹{placedSnapshot?.grandTotal || 0}
                </span>
              </div>
              {placedSnapshot?.slotTimeStr && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-bold">Delivery Slot:</span>
                  <span className="font-bold text-slate-800">{placedSnapshot.slotTimeStr}</span>
                </div>
              )}
            </div>

            {/* Mode-Dependent WhatsApp Notification Status */}
            {settings?.whatsapp_mode === 'direct' ? (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Direct WhatsApp Handoff</span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium">
                  ഓർഡർ സംഗ്രഹം കടയുടമയുടെ വാട്സാപ്പിൽ അയക്കാനായി താഴെയുള്ള ബട്ടണിൽ ക്ലിക്ക് ചെയ്യുക.
                </p>
                <a
                  href={`https://wa.me/${(settings?.store_whatsapp_phone || settings?.store_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `🛍️ *NEW ORDER - ${settings?.store_name || 'WhatsApp Store'}*\n\n` +
                    `📋 *Order ID:* ${placedSnapshot?.orderId || 'ORD-SUCCESS'}\n` +
                    `👤 *Customer:* ${custNameInput ? `${custNameInput} (+${placedSnapshot?.customerPhoneStr || custPhoneInput})` : `+${placedSnapshot?.customerPhoneStr || custPhoneInput}`}\n` +
                    `📅 *Delivery Slot:* ${placedSnapshot?.slotTimeStr || ''}\n` +
                    `💳 *Payment Method:* ${placedSnapshot?.paymentMethodStr || ''}\n\n` +
                    `📦 *Items:*\n${placedSnapshot?.itemsText || ''}\n\n` +
                    `🚚 *Delivery Fee:* ${placedSnapshot?.deliveryFee === 0 ? 'FREE' : '₹' + (placedSnapshot?.deliveryFee || 0)}\n` +
                    `💵 *Grand Total:* ₹${placedSnapshot?.grandTotal || 0}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-white font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer block"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Continue to WhatsApp (വാട്സാപ്പിലേക്ക് തുടരുക)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </a>
              </div>
            ) : (
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Automatic WhatsApp Dispatch</span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium">
                  Order notifications are being processed automatically.
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  ഓർഡർ വിവരങ്ങൾ വാട്സാപ്പിൽ ഓട്ടോമാറ്റിക്കായി അയക്കുന്നതാണ്.
                </p>
              </div>
            )}

            <button
              onClick={handleResetSuccess}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-xl text-xs cursor-pointer transition-colors"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <>
            {/* Unified Scrollable Middle Content Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {/* Cart Items List */}
              <div className="p-3.5 sm:p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-semibold text-xs">Your cart is empty.</div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartId} className="pt-2.5 first:pt-0 space-y-2 text-start">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate" dir="auto">
                            {item.name} {item.variantName ? `(${item.variantName})` : ''}
                          </h4>
                          <div className="text-xs font-black text-emerald-600" dir="ltr">₹{item.price * item.qty}</div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                          <button
                            onClick={() => onUpdateQty(item.cartId, -1)}
                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-1">{item.qty}</span>
                          <button
                            onClick={() => onUpdateQty(item.cartId, 1)}
                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* ITEM-WISE PRESCRIPTION UPLOAD */}
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
                        {item.prescription ? (
                          <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-lg text-xs font-bold">
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{item.prescription.fileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onAttachItemPrescription?.(item.cartId, undefined)}
                              className="text-rose-600 hover:bg-rose-100 p-1 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
                              title="Remove prescription"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-extrabold px-2 py-1 rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                            <UploadCloud className="w-3 h-3 text-emerald-600" />
                            <span>Attach Prescription (PDF, JPG, PNG, DOC)</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePrescriptionFileUpload(item.cartId, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* COLLAPSIBLE & COMPACT DELIVERY TIME SLOT SELECTION SECTION */}
              <div className="p-3 bg-emerald-50/40 border-t border-b border-emerald-100/60">
                {!isDeliverySectionOpen ? (
                  /* Collapsed Slim Delivery Summary Bar */
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800 text-[11px] truncate" dir="auto">
                        {deliveryType === 'urgent'
                          ? `അർജന്റ് ഡെലിവറി (+₹${expressFee})`
                          : `${selectedSlot?.time} (${selectedSlot?.fee === 0 ? 'ഫ്രീ ഡെലിവറി' : '₹' + selectedSlot?.fee})`}
                      </span>
                      {deliveryType === 'scheduled' && isSlotExpired(selectedSlot?.time) && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-extrabold border border-rose-200 shrink-0">
                          സമയം കഴിഞ്ഞു
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeliverySectionOpen(true)}
                      className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
                    >
                      <span>ഡെലിവറി മാറ്റുക</span>
                      <ChevronDown className="w-3 h-3 text-emerald-700" />
                    </button>
                  </div>
                ) : (
                  /* Expanded Delivery Selection Box */
                  <div className="space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span dir="auto">ഡെലിവറി സമയം (Delivery Options)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsDeliverySectionOpen(false)}
                        className="text-[10px] font-extrabold text-slate-700 hover:text-slate-900 bg-slate-200/90 hover:bg-slate-200 px-2 py-0.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        title="Close Delivery Options"
                      >
                        <X className="w-3 h-3" />
                        <span>ക്ലോസ്</span>
                      </button>
                    </div>

                    {/* Delivery Mode Choice Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Option 1: Scheduled Batch Delivery */}
                      <button
                        type="button"
                        onClick={() => setDeliveryType('scheduled')}
                        className={`p-2 rounded-xl border text-start transition-all cursor-pointer ${
                          deliveryType === 'scheduled'
                            ? 'border-emerald-600 bg-white shadow-xs'
                            : 'border-slate-200 bg-slate-50/80 opacity-80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-900">
                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Batch Delivery</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold" dir="auto">
                          {selectedSlot?.fee === 0 ? 'ഫ്രീ ഡെലിവറി' : `₹${selectedSlot?.fee || 0}`}
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium truncate">
                          {selectedSlot?.time} Slot
                        </div>
                      </button>

                      {/* Option 2: Urgent Express Delivery */}
                      <button
                        type="button"
                        onClick={() => setDeliveryType('urgent')}
                        className={`p-2 rounded-xl border text-start transition-all cursor-pointer ${
                          deliveryType === 'urgent'
                            ? 'border-orange-500 bg-white shadow-xs'
                            : 'border-slate-200 bg-slate-50/80 opacity-80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-900">
                          <Zap className="w-3 h-3 text-orange-500 shrink-0" />
                          <span dir="auto">അർജന്റ് ഡെലിവറി</span>
                        </div>
                        <div className="text-[10px] text-orange-600 font-bold">
                          +₹{expressFee} Fee
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium truncate">
                          Priority Dispatch
                        </div>
                      </button>
                    </div>

                    {/* Scheduled Time Slots List */}
                    {deliveryType === 'scheduled' && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-slate-700 mb-1" dir="auto">
                          ലഭ്യമായ സമയ ബാച്ച് (Select Time Slot):
                        </label>
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {activeSlots.map((slot) => {
                            const expired = isSlotExpired(slot.time);
                            const isSelected = selectedSlotId === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={expired}
                                onClick={() => {
                                  if (!expired) setSelectedSlotId(slot.id);
                                }}
                                className={`w-full p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                                  expired
                                    ? 'bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                    : isSelected
                                    ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-xs cursor-pointer'
                                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span dir="ltr">{slot.time}</span>
                                  <span className="text-[10px] opacity-80 font-normal truncate" dir="auto">({slot.label})</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                  {expired ? (
                                    <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-200">
                                      സമയം കഴിഞ്ഞു
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                      dir="ltr"
                                    >
                                      {slot.fee === 0 ? 'FREE' : `₹${slot.fee}`}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD SELECTION SECTION */}
              <div className="p-3.5 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span dir="auto">പേയ്മെന്റ് രീതി (Payment Option)</span>
                  </label>
                  <span className="text-[9px] font-extrabold bg-slate-200/90 text-slate-700 px-2 py-0.5 rounded-full">
                    Zero Fees
                  </span>
                </div>

                {/* Compact Horizontal Payment Selector Chips */}
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Option 1: Cash on Delivery */}
                  {(settings?.cod_enabled !== false) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-extrabold text-[11px] text-slate-900">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>COD</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold truncate mt-0.5">
                        ക്യാഷ്
                      </div>
                    </button>
                  )}

                  {/* Option 2: Online Payment (UPI) */}
                  {(settings?.upi_enabled !== false) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_online')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi_online'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-extrabold text-[11px] text-slate-900">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>UPI</span>
                      </div>
                      <div className="text-[9px] text-emerald-700 font-extrabold truncate mt-0.5">
                        GPay / QR
                      </div>
                    </button>
                  )}

                  {/* Option 3: Store Wallet Payment */}
                  {(settings?.wallet_enabled !== false) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'wallet'
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-extrabold text-[11px] text-purple-900">
                        <Wallet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Wallet</span>
                      </div>
                      <div className="text-[9px] text-purple-700 font-extrabold truncate mt-0.5">
                        ₹{settings?.wallet_demo_balance || 500}
                      </div>
                    </button>
                  )}
                </div>

                {/* Wallet Info Display */}
                {paymentMethod === 'wallet' && (
                  <div className="bg-purple-50/80 p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 flex items-center gap-2 animate-in fade-in">
                    <Wallet className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="leading-tight">
                      <div className="text-[11px]">Store Wallet Payment Active</div>
                      <div className="text-[10px] text-purple-700 font-medium">
                        ₹{grandTotal} debited from wallet (Bal: ₹{settings?.wallet_demo_balance || 500}).
                      </div>
                    </div>
                  </div>
                )}

                {/* Online Payment Detailed Guide & QR Scanner */}
                {paymentMethod === 'upi_online' && (
                  <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                      <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Online UPI Payment</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </div>

                    {/* UPI Intent Launcher Button for Mobile */}
                    {settings?.upi_id && (
                      <a
                        href={`upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(settings.upi_payee_name || settings.store_name || 'Store')}&am=${grandTotal}&cu=INR`}
                        onClick={handleLaunchUpi}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-200" />
                        <span>Pay ₹{grandTotal} via GPay / PhonePe</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                      </a>
                    )}

                    {isWaitingUpiReturn && (
                      <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-950 text-[11px] font-bold animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
                        <span>UPI പെയ്മെന്റ് പൂർത്തിയാക്കി തിരിച്ചെത്തുമ്പോൾ ഓർഡർ തനിയെ പ്രോസസ്സ് ആകും.</span>
                      </div>
                    )}

                    {/* QR Code Display if image provided */}
                    {settings?.upi_qr_image && (
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 text-center space-y-1">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          Scan to Pay (സ്കാൻ ചെയ്ത് പേ ചെയ്യാം)
                        </div>
                        <img
                          src={settings.upi_qr_image}
                          alt="Store UPI QR Code"
                          className="w-32 h-32 object-contain mx-auto rounded-lg border border-slate-100 shadow-2xs"
                        />
                        <div className="text-[10px] text-slate-600 font-extrabold">
                          {settings.upi_payee_name || settings.store_name}
                        </div>
                      </div>
                    )}

                    {/* Copy UPI ID and Phone Number */}
                    <div className="space-y-1 text-xs">
                      {settings?.upi_id && (
                        <div className="bg-white p-2 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 font-bold block">UPI ID:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">{settings.upi_id}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.upi_id!, 'upi')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      {settings?.upi_phone && (
                        <div className="bg-white p-2 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 font-bold block">GPay / PhonePe Number:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">+91 {settings.upi_phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.upi_phone!, 'phone')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transaction ID / UTR Input */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 mb-0.5">
                        UTR / Transaction Ref No (ഓപ്ഷണൽ):
                      </label>
                      <input
                        type="text"
                        value={paymentTransactionId}
                        onChange={(e) => setPaymentTransactionId(e.target.value)}
                        placeholder="e.g. 423819028120"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC CUSTOMER PHONE & DETAILS SECTION */}
              <div className="p-3.5 bg-emerald-50/60 border-t border-b border-emerald-100 space-y-2 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>കസ്റ്റമർ വിവരങ്ങൾ (Customer Contact)</span>
                  </label>
                  {isWhatsappLoggedIn ? (
                    <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-white" />
                      <span>വാട്സാപ്പിൽ രജിസ്റ്റർ ചെയ്ത നമ്പർ</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>

                {/* WHATSAPP LINK REGISTERED AUTO BANNER */}
                {isWhatsappLoggedIn && (
                  <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="leading-tight">
                      <div>നിങ്ങളുടെ ഈ നമ്പർ (+91 {customerPhone || custPhoneInput}) വാട്സാപ്പ് വഴി വിജയകരമായി രജിസ്റ്റർ ചെയ്തിരിക്കുന്നു.</div>
                      <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                        വാട്സാപ്പ് ലിങ്ക് വഴി വന്നതിനാൽ ഇനി നമ്പർ വീണ്ടും നൽകേണ്ടതില്ല.
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                      <span>വാട്സാപ്പ് നമ്പർ (WhatsApp Phone) <span className="text-rose-600">*</span></span>
                      {isWhatsappLoggedIn && (
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                          ഡിസേബിൾ ചെയ്തു
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        disabled={isWhatsappLoggedIn}
                        value={custPhoneInput}
                        onChange={(e) => {
                          setCustPhoneInput(e.target.value);
                          if (phoneError) setPhoneError('');
                        }}
                        placeholder="Enter 10-digit WhatsApp No"
                        className={`w-full pl-10 pr-3 py-2 border rounded-xl text-xs font-mono font-bold outline-none transition-all ${
                          isWhatsappLoggedIn
                            ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed select-none'
                            : phoneError
                            ? 'bg-white border-rose-500 ring-2 ring-rose-200 text-slate-900'
                            : 'bg-white border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-slate-900'
                        }`}
                      />
                    </div>
                    {phoneError && !isWhatsappLoggedIn && (
                      <p className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">
                      പേര് (Customer Name - Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isWhatsappLoggedIn && Boolean(custNameInput)}
                      value={custNameInput}
                      onChange={(e) => setCustNameInput(e.target.value)}
                      placeholder="E.g. Rahul, Tirur"
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${
                        isWhatsappLoggedIn && Boolean(custNameInput)
                          ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions Note */}
              <div className="p-3.5 bg-white">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  📝 SPECIAL INSTRUCTIONS (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g: Leave at door, call before delivery..."
                  rows={1}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  dir="auto"
                />
              </div>
            </div>

            {/* Sticky Fixed Bottom Action Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200/80 shadow-lg shrink-0 z-20">
              <div className="space-y-1 mb-2.5 text-slate-900 text-xs font-semibold">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Items Subtotal</span>
                  <span dir="ltr">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Delivery Fee</span>
                  <span className={currentDeliveryFee === 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-800 font-bold'} dir="ltr">
                    {currentDeliveryFee === 0 ? 'FREE' : `₹${currentDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="text-emerald-600" dir="ltr">₹{grandTotal}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0 || isPlacing}
                onClick={() => handleCheckout()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-75 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPlacing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>PLACING ORDER AUTOMATICALLY...</span>
                  </>
                ) : isWaitingUpiReturn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>WAITING FOR UPI RETURN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{`Confirm Order (₹${grandTotal}) & Send to WhatsApp`}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
