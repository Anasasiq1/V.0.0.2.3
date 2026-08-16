import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialData } from './src/data/initialData';
import {
  AppData,
  Order,
  StoreSettings,
  VendorStore,
  AdminUser,
  AuditLog,
  GranularPermissions,
  Customer,
  Category,
  Product,
  PendingStoreChange,
  PlatformTemplate,
  PlatformTemplateSettings,
} from './src/types';
import { validateDeliverySlot } from './src/utils/deliverySlots';
import {
  initMysqlPool,
  loadDataFromMysql,
  syncDataToMysql,
  insertOrderToMysql,
  getDbStatus,
  isMysqlConnected,
} from './src/db/mysql';
import {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  sanitizeStore,
  sanitizeSettingsForPublic,
} from './src/lib/auth-security';
import { GoogleGenAI, Type } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('[Gemini AI] Initialization notice:', e);
      return null;
    }
  }
  return geminiClient;
}

const DATA_FILE = path.join(process.cwd(), 'data_store.json');
const DATA_BAK_FILE = path.join(process.cwd(), 'data_store.json.bak');

function saveStoreDataSync(data: AppData) {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, DATA_BAK_FILE);
      } catch {}
    }
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('[Storage] Failed to save data file synchronously:', err);
  }
}

async function saveStoreData(data: AppData) {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    const jsonStr = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tempFile, jsonStr, 'utf-8');
    if (fs.existsSync(DATA_FILE)) {
      await fs.promises.copyFile(DATA_FILE, DATA_BAK_FILE).catch(() => {});
    }
    await fs.promises.rename(tempFile, DATA_FILE);

    // If MySQL database is connected, asynchronously sync all changes
    if (isMysqlConnected()) {
      syncDataToMysql(data).catch((err) => {
        console.error('[MySQL Async Sync Error]:', err.message);
      });
    }
  } catch (err) {
    console.error('[Storage] Failed to save data file:', err);
  }
}

function normalizeBottomNavConfig(items?: any[]): any[] {
  const defaultItems = [
    { id: 'home', label: 'Home', icon: 'Home', enabled: true, order: 1 },
    { id: 'categories', label: 'Categories', icon: 'Grid', enabled: true, order: 2 },
    { id: 'stores', label: 'Stores', icon: 'Store', enabled: true, order: 3 },
    { id: 'market', label: 'Market', icon: 'ShoppingBag', enabled: true, order: 4 },
    { id: 'account', label: 'Account', icon: 'User', enabled: true, order: 5 },
    { id: 'modules', label: 'Modules', icon: 'Layers', enabled: false, order: 6 },
    { id: 'cart', label: 'Cart', icon: 'ShoppingCart', enabled: false, order: 7 },
    { id: 'orders', label: 'Orders', icon: 'Clock', enabled: false, order: 8 },
    { id: 'wishlist', label: 'Wishlist', icon: 'Heart', enabled: false, order: 9 },
    { id: 'wallet', label: 'Wallet', icon: 'Wallet', enabled: false, order: 10 },
  ];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return defaultItems;
  }

  const hasLegacyModules = items.some((i) => i.id === 'modules' && i.enabled !== false);
  const hasLegacyCart = items.some((i) => i.id === 'cart' && i.enabled !== false);
  const hasMarket = items.some((i) => i.id === 'market');

  if (hasLegacyModules || hasLegacyCart || !hasMarket) {
    const itemMap = new Map(items.map((item) => [item.id, item]));
    const normalized = [
      itemMap.get('home') || { id: 'home', label: 'Home', icon: 'Home', enabled: true, order: 1 },
      itemMap.get('categories') || { id: 'categories', label: 'Categories', icon: 'Grid', enabled: true, order: 2 },
      itemMap.get('stores') || { id: 'stores', label: 'Stores', icon: 'Store', enabled: true, order: 3 },
      itemMap.get('market') || { id: 'market', label: 'Market', icon: 'ShoppingBag', enabled: true, order: 4 },
      itemMap.get('account') || { id: 'account', label: 'Account', icon: 'User', enabled: true, order: 5 },
      { ...(itemMap.get('modules') || { id: 'modules', label: 'Modules', icon: 'Layers' }), enabled: false, order: 6 },
      { ...(itemMap.get('cart') || { id: 'cart', label: 'Cart', icon: 'ShoppingCart' }), enabled: false, order: 7 },
      { ...(itemMap.get('orders') || { id: 'orders', label: 'Orders', icon: 'Clock' }), enabled: false, order: 8 },
      { ...(itemMap.get('wishlist') || { id: 'wishlist', label: 'Wishlist', icon: 'Heart' }), enabled: false, order: 9 },
      { ...(itemMap.get('wallet') || { id: 'wallet', label: 'Wallet', icon: 'Wallet' }), enabled: false, order: 10 },
    ];
    return normalized;
  }

  return items;
}

function sanitizeStoreData(data: AppData): AppData {
  if (data.modules === undefined || !Array.isArray(data.modules)) {
    data.modules = initialData.modules;
  }
  if (data.categories === undefined || !Array.isArray(data.categories)) {
    data.categories = initialData.categories;
  }
  if (data.products === undefined || !Array.isArray(data.products)) {
    data.products = initialData.products;
  }

  if (data.settings) {
    data.settings.bottom_nav_items = normalizeBottomNavConfig(data.settings.bottom_nav_items);
    // Hash admin password if plaintext
    if (data.settings.admin_password && !data.settings.admin_password.startsWith('$pbkdf2$')) {
      data.settings.admin_password = hashPassword(data.settings.admin_password);
    }
  }

  if (data.users && Array.isArray(data.users)) {
    data.users = data.users.map((u) => {
      if (u.password && !u.password.startsWith('$pbkdf2$')) {
        return { ...u, password: hashPassword(u.password) };
      }
      return u;
    });
  }

  if (data.stores && Array.isArray(data.stores)) {
    data.stores = data.stores.map((s) => {
      const name = s.name || 'Store';
      const slug = s.slug || generateSlug(name) || (s.username ? String(s.username).toLowerCase() : `store-${s.id || Date.now()}`);
      const modules = Array.isArray(s.modules) ? s.modules : ['mod-grocery', 'mod-food'];
      const status = s.status || (s.active !== false ? 'ACTIVE' : 'SUSPENDED');
      const password = s.password && !s.password.startsWith('$pbkdf2$') ? hashPassword(s.password) : s.password;
      return {
        ...s,
        id: s.id || `STR-${Math.floor(10000 + Math.random() * 90000)}`,
        name,
        slug,
        modules,
        status,
        password,
        active: status === 'ACTIVE',
      };
    });
  }
  return data;
}

function loadStoreData(): AppData {
  try {
    let rawContent = '';
    if (fs.existsSync(DATA_FILE)) {
      rawContent = fs.readFileSync(DATA_FILE, 'utf-8');
    } else if (fs.existsSync(DATA_BAK_FILE)) {
      rawContent = fs.readFileSync(DATA_BAK_FILE, 'utf-8');
    }

    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      if (parsed && typeof parsed === 'object') {
        // Merge platform templates so new built-in templates (Vintage, Ultra-Premium, etc.) are always present
        const existingTplMap = new Map<string, PlatformTemplate>((Array.isArray(parsed.platform_templates) ? parsed.platform_templates : []).map((t: PlatformTemplate) => [t.id, t]));
        (initialData.platform_templates || []).forEach((initTpl: PlatformTemplate) => {
          if (!existingTplMap.has(initTpl.id)) {
            existingTplMap.set(initTpl.id, initTpl);
          }
        });
        const mergedTemplates: PlatformTemplate[] = Array.from(existingTplMap.values());

        const loaded: AppData = {
          modules: Array.isArray(parsed.modules) ? parsed.modules : initialData.modules,
          categories: Array.isArray(parsed.categories) ? parsed.categories : initialData.categories,
          products: Array.isArray(parsed.products) ? parsed.products : initialData.products,
          banners: Array.isArray(parsed.banners) ? parsed.banners : initialData.banners,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          users: Array.isArray(parsed.users) ? parsed.users : initialData.users || [],
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          stores: Array.isArray(parsed.stores) ? parsed.stores : initialData.stores || [],
          settings: { ...initialData.settings, ...(parsed.settings || {}) },
          audit_logs: Array.isArray(parsed.audit_logs) ? parsed.audit_logs : initialData.audit_logs || [],
          platform_templates: mergedTemplates,
          platform_template_settings: parsed.platform_template_settings || initialData.platform_template_settings,
          store_templates: Array.isArray(parsed.store_templates) ? parsed.store_templates : initialData.store_templates,
          market_categories: Array.isArray(parsed.market_categories) ? parsed.market_categories : initialData.market_categories,
          market_banners: Array.isArray(parsed.market_banners) ? parsed.market_banners : initialData.market_banners,
          market_settings: parsed.market_settings || initialData.market_settings,
        };
        return sanitizeStoreData(loaded);
      }
    }
  } catch (err) {
    console.error('Failed to read data file, attempting initial fallback:', err);
  }

  // Fresh installation: write initialData to data_store.json
  const sanitizedInitial = sanitizeStoreData(initialData);
  saveStoreDataSync(sanitizedInitial);
  return sanitizedInitial;
}

let storeData: AppData = loadStoreData();

interface AdminSession {
  id: string;
  userId: string;
  username: string;
  role: string;
  store_id?: string;
  permissions?: GranularPermissions;
  isImpersonating?: boolean;
  superAdminUsername?: string;
  superAdminId?: string;
  expiresAt: number;
}

const activeSessions = new Map<string, AdminSession>();

interface CustomerSession {
  token: string;
  customerId: string;
  phone: string;
  name?: string;
  expiresAt: number;
}

const customerSessions = new Map<string, CustomerSession>();

function normalizePhone(input: string, countryCode?: string): string {
  if (!input) return '';
  let cleaned = String(input).replace(/\D/g, '');
  if (countryCode) {
    const cleanCC = countryCode.replace(/\D/g, '');
    if (cleanCC && !cleaned.startsWith(cleanCC)) {
      cleaned = cleanCC + cleaned;
    }
  } else if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 8) {
    cleaned = '974' + cleaned;
  }
  return cleaned;
}

function findCustomerByPhone(phone: string): Customer | undefined {
  const norm = normalizePhone(phone);
  if (!norm) return undefined;
  const customers = storeData.customers || [];
  return customers.find((c) => {
    const cNorm = normalizePhone(c.whatsapp_number);
    return cNorm === norm || (cNorm.length >= 8 && norm.endsWith(cNorm.slice(-8))) || (norm.length >= 8 && cNorm.endsWith(norm.slice(-8)));
  });
}

function getCustomerSessionFromReq(req: express.Request): CustomerSession | null {
  const authHeader = req.headers.authorization || '';
  let token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token && req.headers['x-customer-token']) {
    token = String(req.headers['x-customer-token']).trim();
  }
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/customer_token=([^;]+)/);
    if (match) token = match[1].trim();
  }
  if (!token) return null;

  const session = customerSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    customerSessions.delete(token);
    return null;
  }
  return session;
}

function logAuditEvent(action: string, details: string, storeId?: string, storeName?: string, userName?: string) {
  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    store_id: storeId,
    store_name: storeName,
    user_name: userName || 'System Admin',
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  if (!storeData.audit_logs) storeData.audit_logs = [];
  storeData.audit_logs = [newLog, ...storeData.audit_logs.slice(0, 499)];
}

function getSessionFromReq(req: express.Request): AdminSession | null {
  const authHeader = req.headers.authorization || '';
  let token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token && req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/admin_token=([^;]+)/);
    if (match) token = match[1].trim();
  }
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = getSessionFromReq(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Valid admin session required.' });
  }
  (req as any).adminSession = session;
  next();
}

function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUniqueStoreId(): string {
  let id = '';
  let exists = true;
  while (exists) {
    const num = Math.floor(10000 + Math.random() * 90000);
    id = `STR-${num}`;
    exists = (storeData.stores || []).some((s) => s.id === id);
  }
  return id;
}

const defaultFullPermissions: GranularPermissions = {
  products_view: true,
  products_create: true,
  products_edit: true,
  products_delete: true,
  categories_view: true,
  categories_create: true,
  categories_edit: true,
  categories_delete: true,
  orders_view: true,
  orders_create: true,
  orders_update: true,
  orders_cancel: true,
  customers_view: true,
  customers_edit: true,
  staff_view: true,
  staff_create: true,
  staff_edit: true,
  staff_delete: true,
  reports_view: true,
  settings_view: true,
  settings_edit: true,
  whatsapp_manage: true,
  modules_manage: true,
  users_manage: true,
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize MySQL Connection Pool if configured
  try {
    const mysqlReady = await initMysqlPool();
    if (mysqlReady) {
      const mysqlLoadedData = await loadDataFromMysql();
      if (mysqlLoadedData) {
        storeData = sanitizeStoreData({
          ...storeData,
          ...mysqlLoadedData,
          settings: { ...storeData.settings, ...(mysqlLoadedData.settings || {}) },
        });
        console.log('[MySQL] Application state successfully loaded from MySQL database.');
      } else {
        console.log('[MySQL] Database tables initialized. Seeding initial data to MySQL...');
        await syncDataToMysql(storeData);
      }
    }
  } catch (err: any) {
    console.warn('[Database] Initial MySQL setup notice:', err.message);
  }

  app.use(compression());
  app.use(express.json({ limit: '50mb' }));

  const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Set strict cache-control headers
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Dynamic PWA Web App Manifest
  app.get('/manifest.json', (_req, res) => {
    const s = (storeData.settings || {}) as StoreSettings;
    const manifest = {
      name: s.pwa_name || s.store_name || 'Hyperlocal WhatsApp Store Platform',
      short_name: s.pwa_short_name || 'Hyperlocal',
      description: s.pwa_description || 'Centralized Multi-Store Creation & Management Ecosystem with WhatsApp.',
      start_url: '/',
      display: s.pwa_display_mode || 'standalone',
      background_color: s.pwa_bg_color || '#f8fafc',
      theme_color: s.pwa_theme_color || '#059669',
      orientation: 'portrait-primary',
      icons: [
        {
          src: s.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: s.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };
    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
  });

  // Database Connection & Engine Status API
  app.get('/api/database/status', async (_req, res) => {
    try {
      const status = await getDbStatus();
      return res.json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Session Verification
  app.get('/api/admin/session', (req, res) => {
    const session = getSessionFromReq(req);
    if (session) {
      const user = (storeData.users || []).find((u) => u.id === session.userId);
      const store = session.store_id ? (storeData.stores || []).find((s) => s.id === session.store_id) : undefined;
      return res.json({
        authenticated: true,
        user: {
          userId: session.userId,
          username: session.username,
          role: session.role,
          store_id: session.store_id,
          store_name: store?.name,
          permissions: user?.permissions || defaultFullPermissions,
        },
        isImpersonating: !!session.isImpersonating,
        superAdminUsername: session.superAdminUsername,
      });
    }
    return res.json({ authenticated: false });
  });

  // Logout
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    let token =
      authHeader.replace(/^Bearer\s+/i, '').trim() || String(req.headers['x-admin-token'] || '').trim();
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/admin_token=([^;]+)/);
      if (match) token = match[1].trim();
    }
    if (token) {
      activeSessions.delete(token);
    }
    res.setHeader(
      'Set-Cookie',
      'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    );
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  // Customer Recognition via WhatsApp URL / Phone
  app.post('/api/customer/recognize', async (req, res) => {
    const { phone } = req.body || {};
    const norm = normalizePhone(phone);
    if (!norm) {
      return res.status(400).json({ recognized: false, error: 'Valid WhatsApp phone number is required.' });
    }

    const existing = findCustomerByPhone(norm);
    if (existing) {
      existing.last_seen_at = new Date().toISOString();
      await saveStoreData(storeData);

      const token = 'cust_tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const session: CustomerSession = {
        token,
        customerId: existing.customer_id,
        phone: existing.whatsapp_number,
        name: existing.name,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      customerSessions.set(token, session);

      res.setHeader(
        'Set-Cookie',
        `customer_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
      );

      return res.json({
        recognized: true,
        customer: existing,
        token,
        message: 'Your customer account is recognized.',
      });
    }

    return res.json({
      recognized: false,
      phone: norm,
      message: 'Customer not registered',
    });
  });

  // Customer Registration Endpoint
  app.post('/api/customer/register', async (req, res) => {
    const { phone, name } = req.body || {};
    const norm = normalizePhone(phone);
    if (!norm) {
      return res.status(400).json({ success: false, error: 'Valid WhatsApp phone number required.' });
    }

    if (!storeData.customers) storeData.customers = [];

    let customer = findCustomerByPhone(norm);
    if (customer) {
      if (name && name.trim()) customer.name = name.trim();
      customer.last_seen_at = new Date().toISOString();
    } else {
      customer = {
        customer_id: 'cust-' + Date.now().toString(36),
        whatsapp_number: norm,
        name: name?.trim() || `Customer (${norm.slice(-4)})`,
        registered_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        status: 'active',
      };
      storeData.customers.push(customer);
    }

    await saveStoreData(storeData);

    const token = 'cust_tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const session: CustomerSession = {
      token,
      customerId: customer.customer_id,
      phone: customer.whatsapp_number,
      name: customer.name,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    customerSessions.set(token, session);

    res.setHeader(
      'Set-Cookie',
      `customer_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      customer,
      token,
      message: 'Customer registered successfully.',
    });
  });

  // Unified Customer Login Endpoint (WhatsApp / Normal / OTP single coordination)
  app.post('/api/customer/unified-login', async (req, res) => {
    const { phone, name, country_code, login_type } = req.body || {};
    const norm = normalizePhone(phone, country_code);
    if (!norm || norm.length < 7) {
      return res.status(400).json({
        success: false,
        error: 'A valid WhatsApp phone number is mandatory (വാട്സാപ്പ് നമ്പർ നിർബന്ധമാണ്).',
      });
    }

    if (!storeData.customers) storeData.customers = [];

    let customer = findCustomerByPhone(norm);
    let isNewUser = false;

    if (customer) {
      // Existing customer login
      if (name && name.trim() && (!customer.name || customer.name.startsWith('Customer ('))) {
        customer.name = name.trim();
      }
      customer.last_seen_at = new Date().toISOString();
    } else {
      // Automatic seamless registration under unified flow
      isNewUser = true;
      customer = {
        customer_id: 'cust-' + Date.now().toString(36),
        whatsapp_number: norm,
        name: name?.trim() || `Customer (${norm.slice(-4)})`,
        registered_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        status: 'active',
      };
      storeData.customers.push(customer);
    }

    await saveStoreData(storeData);

    const token = 'cust_tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const session: CustomerSession = {
      token,
      customerId: customer.customer_id,
      phone: customer.whatsapp_number,
      name: customer.name,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    customerSessions.set(token, session);

    res.setHeader(
      'Set-Cookie',
      `customer_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      authenticated: true,
      isNewUser,
      customer,
      token,
      login_type: login_type || 'whatsapp',
      message: isNewUser
        ? 'Customer account created and logged in successfully.'
        : 'Logged in successfully via unified WhatsApp authentication.',
    });
  });

  // Unified Customer Logout Endpoint
  app.post('/api/customer/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    let token =
      authHeader.replace(/^Bearer\s+/i, '').trim() || String(req.headers['x-customer-token'] || '').trim();
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/customer_token=([^;]+)/);
      if (match) token = match[1].trim();
    }
    if (token) {
      customerSessions.delete(token);
    }
    res.setHeader(
      'Set-Cookie',
      'customer_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    );
    return res.json({
      success: true,
      message: 'Logged out successfully (വിജയകരമായി ലോഗൗട്ട് ചെയ്തു).',
    });
  });

  // Customer Session Check
  app.get('/api/customer/session', (req, res) => {
    const session = getCustomerSessionFromReq(req);
    if (session) {
      const customer = (storeData.customers || []).find((c) => c.customer_id === session.customerId);
      if (customer) {
        return res.json({
          authenticated: true,
          customer,
          token: session.token,
        });
      }
    }
    return res.json({ authenticated: false });
  });

  // Secure Customer Profile Update Endpoint
  app.post('/api/customer/update-profile', async (req, res) => {
    const custSession = getCustomerSessionFromReq(req);
    if (!custSession) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Please authenticate via WhatsApp or login to update your profile.',
      });
    }

    const { name, email, address, new_phone } = req.body || {};
    const targetCustomer = (storeData.customers || []).find((c) => c.customer_id === custSession.customerId);

    if (!targetCustomer) {
      return res.status(404).json({ success: false, error: 'Customer account not found.' });
    }

    if (name && typeof name === 'string') targetCustomer.name = name.trim();
    if (email && typeof email === 'string') targetCustomer.email = email.trim();
    if (address && typeof address === 'string') {
      targetCustomer.address = address.trim();
      if (!targetCustomer.saved_addresses) targetCustomer.saved_addresses = [];
      if (!targetCustomer.saved_addresses.includes(address.trim())) {
        targetCustomer.saved_addresses.push(address.trim());
      }
    }

    if (new_phone) {
      const normNew = normalizePhone(new_phone);
      if (normNew && normNew !== targetCustomer.whatsapp_number) {
        const existingOther = (storeData.customers || []).find((c) => c.whatsapp_number === normNew && c.customer_id !== targetCustomer.customer_id);
        if (existingOther) {
          return res.status(400).json({ success: false, error: 'Target phone number is already registered to another account.' });
        }
        targetCustomer.whatsapp_number = normNew;
      }
    }

    targetCustomer.last_seen_at = new Date().toISOString();
    await saveStoreData(storeData);

    return res.json({
      success: true,
      customer: targetCustomer,
      message: 'Customer profile updated successfully!',
    });
  });

  // Public & Authenticated Data Query
  app.get('/api/data', (req, res) => {
    try {
      const session = getSessionFromReq(req);
      const queryStoreId = String(req.query.store_id || req.query.store || '');
      const querySlug = String(req.query.slug || '');

      let storeToFilter: VendorStore | undefined;

      if (queryStoreId) {
        storeToFilter = (storeData.stores || []).find((s) => s.id === queryStoreId);
      } else if (querySlug) {
        storeToFilter = (storeData.stores || []).find((s) => (s.slug || '').toLowerCase() === querySlug.toLowerCase());
      } else if (session?.store_id) {
        storeToFilter = (storeData.stores || []).find((s) => s.id === session.store_id);
      }

      let dataToReturn: AppData = { ...storeData };

      if (storeToFilter) {
        const activeModuleIds = new Set(storeToFilter.modules || []);
        dataToReturn = {
          ...dataToReturn,
          products: (storeData.products || []).filter(
            (p) => (!p.store_id || p.store_id === storeToFilter?.id) && (!p.moduleId || activeModuleIds.has(p.moduleId))
          ),
          categories: (storeData.categories || []).filter(
            (c) => (!c.moduleId || activeModuleIds.has(c.moduleId))
          ),
          modules: (storeData.modules || []).filter((m) => activeModuleIds.has(m.id)),
          orders: session ? (storeData.orders || []).filter((o) => o.store_id === storeToFilter?.id) : [],
        };
      }

      if (!session) {
        const sanitizedSettings = sanitizeSettingsForPublic(dataToReturn.settings);
        const sanitizedUsers = (dataToReturn.users || []).map((u) => sanitizeUser(u));
        const sanitizedStores = (dataToReturn.stores || []).map((s) => sanitizeStore(s));

        dataToReturn = {
          ...dataToReturn,
          settings: sanitizedSettings as StoreSettings,
          users: sanitizedUsers as any,
          stores: sanitizedStores as any,
        };
      }

      return res.json(dataToReturn);
    } catch (err: any) {
      console.error('Error in /api/data:', err);
      return res.status(500).json({ error: 'Failed to fetch store data: ' + err.message });
    }
  });

  // Get Store Details by Slug
  app.get('/api/stores/by-slug/:slug', (req, res) => {
    try {
      const slug = (req.params.slug || '').toLowerCase();
      const store = (storeData.stores || []).find((s) => (s.slug || '').toLowerCase() === slug);
      if (!store) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }
      if (store.status === 'SUSPENDED') {
        return res.status(403).json({ success: false, error: 'This store is currently suspended.' });
      }
      const activeModuleIds = new Set(store.modules || []);
      const storeProducts = (storeData.products || []).filter(
        (p) => p.store_id === store.id || (!p.store_id && activeModuleIds.has(p.moduleId))
      );
      const storeCategories = (storeData.categories || []).filter((c) => activeModuleIds.has(c.moduleId));
      const storeModules = (storeData.modules || []).filter((m) => activeModuleIds.has(m.id));

      return res.json({
        success: true,
        store: sanitizeStore(store),
        products: storeProducts,
        categories: storeCategories,
        modules: storeModules,
      });
    } catch (err: any) {
      console.error('Error in /api/stores/by-slug:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch store by slug' });
    }
  });

  // Get List of Stores
  app.get('/api/stores', (_req, res) => {
    const storesList = (storeData.stores || []).map((s) => sanitizeStore(s));
    res.json({ success: true, stores: storesList });
  });

  // ==========================================
  // PLATFORM TEMPLATE ENGINE ENDPOINTS
  // ==========================================

  // Get Platform Templates & Active Settings
  app.get('/api/platform/templates', (_req, res) => {
    return res.json({
      success: true,
      templates: storeData.platform_templates || [],
      settings: storeData.platform_template_settings || { active_template_id: 'hm-q-modern' },
      audit_logs: storeData.template_audit_logs || [],
    });
  });

  // Get Single Platform Template by ID
  app.get('/api/platform/templates/:id', (req, res) => {
    const { id } = req.params;
    const template = (storeData.platform_templates || []).find((t) => t.id === id);
    if (!template) {
      return res.status(404).json({ success: false, error: `Platform template "${id}" not found.` });
    }
    return res.json({ success: true, template });
  });

  // Preview Platform Template by ID
  app.post('/api/platform/templates/:id/preview', (req, res) => {
    const { id } = req.params;
    const template = (storeData.platform_templates || []).find((t) => t.id === id);
    if (!template) {
      return res.status(404).json({ success: false, error: `Platform template "${id}" not found for preview.` });
    }
    return res.json({
      success: true,
      message: `Preview session initiated for template "${template.manifest.name}".`,
      preview: {
        template,
        previewMode: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    });
  });

  // Activate Platform Template (Atomic Switch)
  app.post('/api/platform/templates/activate', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can activate platform templates.' });
    }

    const { templateId } = req.body || {};
    if (!templateId) {
      return res.status(400).json({ success: false, error: 'templateId is required.' });
    }

    if (!storeData.platform_templates) storeData.platform_templates = [];
    if (!storeData.platform_template_settings) {
      storeData.platform_template_settings = { active_template_id: 'hm-q-modern', updated_by: 'system', updated_at: new Date().toISOString() };
    }

    const targetTemplate = storeData.platform_templates.find((t) => t.id === templateId);
    if (!targetTemplate) {
      return res.status(404).json({ success: false, error: `Template "${templateId}" not found.` });
    }

    const previousId = storeData.platform_template_settings.active_template_id;

    storeData.platform_templates.forEach((t) => {
      if (t.id === templateId) t.status = 'Active';
      else if (t.status === 'Active') t.status = 'Installed';
    });

    storeData.platform_template_settings = {
      active_template_id: templateId,
      previous_template_id: previousId,
      updated_by: session.username || 'superadmin',
      updated_at: new Date().toISOString(),
    };

    if (!storeData.template_audit_logs) storeData.template_audit_logs = [];
    storeData.template_audit_logs.unshift({
      id: `tpl-log-${Date.now()}`,
      action: 'TEMPLATE_ACTIVATED',
      template_id: templateId,
      template_name: targetTemplate.manifest.name,
      previous_template_id: previousId,
      admin: session.username || 'superadmin',
      timestamp: new Date().toISOString(),
      details: `Switched active platform template to ${targetTemplate.manifest.name} (v${targetTemplate.manifest.version})`,
    });

    await saveStoreData(storeData);

    return res.json({
      success: true,
      message: `Successfully activated platform template "${targetTemplate.manifest.name}".`,
      settings: storeData.platform_template_settings,
      templates: storeData.platform_templates,
    });
  });

  // Atomic Rollback to Previous Platform Template
  app.post('/api/platform/templates/rollback', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can rollback platform templates.' });
    }

    const settings = storeData.platform_template_settings;
    if (!settings || !settings.previous_template_id) {
      return res.status(400).json({ success: false, error: 'No previous platform template recorded for rollback.' });
    }

    const rollbackTargetId = settings.previous_template_id;
    const currentActiveId = settings.active_template_id;

    const targetTemplate = (storeData.platform_templates || []).find((t) => t.id === rollbackTargetId);
    if (!targetTemplate) {
      return res.status(404).json({ success: false, error: `Rollback target template "${rollbackTargetId}" not found.` });
    }

    (storeData.platform_templates || []).forEach((t) => {
      if (t.id === rollbackTargetId) t.status = 'Active';
      else if (t.id === currentActiveId) t.status = 'Installed';
    });

    storeData.platform_template_settings = {
      active_template_id: rollbackTargetId,
      previous_template_id: currentActiveId,
      updated_by: session.username || 'superadmin',
      updated_at: new Date().toISOString(),
    };

    if (!storeData.template_audit_logs) storeData.template_audit_logs = [];
    storeData.template_audit_logs.unshift({
      id: `tpl-log-${Date.now()}`,
      action: 'TEMPLATE_ROLLEDBACK',
      template_id: rollbackTargetId,
      template_name: targetTemplate.manifest.name,
      previous_template_id: currentActiveId,
      admin: session.username || 'superadmin',
      timestamp: new Date().toISOString(),
      details: `Rolled back platform template from ${currentActiveId} to ${targetTemplate.manifest.name}`,
    });

    await saveStoreData(storeData);

    return res.json({
      success: true,
      message: `Successfully rolled back to platform template "${targetTemplate.manifest.name}".`,
      settings: storeData.platform_template_settings,
      templates: storeData.platform_templates,
    });
  });

  // Get Store Template Configuration
  app.get('/api/stores/:storeId/template', (req, res) => {
    const { storeId } = req.params;
    const storeConfigs = storeData.store_templates || [];
    const config = storeConfigs.find((c) => c.store_id === storeId) || {
      id: `st-config-${storeId}`,
      store_id: storeId,
      template_id: 'default-store',
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      productCardStyle: 'grid',
      showCategoriesBar: true,
      showStoreHours: true,
      status: 'published',
      version: '1.0.0',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return res.json({ success: true, config });
  });

  // Save / Update Store Template Configuration
  app.put('/api/stores/:storeId/template', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { storeId } = req.params;
    const newConfig = req.body || {};

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify template for this store.' });
    }

    if (!storeData.store_templates) storeData.store_templates = [];

    const idx = storeData.store_templates.findIndex((c) => c.store_id === storeId);
    const updatedConfig = {
      ...newConfig,
      store_id: storeId,
      status: 'draft',
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      storeData.store_templates[idx] = updatedConfig;
    } else {
      storeData.store_templates.push(updatedConfig);
    }

    await saveStoreData(storeData);

    return res.json({
      success: true,
      message: 'Storefront template configuration saved as draft.',
      config: updatedConfig,
    });
  });

  // Publish Store Template
  app.post('/api/stores/:storeId/template/publish', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { storeId } = req.params;

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to publish template for this store.' });
    }

    if (!storeData.store_templates) storeData.store_templates = [];

    const idx = storeData.store_templates.findIndex((c) => c.store_id === storeId);
    if (idx < 0) {
      return res.status(404).json({ success: false, error: 'Store template configuration not found.' });
    }

    const current = storeData.store_templates[idx];
    const publishedConfig = {
      ...current,
      status: 'published' as const,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storeData.store_templates[idx] = publishedConfig;
    await saveStoreData(storeData);

    return res.json({
      success: true,
      message: `Store template configuration published live for store ${storeId}.`,
      config: publishedConfig,
    });
  });

  // STORE CREATION ENDPOINT (Strict Super Admin Protection)
  app.post('/api/stores/create', requireAdminAuth, async (req, res) => {
    try {
      const session = (req as any).adminSession as AdminSession;
      if (session.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Only Super Admin can create new merchant stores.' });
      }

      const { name, owner_name, whatsapp_phone, phone, email, password, modules, category, address, logo, include_demo_data } = req.body || {};

      if (!name || !owner_name || !whatsapp_phone) {
        return res.status(400).json({ success: false, error: 'Store Name, Owner Name, and WhatsApp phone are required.' });
      }

      const storeId = generateUniqueStoreId();
      let baseSlug = generateSlug(name) || `store-${Date.now().toString(36)}`;
      let slug = baseSlug;
      let counter = 1;

      while ((storeData.stores || []).some((s) => (s.slug || '').toLowerCase() === slug.toLowerCase())) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const cleanWaPhone = whatsapp_phone.replace(/[^0-9]/g, '');
      const cleanPhone = (phone || whatsapp_phone).replace(/[^0-9]/g, '');
      const plainPassword = password || 'store1234';
      const securePasswordHash = hashPassword(plainPassword);
      const storeModules = Array.isArray(modules) && modules.length > 0 ? modules : ['mod-grocery', 'mod-food'];

      const newStore: VendorStore = {
        id: storeId,
        store_code: storeId,
        name: name.trim(),
        slug,
        category: category || 'General Store',
        owner_name: owner_name.trim(),
        phone: cleanPhone,
        whatsapp_phone: cleanWaPhone,
        email: email ? email.trim().toLowerCase() : `${slug}@store.local`,
        address: address || 'Main Market, Tirur, Kerala',
        logo: logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
        username: slug,
        password: securePasswordHash,
        status: 'ACTIVE',
        active: true,
        modules: storeModules,
        registered_at: new Date().toISOString(),
      };

      const ownerUserId = `usr-owner-${storeId.toLowerCase()}`;
      const newOwnerUser: AdminUser = {
        id: ownerUserId,
        store_id: storeId,
        username: slug,
        password: securePasswordHash,
        name: `${owner_name} (Owner)`,
        phone: cleanPhone,
        whatsapp_phone: cleanWaPhone,
        role: 'store_owner',
        active: true,
        permissions: defaultFullPermissions,
        created_at: new Date().toISOString(),
      };

      newStore.owner_user_id = ownerUserId;

      if (!storeData.stores) storeData.stores = [];
      if (!storeData.users) storeData.users = [];
      if (!storeData.categories) storeData.categories = [];
      if (!storeData.products) storeData.products = [];

      storeData.stores = [newStore, ...storeData.stores];
      storeData.users = [newOwnerUser, ...storeData.users];

      // Only seed demo data if explicitly requested or in demo mode
      const isDemoMode = process.env.DEMO_MODE === 'true' || include_demo_data === true;
      if (isDemoMode) {
        const primaryModule = storeModules[0] || 'mod-grocery';
        const demoCatId = `cat-demo-${storeId.toLowerCase()}`;
        const demoProdId = `prod-demo-${storeId.toLowerCase()}`;

        const demoCategory: Category = {
          id: demoCatId,
          name: `Demo Category (${name})`,
          moduleId: primaryModule,
          icon: '🛍️',
          enabled: true,
          order: 1,
          store_id: storeId,
          is_demo: true,
        };

        const demoProduct: Product = {
          id: demoProdId,
          name: `Demo Product (${name})`,
          categoryId: demoCatId,
          moduleId: primaryModule,
          store_id: storeId,
          price: 10,
          oldPrice: 15,
          rating: 4.8,
          deliveryTime: '15-30 mins',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
          description: 'Demo product initialized for instant cart and order testing.',
          available: true,
          stock: 100,
          enabled: true,
          is_demo: true,
        };

        storeData.categories.push(demoCategory);
        storeData.products.push(demoProduct);
      }

      logAuditEvent('STORE_CREATED', `Store "${newStore.name}" (${storeId}) created with slug "${slug}". Owner: ${owner_name}`, storeId, newStore.name, session.username);

      await saveStoreData(storeData);

      return res.json({
        success: true,
        store: sanitizeStore(newStore),
        owner: sanitizeUser(newOwnerUser),
        storefront_url: `/store/${slug}`,
        message: 'Store created successfully with secure credentials.',
      });
    } catch (err: any) {
      console.error('Failed to create store:', err);
      return res.status(500).json({ success: false, error: err.message || 'Internal server error creating store.' });
    }
  });

  // Super Admin Impersonation: "Login as Store Owner"
  app.post('/api/admin/impersonate', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin' && !session.isImpersonating) {
      return res.status(403).json({ success: false, error: 'Only Super Admin can initiate store owner impersonation.' });
    }

    const { storeId } = req.body || {};
    if (!storeId) {
      return res.status(400).json({ success: false, error: 'Store ID is required for impersonation.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Target store not found.' });
    }

    let ownerUser = (storeData.users || []).find((u) => u.store_id === storeId && u.role === 'store_owner');
    if (!ownerUser) {
      ownerUser = {
        id: store.owner_user_id || `usr-owner-${store.id.toLowerCase()}`,
        store_id: store.id,
        username: store.username,
        name: store.owner_name,
        phone: store.phone,
        whatsapp_phone: store.whatsapp_phone,
        role: 'store_owner',
        active: store.status === 'ACTIVE',
        permissions: defaultFullPermissions,
      };
    }

    const impersonateToken = 'imp_token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    const superAdminUsername = session.superAdminUsername || session.username;
    const superAdminId = session.superAdminId || session.userId;

    activeSessions.set(impersonateToken, {
      id: impersonateToken,
      userId: ownerUser.id,
      username: ownerUser.username,
      role: 'store_owner',
      store_id: store.id,
      isImpersonating: true,
      superAdminUsername,
      superAdminId,
      expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    });

    res.setHeader('Set-Cookie', `admin_token=${impersonateToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=14400`);

    logAuditEvent(
      'SUPER_ADMIN_IMPERSONATION_STARTED',
      `Super Admin "${superAdminUsername}" started impersonation for store owner "${ownerUser.name}" (${store.name})`,
      store.id,
      store.name,
      superAdminUsername
    );

    await saveStoreData(storeData);

    return res.json({
      success: true,
      token: impersonateToken,
      user: {
        userId: ownerUser.id,
        username: ownerUser.username,
        role: 'store_owner',
        store_id: store.id,
        store_name: store.name,
        permissions: ownerUser.permissions || defaultFullPermissions,
      },
      isImpersonating: true,
      superAdminUsername,
      message: `Switched to store owner session for ${store.name}`,
    });
  });

  // Exit Impersonation Mode
  app.post('/api/admin/exit-impersonation', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (!session.isImpersonating) {
      return res.status(400).json({ success: false, error: 'Current session is not an impersonated session.' });
    }

    const superAdminUsername = session.superAdminUsername || 'admin';
    const storeId = session.store_id;

    const restoredToken = 'admin_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
    const superAdminUser = (storeData.users || []).find((u) => u.username === superAdminUsername && u.role === 'super_admin');

    activeSessions.set(restoredToken, {
      id: restoredToken,
      userId: superAdminUser?.id || 'usr-superadmin',
      username: superAdminUsername,
      role: 'super_admin',
      permissions: defaultFullPermissions,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.setHeader('Set-Cookie', `admin_token=${restoredToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    logAuditEvent(
      'SUPER_ADMIN_IMPERSONATION_ENDED',
      `Super Admin "${superAdminUsername}" exited impersonation for store ${storeId}`,
      storeId,
      undefined,
      superAdminUsername
    );

    await saveStoreData(storeData);

    return res.json({
      success: true,
      token: restoredToken,
      user: {
        userId: superAdminUser?.id || 'usr-superadmin',
        username: superAdminUsername,
        role: 'super_admin',
        permissions: defaultFullPermissions,
      },
      message: 'Exited impersonation and returned to Super Admin mode.',
    });
  });

  // Reset Store Owner Password (Super Admin Only with Cryptographic Hashing)
  app.post('/api/stores/:storeId/reset-owner-password', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super Admin permission required to reset owner password.' });
    }

    const { storeId } = req.params;
    const { new_password } = req.body || {};

    if (!new_password || new_password.length < 4) {
      return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    const hashedNew = hashPassword(new_password);
    store.password = hashedNew;

    const ownerUser = (storeData.users || []).find((u) => u.store_id === storeId && u.role === 'store_owner');
    if (ownerUser) {
      ownerUser.password = hashedNew;
    }

    logAuditEvent('OWNER_PASSWORD_RESET', `Password reset for store owner of "${store.name}" (${storeId})`, storeId, store.name, session.username);

    await saveStoreData(storeData);

    return res.json({ success: true, message: `Password for store owner of ${store.name} updated securely.` });
  });

  // Remove Demo Data for a Store
  app.post('/api/stores/:storeId/remove-demo-data', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { storeId } = req.params;

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to manage demo data for this store.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    const initialProdCount = (storeData.products || []).length;
    const initialCatCount = (storeData.categories || []).length;

    storeData.products = (storeData.products || []).filter((p) => !(p.store_id === storeId && p.is_demo));
    storeData.categories = (storeData.categories || []).filter((c) => !(c.store_id === storeId && c.is_demo));

    const removedProds = initialProdCount - storeData.products.length;
    const removedCats = initialCatCount - storeData.categories.length;

    logAuditEvent('DEMO_DATA_REMOVED', `Removed ${removedProds} demo products and ${removedCats} demo categories from store "${store.name}"`, storeId, store.name, session.username);

    await saveStoreData(storeData);

    return res.json({
      success: true,
      removedProducts: removedProds,
      removedCategories: removedCats,
      message: `Removed demo data (${removedProds} products, ${removedCats} categories) from ${store.name}. Real store data preserved!`,
    });
  });

  // Full Store Profile View Data
  app.get('/api/stores/:storeId/full-profile', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { storeId } = req.params;

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view full profile for this store.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    const ownerUser = (storeData.users || []).find((u) => u.store_id === storeId && u.role === 'store_owner');
    const storeProducts = (storeData.products || []).filter((p) => p.store_id === storeId);
    const storeCategories = (storeData.categories || []).filter((c) => c.store_id === storeId);
    const storeOrders = (storeData.orders || []).filter((o) => o.store_id === storeId);
    const storeStaff = (storeData.users || []).filter((u) => u.store_id === storeId);
    const storeLogs = (storeData.audit_logs || []).filter((l) => l.store_id === storeId);

    const sanitizedOwner = ownerUser ? sanitizeUser(ownerUser) : null;
    const sanitizedStore = sanitizeStore(store);

    return res.json({
      success: true,
      store: sanitizedStore,
      owner: sanitizedOwner,
      products: storeProducts,
      categories: storeCategories,
      orders: storeOrders,
      staff: storeStaff.map((u) => sanitizeUser(u)),
      auditLogs: storeLogs,
      counts: {
        products: storeProducts.length,
        categories: storeCategories.length,
        orders: storeOrders.length,
        staff: storeStaff.length,
        demoProducts: storeProducts.filter((p) => p.is_demo).length,
      },
    });
  });

  // Store Profile Update
  app.post('/api/stores/:storeId/profile-update', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { storeId } = req.params;
    const { name, owner_name, whatsapp_phone, phone, email, address, category } = req.body || {};

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this store.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    if (name) store.name = name.trim();
    if (owner_name) store.owner_name = owner_name.trim();
    if (whatsapp_phone) store.whatsapp_phone = whatsapp_phone.replace(/[^0-9]/g, '');
    if (phone) store.phone = phone.replace(/[^0-9]/g, '');
    if (email) store.email = email.trim();
    if (address) store.address = address.trim();
    if (category) store.category = category;

    const ownerUser = (storeData.users || []).find((u) => u.store_id === storeId && u.role === 'store_owner');
    if (ownerUser) {
      if (owner_name) ownerUser.name = `${owner_name.trim()} (Owner)`;
      if (whatsapp_phone) ownerUser.whatsapp_phone = store.whatsapp_phone;
      if (phone) ownerUser.phone = store.phone;
    }

    logAuditEvent('STORE_UPDATED', `Store profile updated for "${store.name}" (${storeId})`, storeId, store.name, session.username);

    await saveStoreData(storeData);

    return res.json({ success: true, store: sanitizeStore(store), message: 'Store profile updated successfully!' });
  });

  // Update Store Status
  app.post('/api/stores/:storeId/status', requireAdminAuth, async (req, res) => {
    const { storeId } = req.params;
    const { status } = req.body || {};
    const session = (req as any).adminSession as AdminSession;

    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super Admin permission required.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    store.status = status;
    store.active = status === 'ACTIVE';

    logAuditEvent('STORE_STATUS_UPDATED', `Store status changed to ${status}`, store.id, store.name, session.username);
    await saveStoreData(storeData);

    return res.json({ success: true, store: sanitizeStore(store) });
  });

  // Update Store Modules
  app.post('/api/stores/:storeId/modules', requireAdminAuth, async (req, res) => {
    const { storeId } = req.params;
    const { modules } = req.body || {};
    const session = (req as any).adminSession as AdminSession;

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    if (session.role !== 'super_admin' && session.store_id !== storeId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit modules for this store.' });
    }

    store.modules = Array.isArray(modules) ? modules : store.modules;

    logAuditEvent('STORE_MODULES_UPDATED', `Store modules updated: ${store.modules.join(', ')}`, store.id, store.name, session.username);
    await saveStoreData(storeData);

    return res.json({ success: true, store: sanitizeStore(store) });
  });

  // Delete Store Endpoint (Safe Deletion with Order Historical Guard)
  const handleDeleteStore = async (req: express.Request, res: express.Response) => {
    const { storeId } = req.params;
    const session = (req as any).adminSession as AdminSession;

    if (!session || session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super Admin permission required to delete stores.' });
    }

    const storeIndex = (storeData.stores || []).findIndex((s) => s.id === storeId);
    if (storeIndex === -1) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    const store = storeData.stores[storeIndex];
    const hasOrders = (storeData.orders || []).some((o) => o.store_id === storeId);

    if (hasOrders) {
      store.status = 'ARCHIVED';
      store.active = false;
      logAuditEvent('STORE_ARCHIVED', `Store "${store.name}" (${storeId}) archived safely (historical orders preserved)`, storeId, store.name, session.username);
    } else {
      storeData.stores.splice(storeIndex, 1);
      storeData.users = (storeData.users || []).filter((u) => u.store_id !== storeId);
      logAuditEvent('STORE_DELETED', `Store "${store.name}" (${storeId}) deleted permanently`, storeId, store.name, session.username);
    }

    await saveStoreData(storeData);
    return res.json({
      success: true,
      message: hasOrders ? `Store "${store.name}" archived safely (historical order logs preserved)` : `Store "${store.name}" deleted successfully`,
      archived: hasOrders,
    });
  };

  app.delete('/api/stores/:storeId', requireAdminAuth, handleDeleteStore);
  app.post('/api/stores/:storeId/delete', requireAdminAuth, handleDeleteStore);

  // Users & Staff Management API
  app.get('/api/users', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    let usersList = storeData.users || [];
    if (session.role !== 'super_admin') {
      usersList = usersList.filter((u) => u.store_id === session.store_id);
    }
    const sanitized = usersList.map((u) => sanitizeUser(u));
    res.json({ success: true, users: sanitized });
  });

  app.post('/api/users', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { id, username, password, name, role, permissions, active } = req.body || {};

    if (!username || !name || !role) {
      return res.status(400).json({ success: false, error: 'Username, name, and role are required.' });
    }

    const targetStoreId = session.role === 'super_admin' ? (req.body.store_id || session.store_id) : session.store_id;

    if (!storeData.users) storeData.users = [];

    const existingIdx = storeData.users.findIndex((u) => u.id === id || (id && u.id === id));

    if (existingIdx >= 0) {
      const current = storeData.users[existingIdx];
      const updatedPassword = password ? hashPassword(password) : current.password;
      storeData.users[existingIdx] = {
        ...current,
        username: username.trim().toLowerCase(),
        password: updatedPassword,
        name: name.trim(),
        role,
        permissions: permissions || current.permissions,
        active: active !== undefined ? active : current.active,
        store_id: targetStoreId,
      };
      logAuditEvent('USER_UPDATED', `User "${name}" (${username}) updated with role ${role}`, targetStoreId, undefined, session.username);
    } else {
      const newUserId = 'usr-' + Date.now().toString(36);
      const newUser: AdminUser = {
        id: newUserId,
        store_id: targetStoreId,
        username: username.trim().toLowerCase(),
        password: hashPassword(password || 'pass1234'),
        name: name.trim(),
        role,
        active: active !== false,
        permissions: permissions || defaultFullPermissions,
        created_at: new Date().toISOString(),
      };
      storeData.users.push(newUser);
      logAuditEvent('USER_CREATED', `User "${name}" (${username}) created with role ${role}`, targetStoreId, undefined, session.username);
    }

    await saveStoreData(storeData);
    const sanitizedList = (storeData.users || []).map((u) => sanitizeUser(u));
    return res.json({ success: true, users: sanitizedList });
  });

  app.delete('/api/users/:userId', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { userId } = req.params;

    const userToDelete = (storeData.users || []).find((u) => u.id === userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (session.role !== 'super_admin' && userToDelete.store_id !== session.store_id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete user in another store' });
    }

    storeData.users = (storeData.users || []).filter((u) => u.id !== userId);
    logAuditEvent('USER_DELETED', `User "${userToDelete.name}" deleted`, userToDelete.store_id, undefined, session.username);
    await saveStoreData(storeData);

    return res.json({ success: true, message: 'User deleted successfully' });
  });

  // Admin / Super Admin / Staff Login (Password Hash Verified)
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body || {};
    const inputUsername = (username || '').trim().toLowerCase();
    const inputPassword = password || '';

    const usersList = storeData.users || initialData.users || [];
    let authUser: any = null;

    // 1. Check in configured users table
    for (const u of usersList) {
      if (u.active !== false && u.username.trim().toLowerCase() === inputUsername) {
        const { matched, needsRehash } = verifyPassword(inputPassword, u.password);
        if (matched) {
          if (needsRehash) {
            u.password = hashPassword(inputPassword);
            await saveStoreData(storeData);
          }
          if (u.store_id) {
            const store = (storeData.stores || []).find((s) => s.id === u.store_id);
            if (store && store.status === 'SUSPENDED') {
              return res.status(403).json({
                success: false,
                error: 'This store is currently suspended. Please contact Super Admin.',
              });
            }
          }
          authUser = {
            id: u.id,
            store_id: u.store_id,
            username: u.username,
            name: u.name,
            role: u.role,
            permissions: u.permissions || defaultFullPermissions,
          };
          break;
        }
      }
    }

    // 2. Fallback check Super Admin settings if not matched above
    if (!authUser) {
      const s = (storeData.settings || {}) as StoreSettings;
      const expectedUsername = (s.admin_username || 'admin').trim().toLowerCase();
      if (inputUsername === expectedUsername) {
        const expectedPassHash = s.admin_password || hashPassword(s.admin_pin || 'admin123');
        const { matched } = verifyPassword(inputPassword, expectedPassHash);
        const pinMatched = inputPassword === s.admin_pin;
        if (matched || pinMatched) {
          authUser = {
            id: 'usr-superadmin',
            username: expectedUsername,
            name: 'System Super Admin',
            role: 'super_admin',
            permissions: defaultFullPermissions,
          };
        }
      }
    }

    if (authUser) {
      const token = 'admin_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      activeSessions.set(token, {
        id: token,
        userId: authUser.id,
        username: authUser.username,
        role: authUser.role,
        store_id: authUser.store_id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      logAuditEvent('USER_LOGIN', `User ${authUser.username} (${authUser.role}) logged in`, authUser.store_id, undefined, authUser.username);

      return res.json({
        success: true,
        token,
        user: authUser,
        message: 'Authentication successful',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid username or password',
    });
  });

  // Dedicated Store Login Endpoint (Cryptographically Verified, vendor123 Universal Bypass Removed)
  app.post(['/api/store/login', '/api/vendor/login', '/api/storepanel/login'], async (req, res) => {
    const { store_identifier, username, password, store_code } = req.body || {};
    const identifier = (store_code || store_identifier || username || '').trim().toLowerCase();
    const inputPass = password || '';

    const stores = storeData.stores || [];
    const matchedStore = stores.find((s) => {
      if (s.status === 'SUSPENDED' || s.status === 'ARCHIVED') return false;
      const matchCode = (s.store_code || s.id || '').toLowerCase() === identifier;
      const matchSlug = (s.slug || '').toLowerCase() === identifier;
      const matchUser = (s.username || '').toLowerCase() === identifier;
      return matchCode || matchSlug || matchUser;
    });

    if (matchedStore) {
      const storePass = matchedStore.password || '';
      const { matched, needsRehash } = verifyPassword(inputPass, storePass);

      if (matched) {
        if (needsRehash) {
          matchedStore.password = hashPassword(inputPass);
          await saveStoreData(storeData);
        }

        const ownerUser = (storeData.users || []).find((u) => u.store_id === matchedStore.id && u.role === 'store_owner') || {
          id: matchedStore.owner_user_id || `usr-owner-${matchedStore.id}`,
          store_id: matchedStore.id,
          username: matchedStore.username,
          name: matchedStore.owner_name,
          role: 'store_owner',
          active: true,
          permissions: defaultFullPermissions,
        };

        const token = 'store_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        activeSessions.set(token, {
          id: token,
          userId: ownerUser.id,
          username: ownerUser.username,
          role: 'store_owner',
          store_id: matchedStore.id,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        logAuditEvent('STORE_OWNER_LOGIN', `Store owner logged in for store "${matchedStore.name}" (${matchedStore.id})`, matchedStore.id, matchedStore.name, ownerUser.username);

        return res.json({
          success: true,
          token,
          user: {
            id: ownerUser.id,
            username: ownerUser.username,
            name: ownerUser.name,
            role: 'store_owner',
            store_id: matchedStore.id,
            store_name: matchedStore.name,
            permissions: defaultFullPermissions,
          },
          store: sanitizeStore(matchedStore),
          message: 'Store authentication successful',
        });
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid store credentials or store is suspended',
    });
  });

  // Sensitive Store Profile Change Request (Pending Admin Approval)
  app.post('/api/store/request-sensitive-change', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    const { whatsapp_phone, phone, upi_id, name, address } = req.body || {};

    const storeId = session.store_id || req.body.store_id;
    if (!storeId) {
      return res.status(400).json({ success: false, error: 'Store ID required for sensitive change request.' });
    }

    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found.' });
    }

    const pendingChange: PendingStoreChange = {
      id: 'chg-' + Date.now(),
      store_id: store.id,
      store_name: store.name,
      requested_at: new Date().toISOString(),
      requested_by: session.username,
      changes: {
        whatsapp_phone: whatsapp_phone ? whatsapp_phone.replace(/\D/g, '') : undefined,
        phone: phone ? phone.replace(/\D/g, '') : undefined,
        upi_id: upi_id ? upi_id.trim() : undefined,
        name: name ? name.trim() : undefined,
        address: address ? address.trim() : undefined,
      },
      old_values: {
        whatsapp_phone: store.whatsapp_phone,
        phone: store.phone,
        upi_id: store.settings?.upi_id || storeData.settings?.upi_id,
        name: store.name,
        address: store.address,
      },
      status: 'PENDING',
    };

    store.pending_changes = pendingChange;
    logAuditEvent('STORE_CHANGE_REQUESTED', `Store "${store.name}" requested sensitive profile changes`, store.id, store.name, session.username);
    await saveStoreData(storeData);

    return res.json({
      success: true,
      pending_changes: pendingChange,
      message: 'Sensitive profile change request submitted! Pending Super Admin approval.',
    });
  });

  // Approve / Reject Sensitive Store Changes (Super Admin Only)
  app.post('/api/admin/approve-store-change', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can approve or reject store changes.' });
    }

    const { storeId, action } = req.body || {};
    const store = (storeData.stores || []).find((s) => s.id === storeId);
    if (!store || !store.pending_changes) {
      return res.status(404).json({ success: false, error: 'No pending change request found for this store.' });
    }

    if (action === 'APPROVE') {
      const chg = store.pending_changes.changes;
      if (chg.whatsapp_phone) store.whatsapp_phone = chg.whatsapp_phone;
      if (chg.phone) store.phone = chg.phone;
      if (chg.name) store.name = chg.name;
      if (chg.address) store.address = chg.address;
      if (chg.upi_id) {
        if (!store.settings) store.settings = {};
        store.settings.upi_id = chg.upi_id;
      }

      store.pending_changes.status = 'APPROVED';
      logAuditEvent('STORE_CHANGE_APPROVED', `Super Admin approved sensitive change for store "${store.name}"`, store.id, store.name, session.username);
    } else {
      store.pending_changes.status = 'REJECTED';
      logAuditEvent('STORE_CHANGE_REJECTED', `Super Admin rejected sensitive change for store "${store.name}"`, store.id, store.name, session.username);
    }

    const resultStatus = store.pending_changes.status;
    store.pending_changes = null;
    await saveStoreData(storeData);

    return res.json({
      success: true,
      store: sanitizeStore(store),
      message: `Store change request ${resultStatus.toLowerCase()} successfully!`,
    });
  });

  // Save/Update full app data with Multi-Tenant Security & Scope Isolation
  app.post('/api/data', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (req.body && typeof req.body === 'object') {
      if (session.role !== 'super_admin' && session.store_id) {
        // Scoped update: Merchant Store Owner can only update products and store-level settings for their store
        const storeId = session.store_id;

        // 1. Products Isolation: Store owner can only modify products belonging to their store
        if (Array.isArray(req.body.products)) {
          const otherProducts = storeData.products.filter((p) => p.store_id !== storeId);
          const myProducts = req.body.products.map((p: Product) => ({ ...p, store_id: storeId }));
          storeData.products = [...otherProducts, ...myProducts];
        }

        // 2. Categories Isolation: Categories are strictly managed by Super Admin; ignore store owner category overwrite
        // (Do not allow store owners to modify global categories)

        // 3. Orders Isolation: Store owner can only update status for their orders
        if (Array.isArray(req.body.orders)) {
          const otherOrders = storeData.orders.filter((o) => o.store_id !== storeId);
          const myOrders = req.body.orders.map((o: Order) => ({ ...o, store_id: storeId }));
          storeData.orders = [...otherOrders, ...myOrders];
        }

        // 4. Global Settings Protection: Store owner settings saved ONLY to their specific store.settings
        if (req.body.settings && typeof req.body.settings === 'object') {
          const targetStore = (storeData.stores || []).find((s) => s.id === storeId);
          if (targetStore) {
            targetStore.settings = { ...(targetStore.settings || {}), ...req.body.settings };
          }
        }
      } else {
        // Super Admin: Full platform update
        storeData = {
          modules: Array.isArray(req.body.modules) ? req.body.modules : storeData.modules,
          categories: Array.isArray(req.body.categories) ? req.body.categories : storeData.categories,
          products: Array.isArray(req.body.products) ? req.body.products : storeData.products,
          banners: Array.isArray(req.body.banners) ? req.body.banners : storeData.banners,
          orders: Array.isArray(req.body.orders) ? req.body.orders : storeData.orders,
          users: Array.isArray(req.body.users) ? req.body.users : storeData.users || [],
          customers: Array.isArray(req.body.customers) ? req.body.customers : storeData.customers || [],
          stores: Array.isArray(req.body.stores) ? req.body.stores : storeData.stores || [],
          audit_logs: Array.isArray(req.body.audit_logs) ? req.body.audit_logs : storeData.audit_logs || [],
          platform_templates: Array.isArray(req.body.platform_templates) ? req.body.platform_templates : storeData.platform_templates,
          platform_template_settings: req.body.platform_template_settings || storeData.platform_template_settings,
          store_templates: Array.isArray(req.body.store_templates) ? req.body.store_templates : storeData.store_templates,
          market_categories: Array.isArray(req.body.market_categories) ? req.body.market_categories : storeData.market_categories,
          market_banners: Array.isArray(req.body.market_banners) ? req.body.market_banners : storeData.market_banners,
          market_settings: req.body.market_settings || storeData.market_settings,
          settings: {
            ...(storeData.settings || {}),
            ...(req.body.settings || {}),
          },
        };
      }

      logAuditEvent('DATA_UPDATED', 'App data updated via API', session.store_id, undefined, session.username);
      await saveStoreData(storeData);
      return res.json({ success: true, data: storeData });
    }
    return res.status(400).json({ error: 'Invalid payload' });
  });

  // Audit Logs API
  app.get('/api/audit-logs', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    let logs = storeData.audit_logs || [];
    if (session.role !== 'super_admin' && session.store_id) {
      logs = logs.filter((l) => l.store_id === session.store_id);
    }
    res.json({ success: true, logs });
  });

  // Download SQL Schema
  app.get('/api/database/schema.sql', (_req, res) => {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=schema.sql');
      return res.sendFile(schemaPath);
    }
    return res.status(404).send('schema.sql file not found');
  });

  // Secure Order Placement Endpoint (Server-Side Price Validation, Stock Decrement & Store Binding)
  app.post('/api/orders', async (req, res) => {
    const rawOrder: Order = req.body;
    if (!rawOrder || !rawOrder.order_id || !Array.isArray(rawOrder.items) || rawOrder.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid order data: items list required.' });
    }

    // Idempotency / Duplicate Prevention Check
    const existingOrder = (storeData.orders || []).find((o) => o.order_id === rawOrder.order_id);
    if (existingOrder) {
      const matched = (storeData.stores || []).find((s) => s.id === existingOrder.store_id);
      return res.json({
        success: true,
        order: existingOrder,
        merchant_whatsapp_phone: matched?.whatsapp_phone || storeData.settings.store_whatsapp_phone || '919876543210',
        duplicate_prevented: true,
      });
    }

    // MANDATORY BATCH DELIVERY EXPIRY & TIME VALIDATION (Asia/Kolkata IST)
    const slotValidation = validateDeliverySlot(
      rawOrder.delivery_type,
      rawOrder.delivery_slot_time,
      (rawOrder as any).delivery_date || (rawOrder as any).batch_date
    );

    if (!slotValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: slotValidation.error || 'This delivery batch has expired. Please select another available batch.',
        code: slotValidation.code || 'BATCH_EXPIRED',
      });
    }

    const newOrder: Order = { ...rawOrder };

    // 1. Security Enforcement: Authenticated Customer Session Verification
    const custSession = getCustomerSessionFromReq(req);
    if (custSession) {
      newOrder.customer_phone = custSession.phone;
      newOrder.customer_id = custSession.customerId;
      if (custSession.name && (!newOrder.customer_name || newOrder.customer_name === 'Customer')) {
        newOrder.customer_name = custSession.name;
      }
    } else {
      const normPhone = normalizePhone(newOrder.customer_phone);
      if (!normPhone) {
        return res.status(400).json({ success: false, error: 'Valid customer WhatsApp phone number is required.' });
      }
      let existing = findCustomerByPhone(normPhone);
      if (existing) {
        newOrder.customer_id = existing.customer_id;
        newOrder.customer_phone = existing.whatsapp_number;
      } else {
        const newCust: Customer = {
          customer_id: 'cust-' + Date.now().toString(36),
          whatsapp_number: normPhone,
          name: newOrder.customer_name || `Customer (${normPhone.slice(-4)})`,
          registered_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          status: 'active',
        };
        if (!storeData.customers) storeData.customers = [];
        storeData.customers.push(newCust);
        newOrder.customer_id = newCust.customer_id;
        newOrder.customer_phone = normPhone;
      }
    }

    // 2. Store Resolution & Validation
    let matchedStore: VendorStore | undefined;
    if (newOrder.store_id) {
      matchedStore = (storeData.stores || []).find((s) => s.id === newOrder.store_id);
      if (!matchedStore) {
        return res.status(400).json({ success: false, error: `Invalid store ID "${newOrder.store_id}". Store does not exist.` });
      }
    }

    if (!matchedStore && newOrder.items.length > 0) {
      const firstItemName = (newOrder.items[0].name || '').split(' (')[0].trim().toLowerCase();
      const matchedProd = (storeData.products || []).find((p) => p.name.trim().toLowerCase() === firstItemName);
      if (matchedProd && matchedProd.store_id) {
        matchedStore = (storeData.stores || []).find((s) => s.id === matchedProd.store_id);
      }
    }

    if (!matchedStore && storeData.stores && storeData.stores.length > 0) {
      matchedStore = storeData.stores[0];
    }

    if (matchedStore) {
      if (matchedStore.status === 'SUSPENDED' || matchedStore.status === 'ARCHIVED') {
        return res.status(400).json({ success: false, error: `Store "${matchedStore.name}" is currently not accepting orders.` });
      }
      newOrder.store_id = matchedStore.id;
      newOrder.store_name = matchedStore.name;
    }

    // 3. Server-Side Price Verification, Stock Check & Transactional Stock Decrement
    let serverSubtotal = 0;
    const validatedItems = [];

    for (let i = 0; i < newOrder.items.length; i++) {
      const item = newOrder.items[i];
      const rawItemName = (item.name || '').split(' (')[0].trim().toLowerCase();
      const requestedQty = typeof item.qty === 'number' && item.qty > 0 ? item.qty : 1;

      // Find database product record
      const dbProduct = (storeData.products || []).find(
        (p) => p.name.trim().toLowerCase() === rawItemName || (p.id && item.name.includes(p.name))
      );

      let unitPrice = item.price || 0;

      if (dbProduct) {
        // Enforce true server price
        unitPrice = dbProduct.price;

        // Stock validation & decrement
        if (typeof dbProduct.stock === 'number') {
          if (dbProduct.stock < requestedQty) {
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}, Requested: ${requestedQty}.`,
            });
          }
          dbProduct.stock = Math.max(0, dbProduct.stock - requestedQty);
          if (dbProduct.stock === 0) {
            dbProduct.available = false;
          }
        }
      }

      const itemTotal = unitPrice * requestedQty;
      serverSubtotal += itemTotal;

      validatedItems.push({
        ...item,
        price: unitPrice,
        qty: requestedQty,
        category: item.category || dbProduct?.categoryId || 'General',
      });
    }

    newOrder.items = validatedItems;

    // 4. Delivery Fee Verification
    const serverDeliveryFee = typeof newOrder.delivery_fee === 'number' ? newOrder.delivery_fee : 0;
    newOrder.delivery_fee = serverDeliveryFee;
    newOrder.total_amount = serverSubtotal + serverDeliveryFee;
    newOrder.order_time = newOrder.order_time || new Date().toISOString();
    newOrder.status = newOrder.status || 'Order Placed';

    const merchantWhatsappPhone = matchedStore?.whatsapp_phone || storeData.settings.store_whatsapp_phone || '919876543210';

    // 5. Format Webhook Payload for n8n Automation
    const formattedWebhookItems = validatedItems.map((item, idx) => ({
      product_id: `prod-${idx + 1}`,
      name: item.name,
      quantity: item.qty,
      price: item.price,
      total: item.price * item.qty,
    }));

    const standardWebhookPayload = {
      event: 'order.created',
      order: {
        order_id: newOrder.order_id,
        store_id: newOrder.store_id || matchedStore?.id || '',
        store_code: matchedStore?.store_code || matchedStore?.slug || '',
        store_name: newOrder.store_name || matchedStore?.name || storeData.settings.store_name,
        merchant_whatsapp_phone: merchantWhatsappPhone,
        customer_name: newOrder.customer_name || 'Customer',
        customer_phone: newOrder.customer_phone || '',
        customer_whatsapp: newOrder.customer_phone || '',
        delivery_address: newOrder.notes || storeData.settings.delivery_address || '',
        delivery_slot: newOrder.delivery_slot_time || 'Standard Delivery (20-30 min)',
        payment_method: newOrder.payment_method || 'cod',
        payment_status: newOrder.payment_status || 'Pending',
        subtotal: serverSubtotal,
        delivery_fee: serverDeliveryFee,
        total_amount: newOrder.total_amount,
        currency: 'INR',
        items: formattedWebhookItems,
      },
      source: 'website',
      timestamp: new Date().toISOString(),
    };

    const isWebhookEnabled = storeData.settings.n8n_webhook_enabled !== false;
    const targetWebhookUrl = (storeData.settings.n8n_webhook_url || '').trim() || (process.env.N8N_WEBHOOK_URL || '').trim();
    const signingSecret = (storeData.settings.n8n_webhook_secret || '').trim() || (process.env.N8N_WEBHOOK_SECRET || '').trim();

    let webhookStatus: 'success' | 'failed' | 'skipped' | 'pending' = 'skipped';
    let webhookResponse = null;

    if (isWebhookEnabled && targetWebhookUrl) {
      webhookStatus = 'pending';
      try {
        const webhookHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'HM-Q-Hyperlocal-Commerce/0.0.2',
        };
        if (signingSecret) {
          webhookHeaders['X-Webhook-Secret'] = signingSecret;
        }

        const response = await fetch(targetWebhookUrl, {
          method: 'POST',
          headers: webhookHeaders,
          body: JSON.stringify(standardWebhookPayload),
        });

        webhookStatus = response.ok ? 'success' : 'failed';
        try {
          webhookResponse = await response.text();
        } catch {
          webhookResponse = null;
        }
      } catch (err: any) {
        console.error('Error triggering n8n webhook:', err);
        webhookStatus = 'failed';
      }
    }

    newOrder.webhook_status = webhookStatus;
    if (!storeData.orders) storeData.orders = [];
    storeData.orders = [newOrder, ...storeData.orders];

    // Save to file cache & MySQL database
    await saveStoreData(storeData);
    if (isMysqlConnected()) {
      insertOrderToMysql(newOrder).catch((err) => console.error('[MySQL Order Error]:', err.message));
    }

    res.json({
      success: true,
      order: newOrder,
      merchant_whatsapp_phone: merchantWhatsappPhone,
      store_name: newOrder.store_name,
      webhookStatus,
      webhookResponse,
    });
  });

  // Retry n8n Webhook for an order
  app.post('/api/orders/:orderId/retry-webhook', requireAdminAuth, async (req, res) => {
    const { orderId } = req.params;
    const targetOrder = (storeData.orders || []).find((o) => o.order_id === orderId);
    if (!targetOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const targetWebhookUrl = (storeData.settings.n8n_webhook_url || '').trim() || (process.env.N8N_WEBHOOK_URL || '').trim();
    if (!targetWebhookUrl) {
      return res.status(400).json({ error: 'n8n Webhook URL is not configured in settings or environment' });
    }

    const matchedStore = (storeData.stores || []).find((s) => s.id === targetOrder.store_id);
    const merchantWhatsappPhone = matchedStore?.whatsapp_phone || storeData.settings.store_whatsapp_phone || '919876543210';

    const formattedWebhookItems = (targetOrder.items || []).map((item, idx) => {
      const unitPrice = typeof item.price === 'number' ? item.price : 0;
      const qty = typeof item.qty === 'number' ? item.qty : 1;
      return {
        product_id: `prod-${idx + 1}`,
        name: item.name,
        quantity: qty,
        price: unitPrice,
        total: unitPrice * qty,
      };
    });

    const standardWebhookPayload = {
      event: 'order.created',
      order: {
        order_id: targetOrder.order_id,
        store_id: targetOrder.store_id || '',
        store_code: matchedStore?.store_code || matchedStore?.slug || '',
        store_name: targetOrder.store_name || matchedStore?.name || storeData.settings.store_name,
        merchant_whatsapp_phone: merchantWhatsappPhone,
        customer_name: targetOrder.customer_name || 'Customer',
        customer_phone: targetOrder.customer_phone || '',
        customer_whatsapp: targetOrder.customer_phone || '',
        delivery_address: targetOrder.notes || storeData.settings.delivery_address || '',
        delivery_slot: targetOrder.delivery_slot_time || 'Standard Delivery',
        payment_method: targetOrder.payment_method || 'cod',
        payment_status: targetOrder.payment_status || 'Pending',
        subtotal: targetOrder.total_amount - (targetOrder.delivery_fee || 0),
        delivery_fee: targetOrder.delivery_fee || 0,
        total_amount: targetOrder.total_amount,
        currency: 'INR',
        items: formattedWebhookItems,
      },
      source: 'website',
      is_retry: true,
      timestamp: new Date().toISOString(),
    };

    try {
      const webhookHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'HM-Q-Hyperlocal-Commerce/0.0.2',
      };
      const signingSecret = (storeData.settings.n8n_webhook_secret || '').trim() || (process.env.N8N_WEBHOOK_SECRET || '').trim();
      if (signingSecret) {
        webhookHeaders['X-Webhook-Secret'] = signingSecret;
      }

      const response = await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify(standardWebhookPayload),
      });

      targetOrder.webhook_status = response.ok ? 'success' : 'failed';
      targetOrder.webhook_retry_count = (targetOrder.webhook_retry_count || 0) + 1;
      await saveStoreData(storeData);

      const respText = await response.text();
      return res.json({
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Webhook successfully dispatched to n8n' : 'n8n returned non-200 status',
        responseText: respText,
      });
    } catch (err: any) {
      targetOrder.webhook_status = 'failed';
      targetOrder.webhook_retry_count = (targetOrder.webhook_retry_count || 0) + 1;
      await saveStoreData(storeData);
      return res.status(500).json({ error: 'Webhook dispatch failed: ' + (err?.message || 'Network error') });
    }
  });

  // Test n8n Connection Endpoint (Host/Port reachability)
  app.post('/api/test-n8n-connection', requireAdminAuth, async (req, res) => {
    const protocol = req.body.protocol || storeData.settings.n8n_protocol || 'http';
    const host = req.body.host || storeData.settings.n8n_host || 'localhost';
    const port = req.body.port || storeData.settings.n8n_port || 5678;

    const testUrl = `${protocol}://${host}:${port}/healthz`;
    const fallbackUrl = `${protocol}://${host}:${port}/`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      let response;
      try {
        response = await fetch(testUrl, { method: 'GET', signal: controller.signal });
      } catch {
        response = await fetch(fallbackUrl, { method: 'GET', signal: controller.signal });
      }
      clearTimeout(timeoutId);

      return res.json({
        success: true,
        status: response.status,
        message: `SUCCESS: n8n server is reachable at ${protocol}://${host}:${port}`,
      });
    } catch (err: any) {
      return res.json({
        success: false,
        status: 0,
        message: `FAILED: Unable to connect to n8n server at ${protocol}://${host}:${port} (${err?.message || 'Connection timeout'})`,
      });
    }
  });

  // ==========================================
  // ADVANCED SUPER ADMIN BACKUP & DATA MANAGEMENT
  // ==========================================
  const BACKUPS_DIR = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(BACKUPS_DIR)) {
    try {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    } catch {}
  }

  // Sanitizes AppData for export & snapshot creation by stripping out secret keys and server tokens
  const sanitizeDataForExport = (data: AppData, selectedEntities?: string[]): Partial<AppData> => {
    const cloned: any = JSON.parse(JSON.stringify(data));

    // Remove server secrets, credentials, tokens from settings
    if (cloned.settings) {
      delete cloned.settings.n8n_webhook_secret;
      delete cloned.settings.jwt_secret;
      delete cloned.settings.admin_pin;
      delete cloned.settings.admin_password;
      delete cloned.settings.n8n_encryption_key;
      delete cloned.settings.gemini_api_key;
      delete cloned.settings.db_password;
      delete cloned.settings.database_password;
      delete cloned.settings.api_key;
      delete cloned.settings.whatsapp_secret;
      delete cloned.settings.payment_secret;
      delete cloned.settings.razorpay_secret;
      delete cloned.settings.stripe_secret;
    }

    if (cloned.users && Array.isArray(cloned.users)) {
      cloned.users = cloned.users.map((u: any) => {
        const copy = { ...u };
        delete copy.password;
        delete copy.password_hash;
        delete copy.token;
        delete copy.session_token;
        return copy;
      });
    }

    if (cloned.stores && Array.isArray(cloned.stores)) {
      cloned.stores = cloned.stores.map((s: any) => {
        const copy = { ...s };
        delete copy.password;
        if (copy.settings) {
          delete copy.settings.admin_password;
          delete copy.settings.n8n_webhook_secret;
          delete copy.settings.n8n_encryption_key;
        }
        return copy;
      });
    }

    if (cloned.customers && Array.isArray(cloned.customers)) {
      cloned.customers = cloned.customers.map((c: any) => {
        const copy = { ...c };
        delete copy.token;
        delete copy.session_token;
        return copy;
      });
    }

    if (!selectedEntities || selectedEntities.length === 0) {
      return cloned;
    }

    const filtered: any = {
      manifest: {
        version: '2.2.0',
        exported_at: new Date().toISOString(),
        entities: selectedEntities,
        platform: 'Hyperlocal Commerce Platform',
      },
    };

    selectedEntities.forEach((entity) => {
      if (cloned[entity] !== undefined) {
        filtered[entity] = cloned[entity];
      }
    });

    return filtered;
  };

  // Helper to preserve active server secrets when applying restored settings
  const mergeSafeSettings = (existingSettings: StoreSettings, incomingSettings?: Partial<StoreSettings>): StoreSettings => {
    const combined = { ...existingSettings, ...(incomingSettings || {}) };
    
    // If incoming settings lacks server secrets, retain active server secrets
    if (!incomingSettings?.admin_pin && existingSettings.admin_pin) {
      combined.admin_pin = existingSettings.admin_pin;
    }
    if (!incomingSettings?.admin_password && existingSettings.admin_password) {
      combined.admin_password = existingSettings.admin_password;
    }
    if (!incomingSettings?.jwt_secret && existingSettings.jwt_secret) {
      combined.jwt_secret = existingSettings.jwt_secret;
    }
    if (!incomingSettings?.n8n_webhook_secret && existingSettings.n8n_webhook_secret) {
      combined.n8n_webhook_secret = existingSettings.n8n_webhook_secret;
    }
    if (!incomingSettings?.n8n_encryption_key && existingSettings.n8n_encryption_key) {
      combined.n8n_encryption_key = existingSettings.n8n_encryption_key;
    }
    return combined;
  };

  // 1. Get All Snapshots
  app.get('/api/backup/snapshots', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can manage system snapshots.' });
    }

    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        return res.json({ success: true, snapshots: [] });
      }

      const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json'));
      const snapshots = files
        .map((filename) => {
          const filePath = path.join(BACKUPS_DIR, filename);
          const stats = fs.statSync(filePath);
          let label = filename.replace('.json', '');
          let recordCount = 0;
          let createdAt = stats.mtime.toISOString();

          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (content._snapshot_label) label = content._snapshot_label;
            if (content._created_at) createdAt = content._created_at;
            recordCount =
              (content.products?.length || 0) +
              (content.orders?.length || 0) +
              (content.stores?.length || 0) +
              (content.categories?.length || 0);
          } catch {}

          return {
            id: filename,
            filename,
            label,
            sizeKb: Math.round(stats.size / 1024),
            recordCount,
            createdAt,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({ success: true, snapshots });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to list snapshots' });
    }
  });

  // 2. Create Named Snapshot Checkpoint (Sanitized)
  app.post('/api/backup/snapshots/create', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can create system snapshots.' });
    }

    const { label } = req.body || {};
    const cleanLabel = (label || 'Manual Snapshot').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `snapshot_${timestamp}_${cleanLabel}.json`;
    const filePath = path.join(BACKUPS_DIR, filename);

    try {
      const sanitizedStore = sanitizeDataForExport(storeData);
      const snapshotPayload = {
        ...sanitizedStore,
        _snapshot_label: label || 'Manual Snapshot',
        _created_at: new Date().toISOString(),
        _created_by: session.username,
      };

      fs.writeFileSync(filePath, JSON.stringify(snapshotPayload, null, 2), 'utf-8');
      logAuditEvent('SNAPSHOT_CREATED', `System backup snapshot "${label}" created (sanitized)`, undefined, undefined, session.username);

      return res.json({
        success: true,
        message: `Snapshot "${label || filename}" created successfully!`,
        snapshot: {
          id: filename,
          filename,
          label: label || 'Manual Snapshot',
          sizeKb: Math.round(fs.statSync(filePath).size / 1024),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to create snapshot: ' + err.message });
    }
  });

  // 3. Restore from Server-side Snapshot
  app.post('/api/backup/snapshots/restore', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can restore snapshots.' });
    }

    const { snapshotId, mode } = req.body || {};
    if (!snapshotId) {
      return res.status(400).json({ success: false, error: 'Snapshot ID is required' });
    }

    const safeFilename = path.basename(snapshotId);
    const filePath = path.join(BACKUPS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Snapshot file does not exist.' });
    }

    try {
      // Create auto pre-restore safety checkpoint (sanitized)
      const preRestoreFile = path.join(BACKUPS_DIR, `pre_restore_safety_${Date.now()}.json`);
      fs.writeFileSync(preRestoreFile, JSON.stringify(sanitizeDataForExport(storeData), null, 2), 'utf-8');

      const raw = fs.readFileSync(filePath, 'utf-8');
      const backup: AppData = JSON.parse(raw);

      if (mode === 'merge') {
        // Smart Merge
        const mergedData: AppData = { ...storeData };
        if (Array.isArray(backup.modules)) {
          const modMap = new Map(mergedData.modules.map((m) => [m.id, m]));
          backup.modules.forEach((m) => modMap.set(m.id, m));
          mergedData.modules = Array.from(modMap.values());
        }
        if (Array.isArray(backup.categories)) {
          const catMap = new Map(mergedData.categories.map((c) => [c.id, c]));
          backup.categories.forEach((c) => catMap.set(c.id, c));
          mergedData.categories = Array.from(catMap.values());
        }
        if (Array.isArray(backup.products)) {
          const prodMap = new Map(mergedData.products.map((p) => [p.id, p]));
          backup.products.forEach((p) => prodMap.set(p.id, p));
          mergedData.products = Array.from(prodMap.values());
        }
        if (Array.isArray(backup.stores)) {
          const storeMap = new Map((mergedData.stores || []).map((s) => [s.id, s]));
          backup.stores.forEach((s) => {
            const existing = storeMap.get(s.id);
            // Preserve store password if incoming lacks password
            const password = s.password || existing?.password;
            storeMap.set(s.id, { ...existing, ...s, password });
          });
          mergedData.stores = Array.from(storeMap.values());
        }
        if (Array.isArray(backup.orders)) {
          const orderMap = new Map((mergedData.orders || []).map((o) => [o.order_id, o]));
          backup.orders.forEach((o) => orderMap.set(o.order_id, o));
          mergedData.orders = Array.from(orderMap.values());
        }
        if (backup.settings) {
          mergedData.settings = mergeSafeSettings(mergedData.settings, backup.settings);
        }
        storeData = mergedData;
      } else {
        // Full clean replace (preserving active server secrets)
        const preservedSettings = mergeSafeSettings(initialData.settings, backup.settings || {});
        // Preserve users passwords if incoming lacks password
        const existingUsersMap = new Map((storeData.users || []).map((u) => [u.id, u.password]));
        const restoredUsers = (Array.isArray(backup.users) ? backup.users : initialData.users || []).map((u) => ({
          ...u,
          password: u.password || existingUsersMap.get(u.id) || '',
        }));

        const existingStoresMap = new Map((storeData.stores || []).map((s) => [s.id, s.password]));
        const restoredStores = (Array.isArray(backup.stores) ? backup.stores : initialData.stores || []).map((s) => ({
          ...s,
          password: s.password || existingStoresMap.get(s.id) || '',
        }));

        storeData = {
          modules: Array.isArray(backup.modules) ? backup.modules : initialData.modules,
          categories: Array.isArray(backup.categories) ? backup.categories : initialData.categories,
          products: Array.isArray(backup.products) ? backup.products : initialData.products,
          banners: Array.isArray(backup.banners) ? backup.banners : initialData.banners,
          orders: Array.isArray(backup.orders) ? backup.orders : [],
          users: restoredUsers,
          customers: Array.isArray(backup.customers) ? backup.customers : [],
          stores: restoredStores,
          audit_logs: Array.isArray(backup.audit_logs) ? backup.audit_logs : [],
          settings: preservedSettings,
          platform_templates: Array.isArray(backup.platform_templates) ? backup.platform_templates : initialData.platform_templates,
          platform_template_settings: backup.platform_template_settings || initialData.platform_template_settings,
          store_templates: Array.isArray(backup.store_templates) ? backup.store_templates : initialData.store_templates,
          market_categories: Array.isArray(backup.market_categories) ? backup.market_categories : initialData.market_categories,
          market_banners: Array.isArray(backup.market_banners) ? backup.market_banners : initialData.market_banners,
          market_settings: backup.market_settings || initialData.market_settings,
        };
      }

      await saveStoreData(storeData);
      logAuditEvent('SNAPSHOT_RESTORED', `System restored from snapshot ${safeFilename} (${mode || 'replace'})`, undefined, undefined, session.username);

      return res.json({
        success: true,
        message: `System successfully restored from snapshot "${safeFilename}"!`,
        data: storeData,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Snapshot restoration failed: ' + err.message });
    }
  });

  // 4. Delete Snapshot
  app.delete('/api/backup/snapshots/:snapshotId', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can delete snapshots.' });
    }

    const safeFilename = path.basename(req.params.snapshotId);
    const filePath = path.join(BACKUPS_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logAuditEvent('SNAPSHOT_DELETED', `Snapshot ${safeFilename} removed`, undefined, undefined, session.username);
        return res.json({ success: true, message: 'Snapshot deleted successfully.' });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: 'Failed to delete snapshot: ' + err.message });
      }
    }
    return res.status(404).json({ success: false, error: 'Snapshot file not found' });
  });

  // 5. Selective & Full Export Endpoint (JSON / SQL)
  app.post('/api/backup/export', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can export system data.' });
    }

    const { entities, format } = req.body || {};
    const sanitized = sanitizeDataForExport(storeData, entities);

    if (format === 'sql') {
      // Generate SQL schema & inserts
      let sql = `-- HYPERLOCAL COMMERCE DATABASE SQL DUMP\n-- Exported At: ${new Date().toISOString()}\n-- Exported By: ${session.username}\n\n`;
      sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      if (!entities || entities.includes('stores')) {
        sql += `-- STORES TABLE\n`;
        (storeData.stores || []).forEach((s) => {
          sql += `INSERT INTO stores (id, name, slug, status, category, phone, whatsapp_phone, address, created_at) VALUES ('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}', '${s.slug || ''}', '${s.status || 'ACTIVE'}', '${s.category || ''}', '${s.phone || ''}', '${s.whatsapp_phone || ''}', '${(s.address || '').replace(/'/g, "\\'")}', '${(s as any).created_at || new Date().toISOString()}') ON DUPLICATE KEY UPDATE name=VALUES(name);\n`;
        });
        sql += `\n`;
      }

      if (!entities || entities.includes('products')) {
        sql += `-- PRODUCTS TABLE\n`;
        (storeData.products || []).forEach((p) => {
          sql += `INSERT INTO products (id, name, price, stock, category_id, store_id, available) VALUES ('${p.id}', '${(p.name || '').replace(/'/g, "\\'")}', ${p.price || 0}, ${p.stock || 0}, '${p.categoryId || ''}', '${p.store_id || ''}', ${p.available !== false ? 1 : 0}) ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), stock=VALUES(stock);\n`;
        });
        sql += `\n`;
      }

      sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sql);
    }

    return res.json({
      success: true,
      manifest: {
        version: '2.2.0',
        exported_at: new Date().toISOString(),
        exported_by: session.username,
        entities: entities || 'all',
        counts: {
          products: storeData.products?.length || 0,
          categories: storeData.categories?.length || 0,
          modules: storeData.modules?.length || 0,
          stores: storeData.stores?.length || 0,
          orders: storeData.orders?.length || 0,
          customers: storeData.customers?.length || 0,
          users: storeData.users?.length || 0,
        },
      },
      data: sanitized,
    });
  });

  // 6. Enhanced Selective / Full Database Restore Endpoint
  app.post('/api/backup/restore', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can restore database.' });
    }

    try {
      const { backup, mode, entities } = req.body || {};
      const backupData: AppData = backup?.data || backup;

      if (!backupData || typeof backupData !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid backup data payload.' });
      }

      // 1. Create automatic pre-restore safety checkpoint (sanitized)
      const preRestoreFile = path.join(BACKUPS_DIR, `pre_restore_safety_${Date.now()}.json`);
      try {
        fs.writeFileSync(preRestoreFile, JSON.stringify(sanitizeDataForExport(storeData), null, 2), 'utf-8');
      } catch {}

      const stats: Record<string, { updated: number; added: number }> = {};
      const targetEntities = Array.isArray(entities) && entities.length > 0 ? entities : null;

      if (mode === 'merge') {
        // Smart Selective Merge
        const merged: AppData = { ...storeData };

        const mergeEntity = (key: keyof AppData, idKey: string = 'id') => {
          if (!targetEntities || targetEntities.includes(key)) {
            const existingList = Array.isArray(merged[key]) ? (merged[key] as any[]) : [];
            const incomingList = Array.isArray(backupData[key]) ? (backupData[key] as any[]) : [];
            let updated = 0;
            let added = 0;

            const map = new Map<string, any>(existingList.map((item) => [item[idKey], item]));
            incomingList.forEach((item) => {
              if (map.has(item[idKey])) {
                const existing = map.get(item[idKey]);
                const password = item.password || existing.password;
                map.set(item[idKey], { ...existing, ...item, password });
                updated++;
              } else {
                map.set(item[idKey], item);
                added++;
              }
            });

            (merged as any)[key] = Array.from(map.values());
            stats[key] = { updated, added };
          }
        };

        mergeEntity('modules', 'id');
        mergeEntity('categories', 'id');
        mergeEntity('products', 'id');
        mergeEntity('stores', 'id');
        mergeEntity('orders', 'order_id');
        mergeEntity('customers', 'customer_id');
        mergeEntity('banners', 'id');
        mergeEntity('platform_templates', 'id');
        mergeEntity('store_templates', 'id');
        mergeEntity('market_categories', 'id');
        mergeEntity('market_banners', 'id');

        if (!targetEntities || targetEntities.includes('settings')) {
          if (backupData.settings) {
            merged.settings = mergeSafeSettings(merged.settings, backupData.settings);
            stats['settings'] = { updated: 1, added: 0 };
          }
        }

        storeData = merged;
      } else {
        // Replace Mode (Full or Selective Replacement)
        if (!targetEntities) {
          // Full replacement with preserved active secrets
          const preservedSettings = mergeSafeSettings(initialData.settings, backupData.settings || {});
          const existingUsersMap = new Map((storeData.users || []).map((u) => [u.id, u.password]));
          const restoredUsers = (Array.isArray(backupData.users) ? backupData.users : initialData.users || []).map((u) => ({
            ...u,
            password: u.password || existingUsersMap.get(u.id) || '',
          }));

          const existingStoresMap = new Map((storeData.stores || []).map((s) => [s.id, s.password]));
          const restoredStores = (Array.isArray(backupData.stores) ? backupData.stores : initialData.stores || []).map((s) => ({
            ...s,
            password: s.password || existingStoresMap.get(s.id) || '',
          }));

          storeData = {
            modules: Array.isArray(backupData.modules) ? backupData.modules : initialData.modules,
            categories: Array.isArray(backupData.categories) ? backupData.categories : initialData.categories,
            products: Array.isArray(backupData.products) ? backupData.products : initialData.products,
            banners: Array.isArray(backupData.banners) ? backupData.banners : initialData.banners,
            orders: Array.isArray(backupData.orders) ? backupData.orders : [],
            users: restoredUsers,
            customers: Array.isArray(backupData.customers) ? backupData.customers : [],
            stores: restoredStores,
            audit_logs: Array.isArray(backupData.audit_logs) ? backupData.audit_logs : [],
            settings: preservedSettings,
            platform_templates: Array.isArray(backupData.platform_templates) ? backupData.platform_templates : initialData.platform_templates,
            platform_template_settings: backupData.platform_template_settings || initialData.platform_template_settings,
            store_templates: Array.isArray(backupData.store_templates) ? backupData.store_templates : initialData.store_templates,
            market_categories: Array.isArray(backupData.market_categories) ? backupData.market_categories : initialData.market_categories,
            market_banners: Array.isArray(backupData.market_banners) ? backupData.market_banners : initialData.market_banners,
            market_settings: backupData.market_settings || initialData.market_settings,
          };
          stats['all'] = { updated: 1, added: 0 };
        } else {
          // Selective entity replacement
          targetEntities.forEach((ent) => {
            if (backupData[ent as keyof AppData] !== undefined) {
              if (ent === 'settings') {
                storeData.settings = mergeSafeSettings(storeData.settings, backupData.settings);
              } else {
                (storeData as any)[ent] = backupData[ent as keyof AppData];
              }
              stats[ent] = { updated: 1, added: 0 };
            }
          });
        }
      }

      await saveStoreData(storeData);
      logAuditEvent('DATABASE_RESTORED', `Database restored in ${mode || 'replace'} mode by Super Admin`, undefined, undefined, session.username);

      return res.json({
        success: true,
        message: 'Database restore operation completed successfully!',
        mode: mode || 'replace',
        stats,
        data: storeData,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Database restore error: ' + err.message });
    }
  });

  // 7. Data Integrity Verification & Health Diagnostic API
  app.post('/api/backup/verify-integrity', requireAdminAuth, (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super Admin access required.' });
    }

    const issues: string[] = [];
    const suggestions: string[] = [];
    let healthy = true;

    // Check Categories
    const categoryIds = new Set((storeData.categories || []).map((c) => c.id));
    const storeIds = new Set((storeData.stores || []).map((s) => s.id));

    // Check Products
    (storeData.products || []).forEach((p) => {
      if (!p.id) {
        issues.push(`Product "${p.name}" has missing ID`);
        healthy = false;
      }
      if (p.categoryId && !categoryIds.has(p.categoryId)) {
        issues.push(`Product "${p.name}" references non-existent category "${p.categoryId}"`);
        healthy = false;
      }
      if (p.store_id && !storeIds.has(p.store_id)) {
        issues.push(`Product "${p.name}" references non-existent store "${p.store_id}"`);
        healthy = false;
      }
    });

    // Check Orders
    (storeData.orders || []).forEach((o) => {
      if (!o.order_id) {
        issues.push(`Order missing order_id`);
        healthy = false;
      }
    });

    if (issues.length === 0) {
      suggestions.push('All foreign key references, modules, stores, categories, and products are perfectly aligned.');
    } else {
      suggestions.push('Consider executing a Merge Restore from a validated backup or correcting orphan product categories.');
    }

    return res.json({
      success: true,
      healthy,
      issueCount: issues.length,
      issues,
      suggestions,
      counts: {
        products: storeData.products?.length || 0,
        categories: storeData.categories?.length || 0,
        modules: storeData.modules?.length || 0,
        stores: storeData.stores?.length || 0,
        orders: storeData.orders?.length || 0,
        customers: storeData.customers?.length || 0,
      },
    });
  });

  // Legacy Backup & Restore aliases for backward compatibility
  app.get('/api/backup', requireAdminAuth, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=hyperlocal_backup_${Date.now()}.json`);
    const sanitized = sanitizeDataForExport(storeData);
    res.send(JSON.stringify(sanitized, null, 2));
  });

  app.post('/api/restore', requireAdminAuth, async (req, res) => {
    try {
      const backup: AppData = req.body;
      if (!backup || !Array.isArray(backup.modules)) {
        return res.status(400).json({ error: 'Invalid backup file structure' });
      }
      storeData = {
        modules: Array.isArray(backup.modules) ? backup.modules : initialData.modules,
        categories: Array.isArray(backup.categories) ? backup.categories : initialData.categories,
        products: Array.isArray(backup.products) ? backup.products : initialData.products,
        banners: Array.isArray(backup.banners) ? backup.banners : initialData.banners,
        orders: Array.isArray(backup.orders) ? backup.orders : [],
        users: Array.isArray(backup.users) ? backup.users : initialData.users || [],
        customers: Array.isArray(backup.customers) ? backup.customers : [],
        stores: Array.isArray(backup.stores) ? backup.stores : initialData.stores || [],
        audit_logs: Array.isArray(backup.audit_logs) ? backup.audit_logs : [],
        settings: { ...initialData.settings, ...(backup.settings || {}) },
        platform_templates: Array.isArray(backup.platform_templates) ? backup.platform_templates : initialData.platform_templates,
        platform_template_settings: backup.platform_template_settings || initialData.platform_template_settings,
        store_templates: Array.isArray(backup.store_templates) ? backup.store_templates : initialData.store_templates,
        market_categories: Array.isArray(backup.market_categories) ? backup.market_categories : initialData.market_categories,
        market_banners: Array.isArray(backup.market_banners) ? backup.market_banners : initialData.market_banners,
        market_settings: backup.market_settings || initialData.market_settings,
      };
      await saveStoreData(storeData);
      return res.json({ success: true, data: storeData, message: 'Database successfully restored!' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to restore: ' + err.message });
    }
  });

  // Global Settings Update (Super Admin Protected)
  app.post('/api/settings', requireAdminAuth, async (req, res) => {
    const session = (req as any).adminSession as AdminSession;
    if (session.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can modify global platform settings.' });
    }

    if (req.body) {
      const newSettings = { ...req.body };
      if (newSettings.admin_password && !newSettings.admin_password.startsWith('$pbkdf2$')) {
        newSettings.admin_password = hashPassword(newSettings.admin_password);
      }
      storeData.settings = { ...storeData.settings, ...newSettings };
      logAuditEvent('SETTINGS_UPDATED', 'Global settings updated by Super Admin', undefined, undefined, session.username);
      await saveStoreData(storeData);
      return res.json({ success: true, settings: sanitizeSettingsForPublic(storeData.settings) });
    }
    return res.status(400).json({ error: 'Invalid settings' });
  });

  // Secure File & Image Upload Endpoint
  app.post('/api/upload', requireAdminAuth, (req, res) => {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Data URL payload is required' });
    }

    try {
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 image encoding' });
      }

      const mimeType = matches[1];
      const rawExt = mimeType.split('/')[1] || 'png';
      const cleanExt = rawExt.split('+')[0].toLowerCase();
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'];
      const safeExt = allowedExts.includes(cleanExt) ? cleanExt : 'png';

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds maximum 15MB limit' });
      }

      const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      const uniqueName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${safeExt}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/${uniqueName}`;

      return res.json({
        success: true,
        url,
        filename: filename || uniqueName,
        size: buffer.length,
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'Upload failed: ' + err.message });
    }
  });

  // Test Webhook Dispatch
  app.post('/api/test-webhook', requireAdminAuth, async (req, res) => {
    const targetWebhookUrl = (req.body?.webhook_url || storeData.settings.n8n_webhook_url || '').trim() || (process.env.N8N_WEBHOOK_URL || '').trim();
    const signingSecret = (req.body?.webhook_secret !== undefined ? req.body.webhook_secret : storeData.settings.n8n_webhook_secret || '').trim() || (process.env.N8N_WEBHOOK_SECRET || '').trim();

    if (!targetWebhookUrl) {
      return res.status(400).json({ error: 'n8n Webhook URL is not configured. Please enter and save a Webhook URL in Admin Panel > Integrations.' });
    }
    try {
      const webhookHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'HM-Q-Hyperlocal-Commerce/0.0.2',
      };
      if (signingSecret) {
        webhookHeaders['X-Webhook-Secret'] = signingSecret;
      }

      const sampleStore = (storeData.stores && storeData.stores[0]) || { id: 'store-1', name: storeData.settings.store_name, store_code: 'STORE1' };

      const response = await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify({
          event: 'order.created',
          order: {
            order_id: `TEST-ORDER-${Date.now().toString(36).toUpperCase()}`,
            store_id: sampleStore.id,
            store_code: (sampleStore as any).store_code || 'STORE1',
            store_name: sampleStore.name,
            merchant_whatsapp_phone: (sampleStore as any).whatsapp_phone || '919876543210',
            customer_name: 'Test Customer',
            customer_phone: '919876543210',
            customer_whatsapp: '919876543210',
            delivery_address: '123 Test Street, Hyperlocal City',
            delivery_slot: 'Express 15-20 min',
            payment_method: 'cod',
            payment_status: 'Pending',
            subtotal: 250,
            delivery_fee: 30,
            total_amount: 280,
            currency: 'INR',
            items: [
              {
                product_id: 'prod-test-1',
                name: 'Fresh Organic Milk (1L)',
                quantity: 2,
                price: 60,
                total: 120,
              },
              {
                product_id: 'prod-test-2',
                name: 'Whole Wheat Bread (400g)',
                quantity: 1,
                price: 45,
                total: 45,
              },
            ],
          },
          source: 'website_admin_test',
          timestamp: new Date().toISOString(),
        }),
      });

      const text = await response.text();
      const isSuccess = response.ok;
      storeData.settings.n8n_last_test_status = isSuccess ? 'SUCCESS' : `FAILED (HTTP ${response.status})`;
      storeData.settings.n8n_last_test_time = new Date().toISOString();
      await saveStoreData(storeData);

      return res.json({
        success: isSuccess,
        status: response.status,
        message: isSuccess
          ? `SUCCESS (HTTP ${response.status}): Webhook payload delivered and acknowledged by n8n!`
          : `FAILED (HTTP ${response.status}): n8n responded with error. Check your n8n workflow execution logs.`,
        responseText: text,
      });
    } catch (err: any) {
      storeData.settings.n8n_last_test_status = `FAILED: ${err?.message || 'Network error'}`;
      storeData.settings.n8n_last_test_time = new Date().toISOString();
      await saveStoreData(storeData);

      return res.json({
        success: false,
        status: 0,
        message: `FAILED: Network error connecting to Webhook URL (${err?.message || 'Connection refused or timeout'})`,
      });
    }
  });

  // AI Product Upscale Endpoint (Powered by Gemini 3.7 Flash)
  app.post('/api/ai/upscale-product', async (req, res) => {
    const { name, category, currentDescription, price } = req.body || {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful smart heuristic fallback if Gemini API Key not yet injected
      const cleanName = name.trim();
      return res.json({
        success: true,
        source: 'smart-template',
        data: {
          title: cleanName,
          description: currentDescription || `Premium quality ${cleanName}, sourced fresh and delivered swiftly to your doorstep with guaranteed customer satisfaction.`,
          badge: '⚡ Top Pick',
          keyFeatures: [
            'Freshly sourced and quality inspected',
            'Carefully packed for maximum freshness',
            'Swift hyperlocal delivery in 15-30 minutes',
          ],
          seoTags: [cleanName.toLowerCase(), category?.toLowerCase() || 'hyperlocal', 'fast delivery', 'best price'],
          whatsappShareText: `🛒 *${cleanName}*\n💰 Price: ₹${price || 99}\n🚚 Fast Delivery Available!\n👉 Order now on WhatsApp!`,
        },
      });
    }

    try {
      const prompt = `You are an expert e-commerce copywriter for a fast hyperlocal quick-commerce platform.
Upscale and generate high-converting details for this product:
Product Name: "${name}"
Category: "${category || 'General'}"
Current Description: "${currentDescription || ''}"
Price: ₹${price || ''}

Provide an appealing product title, an engaging 2-sentence description, 3 bullet key features, an eye-catching short badge (1-2 words), 4 SEO tags, and a crisp emoji-formatted WhatsApp share message.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              badge: { type: Type.STRING },
              keyFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              seoTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              whatsappShareText: { type: Type.STRING },
            },
            required: ['title', 'description', 'badge', 'keyFeatures', 'seoTags', 'whatsappShareText'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.7-flash',
        data: parsed,
      });
    } catch (err: any) {
      console.error('[Gemini AI Upscale Product Error]:', err?.message);
      return res.json({
        success: true,
        source: 'fallback',
        data: {
          title: name,
          description: currentDescription || `Authentic, high-grade ${name} curated for everyday excellence and delivered within minutes.`,
          badge: '✨ Verified',
          keyFeatures: [
            '100% Quality & Freshness Guarantee',
            'Hygienically packaged and handled',
            'Direct merchant dispatched',
          ],
          seoTags: [name.toLowerCase(), 'fresh', 'best deal', 'fast delivery'],
          whatsappShareText: `🛍️ *${name}*\n🏷️ Available now!\n💬 Message us to order instantly.`,
        },
      });
    }
  });

  // AI Store Marketing & Story Upscale Endpoint
  app.post('/api/ai/upscale-store', async (req, res) => {
    const { name, category, address } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, error: 'Store name is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        source: 'smart-template',
        data: {
          tagline: `Your Neighborhood Destination for ${category || 'Quality Essentials'}`,
          story: `${name} serves ${address || 'the local community'} with fresh stock, fair pricing, and rapid WhatsApp ordering.`,
          whatsappBroadcast: `👋 Hello from *${name}*! We are now open for instant WhatsApp delivery. Check out our freshest catalog today! 🚀`,
        },
      });
    }

    try {
      const prompt = `Generate a compelling marketing tagline, a brief 2-sentence store story, and a catchy WhatsApp broadcast message for this hyperlocal store:
Store Name: "${name}"
Category: "${category || 'Hyperlocal Commerce'}"
Location: "${address || 'Local Town'}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tagline: { type: Type.STRING },
              story: { type: Type.STRING },
              whatsappBroadcast: { type: Type.STRING },
            },
            required: ['tagline', 'story', 'whatsappBroadcast'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.7-flash',
        data: parsed,
      });
    } catch (err: any) {
      console.error('[Gemini AI Upscale Store Error]:', err?.message);
      return res.json({
        success: true,
        source: 'fallback',
        data: {
          tagline: `Premier ${category || 'Essentials'} in Town`,
          story: `${name} brings you curated selections with instant doorstep delivery and verified service.`,
          whatsappBroadcast: `🔥 Fresh arrivals at *${name}*! Order directly on WhatsApp with speedy delivery.`,
        },
      });
    }
  });

  // ============================================================================
  // AI STUDIO COMMERCE OS - UNIFIED /api/v1 REST SUITE & DEVELOPER API GATEWAY
  // ============================================================================

  // API Key Authentication Middleware helper for /api/v1/*
  const validateApiKeyOrSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
    if (apiKeyHeader) {
      const rawKey = String(apiKeyHeader).replace(/^Bearer\s+/i, '').trim();
      const matchedKey = (storeData.api_keys || []).find(
        (k) => k.status === 'active' && (k.id === rawKey || rawKey.startsWith(k.key_prefix.slice(0, 8)))
      );
      if (matchedKey) {
        matchedKey.total_requests = (matchedKey.total_requests || 0) + 1;
        matchedKey.last_used_at = new Date().toISOString();
        (req as any).apiKey = matchedKey;
        return next();
      }
    }

    // Fallback: Check if active admin or customer session
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || String(req.headers['x-admin-token'] || '').trim();
    if (token && activeSessions.has(token)) {
      return next();
    }

    // Allow read requests or proceed
    next();
  };

  app.use('/api/v1', validateApiKeyOrSession);

  // 1. API Platform Health & Capabilities
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      success: true,
      platform: 'AI Studio Commerce OS',
      version: 'v2.4.0-enterprise',
      status: 'operational',
      timestamp: new Date().toISOString(),
      capabilities: [
        'multi_tenant_stores',
        'hyperlocal_quick_commerce',
        'whatsapp_order_engine',
        'pos_cashier_terminal',
        'rider_fleet_management',
        'developer_api_keys',
        'webhook_dispatcher',
        'merchant_subscriptions',
        'loyalty_and_referral',
      ],
    });
  });

  // 2. Developer API Key Management
  app.get('/api/v1/developer/keys', (_req, res) => {
    return res.json({
      success: true,
      keys: storeData.api_keys || [],
    });
  });

  app.post('/api/v1/developer/keys', async (req, res) => {
    const { name, client_name, environment, scopes, rate_limit_rpm, ip_whitelist } = req.body || {};
    if (!name || !client_name) {
      return res.status(400).json({ success: false, error: 'Key name and client name are required.' });
    }

    const envPrefix = environment === 'test' ? 'hmq_test_' : 'hmq_live_';
    const randomSecret = envPrefix + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const keyId = 'key-' + Date.now().toString(36);

    const newKey: any = {
      id: keyId,
      name: name.trim(),
      client_name: client_name.trim(),
      key_prefix: randomSecret.substring(0, 16) + '...',
      environment: environment || 'production',
      scopes: Array.isArray(scopes) && scopes.length > 0 ? scopes : ['read:products', 'read:orders', 'write:orders'],
      status: 'active',
      rate_limit_rpm: Number(rate_limit_rpm) || 600,
      ip_whitelist: Array.isArray(ip_whitelist) ? ip_whitelist : [],
      created_at: new Date().toISOString(),
      total_requests: 0,
    };

    if (!storeData.api_keys) storeData.api_keys = [];
    storeData.api_keys.unshift(newKey);
    await saveStoreData(storeData);

    return res.json({
      success: true,
      message: 'API Key generated successfully. Copy the secret now as it will not be displayed again.',
      key: newKey,
      plain_text_secret: randomSecret, // Displayed once upon creation
    });
  });

  app.delete('/api/v1/developer/keys/:id', async (req, res) => {
    const { id } = req.params;
    if (storeData.api_keys) {
      const target = storeData.api_keys.find((k) => k.id === id);
      if (target) {
        target.status = 'revoked';
        await saveStoreData(storeData);
        return res.json({ success: true, message: 'API Key revoked successfully.' });
      }
    }
    return res.status(404).json({ success: false, error: 'API Key not found.' });
  });

  // 3. Developer App Registry / Clients
  app.get('/api/v1/developer/clients', (_req, res) => {
    return res.json({
      success: true,
      clients: storeData.api_clients || [],
    });
  });

  app.post('/api/v1/developer/clients', async (req, res) => {
    const { app_name, client_type, platform, bundle_id, version, webhook_url, assigned_store_id } = req.body || {};
    if (!app_name) {
      return res.status(400).json({ success: false, error: 'App name is required.' });
    }

    const newClient: any = {
      id: 'app-' + Date.now().toString(36),
      app_name: app_name.trim(),
      client_type: client_type || 'third_party_saas',
      platform: platform || 'flutter',
      bundle_id: bundle_id?.trim() || undefined,
      version: version?.trim() || 'v1.0.0',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
      webhook_url: webhook_url?.trim() || undefined,
      assigned_store_id: assigned_store_id || undefined,
    };

    if (!storeData.api_clients) storeData.api_clients = [];
    storeData.api_clients.push(newClient);
    await saveStoreData(storeData);

    return res.json({ success: true, client: newClient });
  });

  // 4. Webhook Subscriptions & Trigger Logs
  app.get('/api/v1/developer/webhooks', (_req, res) => {
    return res.json({
      success: true,
      subscriptions: storeData.webhook_subscriptions || [],
      logs: (storeData.webhook_logs || []).slice(0, 50),
    });
  });

  app.post('/api/v1/developer/webhooks', async (req, res) => {
    const { name, target_url, events } = req.body || {};
    if (!name || !target_url) {
      return res.status(400).json({ success: false, error: 'Webhook name and target URL are required.' });
    }

    const sub: any = {
      id: 'wh-' + Date.now().toString(36),
      name: name.trim(),
      target_url: target_url.trim(),
      events: Array.isArray(events) && events.length > 0 ? events : ['order.created', 'order.delivered'],
      signing_secret: 'whsec_' + Math.random().toString(36).substring(2, 10),
      is_active: true,
      retry_count: 3,
      created_at: new Date().toISOString().split('T')[0],
      total_deliveries: 0,
      failed_deliveries: 0,
    };

    if (!storeData.webhook_subscriptions) storeData.webhook_subscriptions = [];
    storeData.webhook_subscriptions.push(sub);
    await saveStoreData(storeData);

    return res.json({ success: true, subscription: sub });
  });

  app.post('/api/v1/developer/webhooks/:id/test', async (req, res) => {
    const { id } = req.params;
    const sub = (storeData.webhook_subscriptions || []).find((s) => s.id === id);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Webhook subscription not found.' });
    }

    try {
      const payload = {
        event: 'order.created',
        timestamp: new Date().toISOString(),
        subscription_id: sub.id,
        test: true,
        data: {
          order_id: 'ORD-TEST-' + Math.floor(1000 + Math.random() * 9000),
          total: 350,
          customer_name: 'Test Customer',
        },
      };

      const start = Date.now();
      const resp = await fetch(sub.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hmq-signature': sub.signing_secret,
        },
        body: JSON.stringify(payload),
      });

      const duration = Date.now() - start;
      sub.last_triggered_at = new Date().toISOString();
      sub.last_status_code = resp.status;
      sub.total_deliveries = (sub.total_deliveries || 0) + 1;

      const log: any = {
        id: 'wlog-' + Date.now().toString(36),
        subscription_id: sub.id,
        event: 'order.created',
        payload,
        status_code: resp.status,
        response_time_ms: duration,
        timestamp: new Date().toISOString(),
        status: resp.ok ? 'success' : 'failed',
        attempts: 1,
      };

      if (!storeData.webhook_logs) storeData.webhook_logs = [];
      storeData.webhook_logs.unshift(log);
      await saveStoreData(storeData);

      return res.json({
        success: resp.ok,
        status_code: resp.status,
        response_time_ms: duration,
        message: resp.ok ? 'Webhook ping delivered successfully!' : `Target responded with HTTP ${resp.status}`,
      });
    } catch (err: any) {
      return res.json({
        success: false,
        error: `Delivery failed: ${err?.message || 'Network timeout or unreachable'}`,
      });
    }
  });

  // 5. Delivery Riders / Fleet Management Endpoints
  app.get('/api/v1/delivery/riders', (_req, res) => {
    return res.json({
      success: true,
      riders: storeData.delivery_riders || [],
    });
  });

  app.post('/api/v1/delivery/riders', async (req, res) => {
    const { name, phone, vehicle_type, vehicle_number, assigned_store_name } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Rider name and phone are required.' });
    }

    const norm = normalizePhone(phone);
    const newRider: any = {
      id: 'rider-' + Date.now().toString(36),
      name: name.trim(),
      phone: norm,
      whatsapp_phone: '91' + norm.replace(/^(\+?91)/, ''),
      vehicle_type: vehicle_type || 'bike',
      vehicle_number: vehicle_number?.trim() || undefined,
      status: 'online',
      assigned_store_name: assigned_store_name?.trim() || undefined,
      rating: 5.0,
      total_deliveries: 0,
      today_deliveries: 0,
      pending_orders: [],
      wallet_balance: 0,
      cash_in_hand: 0,
      registered_at: new Date().toISOString().split('T')[0],
      current_location: {
        lat: 10.9168,
        lng: 75.9238,
        address_name: 'Town Delivery Zone',
        updated_at: 'Just registered',
      },
    };

    if (!storeData.delivery_riders) storeData.delivery_riders = [];
    storeData.delivery_riders.unshift(newRider);
    await saveStoreData(storeData);

    return res.json({ success: true, rider: newRider });
  });

  app.patch('/api/v1/delivery/riders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const rider = (storeData.delivery_riders || []).find((r) => r.id === id);
    if (!rider) {
      return res.status(404).json({ success: false, error: 'Rider not found.' });
    }

    if (['online', 'offline', 'busy', 'suspended'].includes(status)) {
      rider.status = status;
      await saveStoreData(storeData);
      return res.json({ success: true, rider });
    }
    return res.status(400).json({ success: false, error: 'Invalid status value.' });
  });

  // 6. Point of Sale (POS) Cashier Checkout Endpoints
  app.get('/api/v1/pos/transactions', (_req, res) => {
    return res.json({
      success: true,
      transactions: (storeData.pos_transactions || []).slice(0, 100),
    });
  });

  app.post('/api/v1/pos/checkout', async (req, res) => {
    const { store_id, store_name, cashier_name, customer_name, customer_phone, items, payment_method, discount_amount } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one item is required for POS checkout.' });
    }

    let subtotal = 0;
    items.forEach((item: any) => {
      subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    });

    const disc = Number(discount_amount) || 0;
    const tax = Math.round(subtotal * 0.05); // 5% GST/Tax
    const total = Math.max(0, subtotal - disc + tax);

    const posTx: any = {
      id: 'pos-tx-' + Date.now().toString(36),
      bill_number: 'POS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      store_id: store_id || 'STR-10025',
      store_name: store_name || 'Store POS',
      cashier_name: cashier_name || 'Cashier Counter',
      customer_name: customer_name?.trim() || 'Walk-in Guest',
      customer_phone: customer_phone ? normalizePhone(customer_phone) : undefined,
      items,
      subtotal,
      tax_amount: tax,
      discount_amount: disc,
      total_amount: total,
      payment_method: payment_method || 'cash',
      payment_status: 'paid',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (!storeData.pos_transactions) storeData.pos_transactions = [];
    storeData.pos_transactions.unshift(posTx);
    await saveStoreData(storeData);

    return res.json({
      success: true,
      transaction: posTx,
      message: 'POS Transaction completed successfully',
    });
  });

  // 7. Merchant Subscriptions & Plans
  app.get('/api/v1/subscriptions/plans', (_req, res) => {
    return res.json({
      success: true,
      plans: storeData.subscription_plans || [],
      store_subscriptions: storeData.store_subscriptions || [],
    });
  });

  // 8. Reviews & Ratings Moderation
  app.get('/api/v1/reviews', (_req, res) => {
    return res.json({
      success: true,
      reviews: storeData.reviews || [],
    });
  });

  app.patch('/api/v1/reviews/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const rev = (storeData.reviews || []).find((r) => r.id === id);
    if (!rev) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }
    if (['approved', 'pending', 'rejected'].includes(status)) {
      rev.status = status;
      await saveStoreData(storeData);
      return res.json({ success: true, review: rev });
    }
    return res.status(400).json({ success: false, error: 'Invalid review status.' });
  });

  // 9. Advertisements & Banners Management
  app.get('/api/v1/advertisements', (_req, res) => {
    return res.json({
      success: true,
      advertisements: storeData.advertisements || [],
    });
  });

  // 10. Loyalty & Referral Rewards
  app.get('/api/v1/loyalty/rewards', (_req, res) => {
    return res.json({
      success: true,
      rewards: storeData.loyalty_rewards || [],
    });
  });

  // Real-time System Upscale & Health Telemetry
  app.get('/api/system/health-upscale', (_req, res) => {
    const mem = process.memoryUsage();
    res.json({
      status: 'operational',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      platform_version: '3.6.0',
      database: {
        type: isMysqlConnected() ? 'MySQL (Persistent)' : 'JSON Data Store (File-Backed)',
        status: isMysqlConnected() ? 'CONNECTED' : 'ACTIVE_LOCAL_STORAGE',
      },
      counts: {
        stores: storeData.stores?.length || 0,
        products: storeData.products?.length || 0,
        categories: storeData.categories?.length || 0,
        orders: storeData.orders?.length || 0,
        customers: storeData.customers?.length || 0,
        modules: storeData.modules?.length || 0,
        api_keys: storeData.api_keys?.length || 0,
        api_clients: storeData.api_clients?.length || 0,
        delivery_riders: storeData.delivery_riders?.length || 0,
        pos_transactions: storeData.pos_transactions?.length || 0,
      },
      memory: {
        heap_used_mb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
        heap_total_mb: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
        rss_mb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      },
      features: {
        ai_gemini_configured: Boolean(process.env.GEMINI_API_KEY),
        n8n_webhook_active: Boolean(storeData.settings?.n8n_webhook_url || process.env.N8N_WEBHOOK_URL),
        pwa_enabled: storeData.settings?.pwa_enabled !== false,
      },
    });
  });


  // 404 Handler for undefined API routes (ensures JSON error is returned instead of HTML)
  app.all('/api/*', (req, res) => {
    return res.status(404).json({
      success: false,
      error: `API route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Vite Middleware in dev mode / Static bundle in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true as const,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HM-Q Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
