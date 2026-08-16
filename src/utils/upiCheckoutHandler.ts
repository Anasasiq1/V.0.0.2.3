import { CartItem } from '../types';

export interface PendingUpiCheckout {
  timestamp: number;
  phone: string;
  name: string;
  notes: string;
  deliveryType: 'scheduled' | 'urgent';
  deliverySlotTime?: string;
  deliveryFee: number;
  paymentMethod: 'upi_online';
  cart: CartItem[];
  totalAmount: number;
  storeId?: string;
}

const STORAGE_KEY = 'hyperlocal_pending_upi_checkout';

/**
 * Saves active checkout state before launching external UPI app (GPay / PhonePe)
 */
export function savePendingUpiCheckout(data: Omit<PendingUpiCheckout, 'timestamp'>): void {
  try {
    const payload: PendingUpiCheckout = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (data.phone) {
      localStorage.setItem('hyperlocal_customer_phone', data.phone);
    }
    if (data.name) {
      localStorage.setItem('hyperlocal_customer_name', data.name);
    }
  } catch (err) {
    console.error('Failed to save pending UPI checkout:', err);
  }
}

/**
 * Retrieves valid pending UPI checkout if customer has returned within 30 minutes
 */
export function getPendingUpiCheckout(): PendingUpiCheckout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: PendingUpiCheckout = JSON.parse(raw);
    const ageMs = Date.now() - parsed.timestamp;
    // Valid for 30 minutes
    if (ageMs > 30 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Clears pending UPI checkout state
 */
export function clearPendingUpiCheckout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
