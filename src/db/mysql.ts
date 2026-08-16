import mysql from 'mysql2/promise';
import { AppData, StoreSettings, Module, Category, Product, DeliverySlot, Order, AdminUser, VendorStore, Customer, AuditLog, PlatformTemplate, PlatformTemplateSettings, StoreTemplateConfig } from '../types';

export interface DbStatus {
  connected: boolean;
  engine: 'mysql' | 'json_file';
  host?: string;
  database?: string;
  user?: string;
  lastChecked: string;
  error?: string;
  tableCounts?: Record<string, number>;
}

let pool: mysql.Pool | null = null;
let isConnected = false;
let lastError = '';

export function getDbConfig() {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST || '';
  const port = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);
  const database = process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'hmqin';
  const user = process.env.DB_USERNAME || process.env.MYSQL_USER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
  const connectionType = process.env.DB_CONNECTION || (host ? 'mysql' : 'json');

  return {
    host,
    port,
    database,
    user,
    password,
    connectionType,
    isConfigured: !!(host && host.trim().length > 0),
  };
}

export async function initMysqlPool(): Promise<boolean> {
  const config = getDbConfig();
  if (!config.isConfigured) {
    isConnected = false;
    lastError = 'DB_HOST not set in environment. Running in JSON data store mode.';
    return false;
  }

  try {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
    });

    // Test connection with a quick ping
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    isConnected = true;
    lastError = '';
    console.log(`[MySQL] Connected successfully to ${config.user}@${config.host}:${config.port}/${config.database}`);

    // Ensure database tables exist
    await ensureTablesExist();
    return true;
  } catch (err: any) {
    isConnected = false;
    lastError = err.message || 'Connection failed';
    console.warn(`[MySQL] Connection failed (${lastError}). Falling back to local data store file.`);
    return false;
  }
}

export function isMysqlConnected(): boolean {
  return isConnected && pool !== null;
}

export async function ensureTablesExist(): Promise<void> {
  if (!pool || !isConnected) return;

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS store_settings (
      id INT PRIMARY KEY,
      store_name VARCHAR(255) NOT NULL DEFAULT 'WhatsApp Hyperlocal Store',
      store_whatsapp_phone VARCHAR(50) DEFAULT '',
      super_admin_whatsapp_phone VARCHAR(50) DEFAULT '',
      admin_username VARCHAR(100) DEFAULT 'admin',
      admin_password VARCHAR(255) DEFAULT 'admin123',
      admin_pin VARCHAR(50) DEFAULT '1234',
      admin_logo TEXT,
      admin_banner_title VARCHAR(255) DEFAULT 'Hyperlocal WhatsApp Store Portal',
      admin_banner_subtitle VARCHAR(255) DEFAULT 'Manage products, categories, orders and WhatsApp settings.',
      n8n_webhook_url TEXT,
      n8n_webhook_secret TEXT,
      n8n_host VARCHAR(255) DEFAULT 'localhost',
      n8n_port VARCHAR(50) DEFAULT '5678',
      n8n_protocol VARCHAR(50) DEFAULT 'http',
      pwa_enabled BOOLEAN DEFAULT TRUE,
      pwa_name VARCHAR(255) DEFAULT 'Hyperlocal WhatsApp Store',
      pwa_short_name VARCHAR(100) DEFAULT 'HyperlocalApp',
      pwa_description TEXT,
      pwa_icon TEXT,
      pwa_theme_color VARCHAR(50) DEFAULT '#059669',
      pwa_bg_color VARCHAR(50) DEFAULT '#f8fafc',
      pwa_display_mode VARCHAR(50) DEFAULT 'standalone',
      cod_enabled BOOLEAN DEFAULT TRUE,
      upi_enabled BOOLEAN DEFAULT TRUE,
      wallet_enabled BOOLEAN DEFAULT TRUE,
      wallet_demo_balance DECIMAL(10,2) DEFAULT 500.00,
      upi_id VARCHAR(255) DEFAULT '',
      upi_phone VARCHAR(50) DEFAULT '',
      upi_payee_name VARCHAR(255) DEFAULT 'Hyperlocal Store Owner',
      upi_qr_image TEXT,
      bottom_nav_items_json TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS modules (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      time VARCHAR(100) DEFAULT '20-30 min',
      icon VARCHAR(100) DEFAULT '🥦',
      image TEXT,
      bg_color VARCHAR(255) DEFAULT 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      text_color VARCHAR(50) DEFAULT '#1b5e20',
      size VARCHAR(50) DEFAULT 'medium',
      enabled BOOLEAN DEFAULT TRUE,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      module_id VARCHAR(100) NOT NULL,
      icon VARCHAR(100) DEFAULT '🥬',
      image TEXT,
      store_id VARCHAR(100) DEFAULT NULL,
      is_demo BOOLEAN DEFAULT FALSE,
      enabled BOOLEAN DEFAULT TRUE,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category_id VARCHAR(100) NOT NULL,
      module_id VARCHAR(100) NOT NULL,
      store_id VARCHAR(100) DEFAULT NULL,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2) DEFAULT NULL,
      unit VARCHAR(50) DEFAULT '1 item',
      rating DECIMAL(3,2) DEFAULT 4.5,
      delivery_time VARCHAR(100) DEFAULT '20 min',
      image TEXT,
      description TEXT,
      available BOOLEAN DEFAULT TRUE,
      enabled BOOLEAN DEFAULT TRUE,
      stock INT DEFAULT 100,
      stock_alert_threshold INT DEFAULT 5,
      requires_prescription BOOLEAN DEFAULT FALSE,
      is_demo BOOLEAN DEFAULT FALSE,
      is_market BOOLEAN DEFAULT FALSE,
      order_index INT DEFAULT 0,
      variants_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS delivery_slots (
      id VARCHAR(100) PRIMARY KEY,
      time VARCHAR(100) NOT NULL,
      label VARCHAR(255) DEFAULT '',
      fee DECIMAL(10,2) DEFAULT 0.00,
      is_free BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      order_index INT DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS orders (
      order_id VARCHAR(100) PRIMARY KEY,
      store_id VARCHAR(100) DEFAULT NULL,
      store_name VARCHAR(255) DEFAULT NULL,
      customer_id VARCHAR(100) DEFAULT NULL,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(100) NOT NULL,
      customer_whatsapp VARCHAR(100),
      customer_address TEXT,
      delivery_slot_time VARCHAR(100),
      delivery_fee DECIMAL(10,2) DEFAULT 0.00,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'cod',
      payment_status VARCHAR(50) DEFAULT 'Pending',
      payment_transaction_id VARCHAR(255) DEFAULT NULL,
      order_status VARCHAR(50) DEFAULT 'Order Placed',
      notes TEXT,
      webhook_status VARCHAR(50) DEFAULT 'pending',
      items_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      store_id VARCHAR(100) DEFAULT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'staff',
      phone VARCHAR(50) DEFAULT '',
      whatsapp_phone VARCHAR(50) DEFAULT '',
      permissions_json TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS stores (
      id VARCHAR(100) PRIMARY KEY,
      store_code VARCHAR(100) UNIQUE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      category VARCHAR(100) DEFAULT 'General',
      owner_name VARCHAR(255) NOT NULL,
      owner_user_id VARCHAR(100) DEFAULT NULL,
      phone VARCHAR(50) NOT NULL,
      whatsapp_phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) DEFAULT '',
      address TEXT NOT NULL,
      logo TEXT,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      active BOOLEAN DEFAULT TRUE,
      modules_json TEXT NOT NULL,
      settings_json TEXT,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS customers (
      customer_id VARCHAR(100) PRIMARY KEY,
      whatsapp_number VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) DEFAULT 'Customer',
      email VARCHAR(255) DEFAULT '',
      address TEXT,
      saved_addresses_json TEXT,
      status VARCHAR(50) DEFAULT 'active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(100) PRIMARY KEY,
      store_id VARCHAR(100) DEFAULT NULL,
      store_name VARCHAR(255) DEFAULT NULL,
      user_name VARCHAR(255) DEFAULT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS platform_templates (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      version VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Installed',
      manifest_json TEXT NOT NULL,
      installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS store_templates (
      id VARCHAR(100) PRIMARY KEY,
      store_id VARCHAR(100) NOT NULL UNIQUE,
      template_id VARCHAR(100) DEFAULT 'default-store',
      primary_color VARCHAR(50) DEFAULT '#059669',
      secondary_color VARCHAR(50) DEFAULT '#10b981',
      product_card_style VARCHAR(50) DEFAULT 'grid',
      show_categories_bar BOOLEAN DEFAULT TRUE,
      show_store_hours BOOLEAN DEFAULT TRUE,
      custom_css TEXT,
      status VARCHAR(50) DEFAULT 'published',
      version VARCHAR(50) DEFAULT '1.0.0',
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const statement of ddlStatements) {
    try {
      await pool.query(statement);
    } catch (err: any) {
      console.warn(`[MySQL DDL Warning] ${err.message}`);
    }
  }
}

export async function loadDataFromMysql(): Promise<AppData | null> {
  if (!pool || !isConnected) return null;

  try {
    const [settingsRows]: any = await pool.query('SELECT * FROM store_settings WHERE id = 1 LIMIT 1');
    const [modulesRows]: any = await pool.query('SELECT * FROM modules ORDER BY order_index ASC');
    const [categoriesRows]: any = await pool.query('SELECT * FROM categories ORDER BY order_index ASC');
    const [productsRows]: any = await pool.query('SELECT * FROM products ORDER BY order_index ASC');
    const [ordersRows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500');
    const [usersRows]: any = await pool.query('SELECT * FROM users');
    const [storesRows]: any = await pool.query('SELECT * FROM stores');
    const [customersRows]: any = await pool.query('SELECT * FROM customers');
    const [auditRows]: any = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 300');

    // If tables are completely empty, return null so we can seed initial data
    if (!settingsRows.length && !storesRows.length && !productsRows.length) {
      return null;
    }

    const s = settingsRows[0] || {};
    let bottomNavItems = [];
    try {
      if (s.bottom_nav_items_json) bottomNavItems = JSON.parse(s.bottom_nav_items_json);
    } catch {}

    const settings: StoreSettings = {
      store_name: s.store_name || 'Hyperlocal WhatsApp Store',
      store_whatsapp_phone: s.store_whatsapp_phone || '',
      super_admin_whatsapp_phone: s.super_admin_whatsapp_phone || '',
      admin_username: s.admin_username || 'admin',
      admin_password: s.admin_password || '',
      admin_pin: s.admin_pin || '1234',
      admin_logo: s.admin_logo || '',
      admin_banner_title: s.admin_banner_title || 'Hyperlocal WhatsApp Store Portal',
      admin_banner_subtitle: s.admin_banner_subtitle || 'Manage products, categories, orders and WhatsApp settings.',
      n8n_webhook_url: s.n8n_webhook_url || '',
      n8n_webhook_secret: s.n8n_webhook_secret || '',
      n8n_host: s.n8n_host || 'localhost',
      n8n_port: s.n8n_port || 5678,
      n8n_protocol: s.n8n_protocol || 'http',
      pwa_enabled: !!s.pwa_enabled,
      pwa_name: s.pwa_name || 'Hyperlocal WhatsApp Store',
      pwa_short_name: s.pwa_short_name || 'HyperlocalApp',
      pwa_description: s.pwa_description || '',
      pwa_icon: s.pwa_icon || '',
      pwa_theme_color: s.pwa_theme_color || '#059669',
      pwa_bg_color: s.pwa_bg_color || '#f8fafc',
      pwa_display_mode: s.pwa_display_mode || 'standalone',
      cod_enabled: s.cod_enabled !== 0,
      upi_enabled: s.upi_enabled !== 0,
      wallet_enabled: s.wallet_enabled !== 0,
      wallet_demo_balance: parseFloat(s.wallet_demo_balance || '500'),
      upi_id: s.upi_id || '',
      upi_phone: s.upi_phone || '',
      upi_payee_name: s.upi_payee_name || '',
      upi_qr_image: s.upi_qr_image || '',
      bottom_nav_items: bottomNavItems,
      delivery_address: 'Main Market, Tirur, Kerala',
    };

    const modules: Module[] = modulesRows.map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description || '',
      time: m.time || '20-30 min',
      icon: m.icon || '🥦',
      image: m.image,
      bgColor: m.bg_color || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      textColor: m.text_color,
      size: m.size || 'medium',
      enabled: m.enabled !== 0,
      order: m.order_index || 0,
    }));

    const categories: Category[] = categoriesRows.map((c: any) => ({
      id: c.id,
      name: c.name,
      moduleId: c.module_id,
      icon: c.icon || '🥬',
      image: c.image,
      store_id: c.store_id || undefined,
      is_demo: !!c.is_demo,
      enabled: c.enabled !== 0,
      order: c.order_index || 0,
    }));

    const products: Product[] = productsRows.map((p: any) => {
      let variants = [];
      try {
        if (p.variants_json) variants = JSON.parse(p.variants_json);
      } catch {}
      return {
        id: p.id,
        name: p.name,
        categoryId: p.category_id,
        moduleId: p.module_id,
        store_id: p.store_id || undefined,
        price: parseFloat(p.price || '0'),
        oldPrice: p.old_price ? parseFloat(p.old_price) : undefined,
        rating: parseFloat(p.rating || '4.5'),
        deliveryTime: p.delivery_time || '20 min',
        image: p.image || '',
        description: p.description || '',
        available: p.available !== 0,
        enabled: p.enabled !== 0,
        stock: parseInt(p.stock || '100', 10),
        stock_alert_threshold: parseInt(p.stock_alert_threshold || '5', 10),
        requires_prescription: !!p.requires_prescription,
        is_demo: !!p.is_demo,
        is_market: !!p.is_market,
        order: p.order_index || 0,
        variants,
      };
    });

    const orders: Order[] = ordersRows.map((o: any) => {
      let items = [];
      try {
        if (o.items_json) items = JSON.parse(o.items_json);
      } catch {}
      return {
        order_id: o.order_id,
        store_id: o.store_id || undefined,
        store_name: o.store_name || undefined,
        customer_id: o.customer_id || undefined,
        customer_name: o.customer_name || 'Customer',
        customer_phone: o.customer_phone,
        items,
        total_amount: parseFloat(o.total_amount || '0'),
        delivery_slot_time: o.delivery_slot_time,
        delivery_fee: parseFloat(o.delivery_fee || '0'),
        notes: o.notes || '',
        order_time: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
        status: o.order_status || 'Order Placed',
        payment_method: o.payment_method || 'cod',
        payment_status: o.payment_status || 'Pending',
        payment_transaction_id: o.payment_transaction_id,
        webhook_status: o.webhook_status,
      };
    });

    const users: AdminUser[] = usersRows.map((u: any) => {
      let permissions: any = {};
      try {
        if (u.permissions_json) permissions = JSON.parse(u.permissions_json);
      } catch {}
      return {
        id: u.id,
        store_id: u.store_id || undefined,
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        phone: u.phone,
        whatsapp_phone: u.whatsapp_phone,
        permissions,
        active: u.active !== 0,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      };
    });

    const stores: VendorStore[] = storesRows.map((st: any) => {
      let modulesList = ['mod-grocery', 'mod-food'];
      try {
        if (st.modules_json) modulesList = JSON.parse(st.modules_json);
      } catch {}
      let stSettings: any = {};
      try {
        if (st.settings_json) stSettings = JSON.parse(st.settings_json);
      } catch {}
      return {
        id: st.id,
        store_code: st.store_code || st.id,
        name: st.name,
        slug: st.slug,
        category: st.category || 'General',
        owner_name: st.owner_name,
        owner_user_id: st.owner_user_id,
        phone: st.phone,
        whatsapp_phone: st.whatsapp_phone,
        email: st.email || '',
        address: st.address,
        logo: st.logo,
        username: st.username,
        password: st.password,
        status: st.status || 'ACTIVE',
        active: st.status === 'ACTIVE',
        modules: modulesList,
        settings: stSettings,
        registered_at: st.registered_at ? new Date(st.registered_at).toISOString() : new Date().toISOString(),
      };
    });

    const customers: Customer[] = customersRows.map((c: any) => {
      let savedAddresses = [];
      try {
        if (c.saved_addresses_json) savedAddresses = JSON.parse(c.saved_addresses_json);
      } catch {}
      return {
        customer_id: c.customer_id,
        whatsapp_number: c.whatsapp_number,
        name: c.name || 'Customer',
        email: c.email || '',
        address: c.address || '',
        saved_addresses: savedAddresses,
        status: c.status || 'active',
        registered_at: c.registered_at ? new Date(c.registered_at).toISOString() : new Date().toISOString(),
        last_seen_at: c.last_seen_at ? new Date(c.last_seen_at).toISOString() : new Date().toISOString(),
      };
    });

    const audit_logs: AuditLog[] = auditRows.map((a: any) => ({
      id: a.id,
      store_id: a.store_id || undefined,
      store_name: a.store_name || undefined,
      user_name: a.user_name || undefined,
      action: a.action,
      details: a.details || '',
      timestamp: a.timestamp ? new Date(a.timestamp).toISOString() : new Date().toISOString(),
    }));

    return {
      modules,
      categories,
      products,
      banners: [],
      orders,
      users,
      customers,
      stores,
      settings,
      audit_logs,
    };
  } catch (err: any) {
    console.error('[MySQL Load Error]:', err.message);
    return null;
  }
}

export async function syncDataToMysql(data: AppData): Promise<void> {
  if (!pool || !isConnected) return;

  try {
    // 1. Sync Settings
    if (data.settings) {
      const s = data.settings;
      const bottomNavJson = JSON.stringify(s.bottom_nav_items || []);
      const sql = `INSERT INTO store_settings (
        id, store_name, store_whatsapp_phone, super_admin_whatsapp_phone, admin_username, admin_password,
        admin_pin, admin_logo, admin_banner_title, admin_banner_subtitle, n8n_webhook_url, n8n_webhook_secret,
        n8n_host, n8n_port, n8n_protocol, pwa_enabled, pwa_name, pwa_short_name, pwa_description, pwa_icon,
        pwa_theme_color, pwa_bg_color, pwa_display_mode, cod_enabled, upi_enabled, wallet_enabled,
        wallet_demo_balance, upi_id, upi_phone, upi_payee_name, upi_qr_image, bottom_nav_items_json
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      ) ON DUPLICATE KEY UPDATE
        store_name = VALUES(store_name),
        store_whatsapp_phone = VALUES(store_whatsapp_phone),
        super_admin_whatsapp_phone = VALUES(super_admin_whatsapp_phone),
        admin_username = VALUES(admin_username),
        admin_password = VALUES(admin_password),
        admin_pin = VALUES(admin_pin),
        admin_logo = VALUES(admin_logo),
        admin_banner_title = VALUES(admin_banner_title),
        admin_banner_subtitle = VALUES(admin_banner_subtitle),
        n8n_webhook_url = VALUES(n8n_webhook_url),
        n8n_webhook_secret = VALUES(n8n_webhook_secret),
        n8n_host = VALUES(n8n_host),
        n8n_port = VALUES(n8n_port),
        n8n_protocol = VALUES(n8n_protocol),
        pwa_enabled = VALUES(pwa_enabled),
        pwa_name = VALUES(pwa_name),
        pwa_short_name = VALUES(pwa_short_name),
        pwa_description = VALUES(pwa_description),
        pwa_icon = VALUES(pwa_icon),
        pwa_theme_color = VALUES(pwa_theme_color),
        pwa_bg_color = VALUES(pwa_bg_color),
        pwa_display_mode = VALUES(pwa_display_mode),
        cod_enabled = VALUES(cod_enabled),
        upi_enabled = VALUES(upi_enabled),
        wallet_enabled = VALUES(wallet_enabled),
        wallet_demo_balance = VALUES(wallet_demo_balance),
        upi_id = VALUES(upi_id),
        upi_phone = VALUES(upi_phone),
        upi_payee_name = VALUES(upi_payee_name),
        upi_qr_image = VALUES(upi_qr_image),
        bottom_nav_items_json = VALUES(bottom_nav_items_json)`;

      await pool.query(sql, [
        s.store_name || 'Hyperlocal WhatsApp Store',
        s.store_whatsapp_phone || '',
        s.super_admin_whatsapp_phone || '',
        s.admin_username || 'admin',
        s.admin_password || '',
        s.admin_pin || '1234',
        s.admin_logo || '',
        s.admin_banner_title || 'Hyperlocal WhatsApp Store Portal',
        s.admin_banner_subtitle || 'Manage products, categories, orders and WhatsApp settings.',
        s.n8n_webhook_url || '',
        s.n8n_webhook_secret || '',
        s.n8n_host || 'localhost',
        s.n8n_port || '5678',
        s.n8n_protocol || 'http',
        s.pwa_enabled !== false ? 1 : 0,
        s.pwa_name || 'Hyperlocal WhatsApp Store',
        s.pwa_short_name || 'HyperlocalApp',
        s.pwa_description || '',
        s.pwa_icon || '',
        s.pwa_theme_color || '#059669',
        s.pwa_bg_color || '#f8fafc',
        s.pwa_display_mode || 'standalone',
        s.cod_enabled !== false ? 1 : 0,
        s.upi_enabled !== false ? 1 : 0,
        s.wallet_enabled !== false ? 1 : 0,
        s.wallet_demo_balance || 500.0,
        s.upi_id || '',
        s.upi_phone || '',
        s.upi_payee_name || '',
        s.upi_qr_image || '',
        bottomNavJson,
      ]);
    }

    // 2. Sync Stores
    if (Array.isArray(data.stores)) {
      for (const st of data.stores) {
        const modulesJson = JSON.stringify(st.modules || []);
        const settingsJson = JSON.stringify(st.settings || {});
        await pool.query(
          `INSERT INTO stores (
            id, store_code, name, slug, category, owner_name, owner_user_id, phone, whatsapp_phone,
            email, address, logo, username, password, status, active, modules_json, settings_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            slug = VALUES(slug),
            category = VALUES(category),
            owner_name = VALUES(owner_name),
            owner_user_id = VALUES(owner_user_id),
            phone = VALUES(phone),
            whatsapp_phone = VALUES(whatsapp_phone),
            email = VALUES(email),
            address = VALUES(address),
            logo = VALUES(logo),
            username = VALUES(username),
            password = VALUES(password),
            status = VALUES(status),
            active = VALUES(active),
            modules_json = VALUES(modules_json),
            settings_json = VALUES(settings_json)`,
          [
            st.id,
            st.store_code || st.id,
            st.name,
            st.slug,
            st.category || 'General',
            st.owner_name,
            st.owner_user_id || null,
            st.phone,
            st.whatsapp_phone,
            st.email || '',
            st.address,
            st.logo || '',
            st.username,
            st.password,
            st.status || 'ACTIVE',
            st.status === 'ACTIVE' ? 1 : 0,
            modulesJson,
            settingsJson,
          ]
        );
      }
    }

    // 3. Sync Products
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        const variantsJson = JSON.stringify(p.variants || []);
        await pool.query(
          `INSERT INTO products (
            id, name, category_id, module_id, store_id, price, old_price, rating, delivery_time,
            image, description, available, enabled, stock, stock_alert_threshold, requires_prescription,
            is_demo, is_market, order_index, variants_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            category_id = VALUES(category_id),
            module_id = VALUES(module_id),
            store_id = VALUES(store_id),
            price = VALUES(price),
            old_price = VALUES(old_price),
            rating = VALUES(rating),
            delivery_time = VALUES(delivery_time),
            image = VALUES(image),
            description = VALUES(description),
            available = VALUES(available),
            enabled = VALUES(enabled),
            stock = VALUES(stock),
            stock_alert_threshold = VALUES(stock_alert_threshold),
            requires_prescription = VALUES(requires_prescription),
            is_demo = VALUES(is_demo),
            is_market = VALUES(is_market),
            order_index = VALUES(order_index),
            variants_json = VALUES(variants_json)`,
          [
            p.id,
            p.name,
            p.categoryId,
            p.moduleId,
            p.store_id || null,
            p.price,
            p.oldPrice || null,
            p.rating || 4.5,
            p.deliveryTime || '20 min',
            p.image || '',
            p.description || '',
            p.available !== false ? 1 : 0,
            p.enabled !== false ? 1 : 0,
            p.stock !== undefined ? p.stock : 100,
            p.stock_alert_threshold || 5,
            p.requires_prescription ? 1 : 0,
            p.is_demo ? 1 : 0,
            p.is_market ? 1 : 0,
            p.order || 0,
            variantsJson,
          ]
        );
      }
    }

    // 4. Sync Categories
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        await pool.query(
          `INSERT INTO categories (
            id, name, module_id, icon, image, store_id, is_demo, enabled, order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            module_id = VALUES(module_id),
            icon = VALUES(icon),
            image = VALUES(image),
            store_id = VALUES(store_id),
            is_demo = VALUES(is_demo),
            enabled = VALUES(enabled),
            order_index = VALUES(order_index)`,
          [
            c.id,
            c.name,
            c.moduleId,
            c.icon || '🛍️',
            c.image || '',
            c.store_id || null,
            c.is_demo ? 1 : 0,
            c.enabled !== false ? 1 : 0,
            c.order || 0,
          ]
        );
      }
    }

    // 5. Sync Users
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        const permsJson = JSON.stringify(u.permissions || {});
        await pool.query(
          `INSERT INTO users (
            id, store_id, username, password, name, role, phone, whatsapp_phone, permissions_json, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            store_id = VALUES(store_id),
            username = VALUES(username),
            password = VALUES(password),
            name = VALUES(name),
            role = VALUES(role),
            phone = VALUES(phone),
            whatsapp_phone = VALUES(whatsapp_phone),
            permissions_json = VALUES(permissions_json),
            active = VALUES(active)`,
          [
            u.id,
            u.store_id || null,
            u.username,
            u.password,
            u.name,
            u.role,
            u.phone || '',
            u.whatsapp_phone || '',
            permsJson,
            u.active !== false ? 1 : 0,
          ]
        );
      }
    }

    // 6. Sync Customers
    if (Array.isArray(data.customers)) {
      for (const cust of data.customers) {
        const savedAddrsJson = JSON.stringify(cust.saved_addresses || []);
        await pool.query(
          `INSERT INTO customers (
            customer_id, whatsapp_number, name, email, address, saved_addresses_json, status, last_seen_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            address = VALUES(address),
            saved_addresses_json = VALUES(saved_addresses_json),
            status = VALUES(status),
            last_seen_at = VALUES(last_seen_at)`,
          [
            cust.customer_id,
            cust.whatsapp_number,
            cust.name || 'Customer',
            cust.email || '',
            cust.address || '',
            savedAddrsJson,
            cust.status || 'active',
            cust.last_seen_at || new Date().toISOString(),
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[MySQL Sync Error]:', err.message);
  }
}

export async function insertOrderToMysql(order: Order): Promise<void> {
  if (!pool || !isConnected) return;
  try {
    const itemsJson = JSON.stringify(order.items || []);
    await pool.query(
      `INSERT INTO orders (
        order_id, store_id, store_name, customer_id, customer_name, customer_phone, customer_whatsapp,
        customer_address, delivery_slot_time, delivery_fee, total_amount, payment_method, payment_status,
        payment_transaction_id, order_status, notes, webhook_status, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        order_status = VALUES(order_status),
        payment_status = VALUES(payment_status),
        payment_transaction_id = VALUES(payment_transaction_id),
        webhook_status = VALUES(webhook_status)`,
      [
        order.order_id,
        order.store_id || null,
        order.store_name || null,
        order.customer_id || null,
        order.customer_name || 'Customer',
        order.customer_phone,
        order.customer_phone,
        order.notes || '',
        order.delivery_slot_time || '',
        order.delivery_fee || 0,
        order.total_amount,
        order.payment_method || 'cod',
        order.payment_status || 'Pending',
        order.payment_transaction_id || null,
        order.status || 'Order Placed',
        order.notes || '',
        order.webhook_status || 'pending',
        itemsJson,
      ]
    );
  } catch (err: any) {
    console.error('[MySQL Order Insert Error]:', err.message);
  }
}

export async function getDbStatus(): Promise<DbStatus> {
  const config = getDbConfig();
  const status: DbStatus = {
    connected: isConnected,
    engine: isConnected ? 'mysql' : 'json_file',
    host: config.host || 'local file system',
    database: config.database,
    user: config.user,
    lastChecked: new Date().toISOString(),
    error: lastError || undefined,
  };

  if (isConnected && pool) {
    try {
      const [tables]: any = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM store_settings) as settings_count,
          (SELECT COUNT(*) FROM stores) as stores_count,
          (SELECT COUNT(*) FROM products) as products_count,
          (SELECT COUNT(*) FROM categories) as categories_count,
          (SELECT COUNT(*) FROM orders) as orders_count,
          (SELECT COUNT(*) FROM users) as users_count,
          (SELECT COUNT(*) FROM customers) as customers_count
      `);
      if (tables.length > 0) {
        status.tableCounts = {
          settings: tables[0].settings_count,
          stores: tables[0].stores_count,
          products: tables[0].products_count,
          categories: tables[0].categories_count,
          orders: tables[0].orders_count,
          users: tables[0].users_count,
          customers: tables[0].customers_count,
        };
      }
    } catch {}
  }

  return status;
}
