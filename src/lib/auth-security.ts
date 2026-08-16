import crypto from 'crypto';
import { AdminUser, VendorStore, StoreSettings, Customer } from '../types';

const APP_SALT = process.env.APP_KEY_SALT || 'hmq_production_secure_salt_v002';

/**
 * Creates a cryptographically secure hash of a password using PBKDF2 with SHA-256
 */
export function hashPassword(plainPassword: string): string {
  if (!plainPassword) return '';
  // If already hashed, return as is
  if (plainPassword.startsWith('$pbkdf2$')) return plainPassword;
  
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(plainPassword, salt + APP_SALT, 10000, 32, 'sha256').toString('hex');
  return `$pbkdf2$${salt}$${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored password string (supporting PBKDF2, legacy SHA-256, and legacy plaintext migration)
 */
export function verifyPassword(plainPassword: string, storedPasswordHash: string): { matched: boolean; needsRehash: boolean } {
  if (!plainPassword || !storedPasswordHash) {
    return { matched: false, needsRehash: false };
  }

  // 1. Modern PBKDF2 Format: $pbkdf2$salt$hash
  if (storedPasswordHash.startsWith('$pbkdf2$')) {
    const parts = storedPasswordHash.split('$');
    if (parts.length === 4) {
      const salt = parts[2];
      const expectedKey = parts[3];
      const derivedKey = crypto.pbkdf2Sync(plainPassword, salt + APP_SALT, 10000, 32, 'sha256').toString('hex');
      try {
        const a = Buffer.from(derivedKey, 'hex');
        const b = Buffer.from(expectedKey, 'hex');
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return { matched: true, needsRehash: false };
        }
      } catch {
        return { matched: false, needsRehash: false };
      }
    }
  }

  // 2. Legacy SHA-256 Hash Check (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(storedPasswordHash)) {
    const directSha = crypto.createHash('sha256').update(plainPassword).digest('hex');
    if (directSha.toLowerCase() === storedPasswordHash.toLowerCase()) {
      return { matched: true, needsRehash: true };
    }
  }

  // 3. Legacy Plaintext Check (for seamless migration from older data_store.json)
  if (plainPassword === storedPasswordHash) {
    return { matched: true, needsRehash: true };
  }

  return { matched: false, needsRehash: false };
}

/**
 * Strips password and sensitive keys before sending user object to client
 */
export function sanitizeUser(user: AdminUser): Omit<AdminUser, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

/**
 * Strips password and private credentials before sending store object to client
 */
export function sanitizeStore(store: VendorStore): Omit<VendorStore, 'password'> {
  const { password, ...rest } = store;
  return rest;
}

/**
 * Strips admin credentials from public settings payload
 */
export function sanitizeSettingsForPublic(settings: StoreSettings): Partial<StoreSettings> {
  const sanitized = { ...settings };
  delete (sanitized as any).admin_password;
  delete (sanitized as any).admin_pin;
  delete (sanitized as any).admin_username;
  delete (sanitized as any).n8n_webhook_secret;
  return sanitized;
}
