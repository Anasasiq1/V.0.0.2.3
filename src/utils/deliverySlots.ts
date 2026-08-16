/**
 * Delivery Slot Time & Expiry Validation Engine
 * 
 * Timezone: Asia/Kolkata (IST / UTC+05:30)
 * Deterministic cut-off logic for batch deliveries.
 */

export interface ISTTimeInfo {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  dateStr: string; // YYYY-MM-DD in IST
  formattedTime: string;
}

/**
 * Returns current timestamp information in Asia/Kolkata (IST / UTC+05:30).
 * Does not depend on the user's browser device clock when run on server or client.
 */
export function getCurrentISTTime(): ISTTimeInfo {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = istFormatter.formatToParts(now);
  let hour = 0;
  let minute = 0;
  let second = 0;
  let year = '';
  let month = '';
  let day = '';

  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
    if (part.type === 'second') second = parseInt(part.value, 10);
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
  }

  // Handle midnight 24 edge case in some ICU formats
  if (hour >= 24) hour = 0;

  const totalMinutes = hour * 60 + minute;
  const dateStr = `${year}-${month}-${day}`;
  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} IST`;

  return {
    hours: hour,
    minutes: minute,
    seconds: second,
    totalMinutes,
    dateStr,
    formattedTime,
  };
}

/**
 * Parses any delivery slot time string and extracts the cutoff / batch time in total minutes (0-1439).
 * Handles formats like:
 * - "11:00 AM"
 * - "12:00 PM"
 * - "01:00 PM"
 * - "11:00 AM - 12:00 PM"
 * - "12:00 PM Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)"
 * - "11:00 AM (Morning Slot)"
 */
export function parseSlotTotalMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;

  // Regex matching 12-hour format e.g. 11:00 AM, 12 PM, 1:30 pm
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;
  const matches = Array.from(timeStr.matchAll(timeRegex));

  if (matches.length === 0) {
    // Attempt 24-hour format match e.g. "14:00"
    const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const m = parseInt(match24[2], 10);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        return h * 60 + m;
      }
    }
    return null;
  }

  // If time range exists (e.g. "10:00 AM - 11:00 AM"), take the batch end cutoff time (the last match).
  // If single time (e.g. "11:00 AM"), take that time.
  const targetMatch = matches[matches.length - 1];
  let hours = parseInt(targetMatch[1], 10);
  const minutes = targetMatch[2] ? parseInt(targetMatch[2], 10) : 0;
  const ampm = targetMatch[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Checks whether a batch delivery slot is expired based on current IST time.
 * Exact boundary: At or after the batch end time, the slot is strictly EXPIRED.
 * 
 * Example:
 * 11:00 AM batch:
 * At 10:59 AM IST -> Available (false)
 * At 11:00 AM IST -> Expired (true)
 * At 11:01 AM IST -> Expired (true)
 */
export function isSlotExpired(timeStr: string, slotDateStr?: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;

  // Urgent/Express delivery is not a scheduled batch slot, never expired
  const lower = timeStr.toLowerCase();
  if (lower.includes('urgent') || lower.includes('express')) {
    return false;
  }

  const slotMinutes = parseSlotTotalMinutes(timeStr);
  if (slotMinutes === null) return false;

  const currentIST = getCurrentISTTime();

  // If a specific slot date is provided (e.g. YYYY-MM-DD or DD/MM/YYYY)
  if (slotDateStr && typeof slotDateStr === 'string' && slotDateStr.trim()) {
    const normDate = normalizeDateStringToYMD(slotDateStr.trim());
    if (normDate) {
      if (normDate < currentIST.dateStr) {
        // Past date -> strictly expired
        return true;
      }
      if (normDate > currentIST.dateStr) {
        // Future date -> not expired
        return false;
      }
      // Same day -> check time below
    }
  }

  // Today: If current IST total minutes >= slot total minutes, it is expired!
  return currentIST.totalMinutes >= slotMinutes;
}

/**
 * Helper to normalize date string to YYYY-MM-DD
 */
function normalizeDateStringToYMD(dateStr: string): string | null {
  // Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback try standard Date parsing
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Server-Side & Client-Side Batch Delivery Validator.
 * Rejects expired or invalid batch slots.
 */
export function validateDeliverySlot(
  deliveryType?: 'scheduled' | 'urgent' | string,
  slotTimeStr?: string,
  slotDateStr?: string
): { isValid: boolean; error?: string; code?: string } {
  // If delivery type is urgent or express, no batch time expiry check needed
  if (deliveryType === 'urgent' || deliveryType === 'express') {
    return { isValid: true };
  }

  if (!slotTimeStr || !slotTimeStr.trim()) {
    // If not urgent and no slot selected
    return {
      isValid: false,
      error: 'Please select an available Batch Delivery time slot.',
      code: 'SLOT_REQUIRED',
    };
  }

  // If slot time string explicitly contains urgent, treat as urgent
  const lower = slotTimeStr.toLowerCase();
  if (lower.includes('urgent') || lower.includes('express')) {
    return { isValid: true };
  }

  if (isSlotExpired(slotTimeStr, slotDateStr)) {
    return {
      isValid: false,
      error: 'This delivery batch has expired. Please select another available batch.',
      code: 'BATCH_EXPIRED',
    };
  }

  return { isValid: true };
}
