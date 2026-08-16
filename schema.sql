-- =========================================================
-- HYPERLOCAL WHATSAPP STORE - COMPLETE DATABASE SCHEMA (V0.0.2 PRODUCTION)
-- Supported Databases: PostgreSQL 12+, MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- =========================================================

-- 1. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL DEFAULT 'WhatsApp Hyperlocal Store',
  store_whatsapp_phone VARCHAR(50) DEFAULT '',
  super_admin_whatsapp_phone VARCHAR(50) DEFAULT '',
  admin_username VARCHAR(100) DEFAULT 'admin',
  admin_password VARCHAR(255) DEFAULT '$pbkdf2$secure_hash',
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
);

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
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
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
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
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
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
);

-- 5. DELIVERY SLOTS TABLE
CREATE TABLE IF NOT EXISTS delivery_slots (
  id VARCHAR(100) PRIMARY KEY,
  time VARCHAR(100) NOT NULL,
  label VARCHAR(255) DEFAULT '',
  fee DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INT DEFAULT 0
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
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
);

-- 7. USERS & STAFF TABLE
CREATE TABLE IF NOT EXISTS users (
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
);

-- 8. VENDOR STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
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
);

-- 9. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  customer_id VARCHAR(100) PRIMARY KEY,
  whatsapp_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) DEFAULT 'Customer',
  email VARCHAR(255) DEFAULT '',
  address TEXT,
  saved_addresses_json TEXT,
  status VARCHAR(50) DEFAULT 'active',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. PLATFORM TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS platform_templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  engine_version VARCHAR(50) DEFAULT '1.0.0',
  author VARCHAR(255) DEFAULT 'HM-Q Core',
  description TEXT,
  type VARCHAR(50) DEFAULT 'platform',
  status VARCHAR(50) DEFAULT 'Installed',
  manifest_json TEXT NOT NULL,
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. PLATFORM TEMPLATE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS platform_template_settings (
  id INT PRIMARY KEY DEFAULT 1,
  active_template_id VARCHAR(100) NOT NULL REFERENCES platform_templates(id),
  previous_template_id VARCHAR(100) REFERENCES platform_templates(id),
  updated_by VARCHAR(100) DEFAULT 'superadmin',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. PLATFORM TEMPLATE VERSIONS TABLE
CREATE TABLE IF NOT EXISTS platform_template_versions (
  id VARCHAR(100) PRIMARY KEY,
  template_id VARCHAR(100) NOT NULL REFERENCES platform_templates(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  changelog TEXT,
  manifest_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. STORE TEMPLATES TABLE (KEYED BY store_id)
CREATE TABLE IF NOT EXISTS store_templates (
  id VARCHAR(100) PRIMARY KEY,
  store_id VARCHAR(100) NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  template_id VARCHAR(100) DEFAULT 'default-store',
  primary_color VARCHAR(50) DEFAULT '#059669',
  secondary_color VARCHAR(50) DEFAULT '#10b981',
  logo_url TEXT,
  hero_banner_url TEXT,
  hero_title VARCHAR(255),
  hero_subtitle VARCHAR(255),
  product_card_style VARCHAR(50) DEFAULT 'grid',
  show_categories_bar BOOLEAN DEFAULT TRUE,
  show_store_hours BOOLEAN DEFAULT TRUE,
  custom_css TEXT,
  status VARCHAR(50) DEFAULT 'published',
  version VARCHAR(50) DEFAULT '1.0.0',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. STORE TEMPLATE VERSIONS TABLE
CREATE TABLE IF NOT EXISTS store_template_versions (
  id VARCHAR(100) PRIMARY KEY,
  store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  config_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. STORE BRANDING TABLE
CREATE TABLE IF NOT EXISTS store_branding (
  id VARCHAR(100) PRIMARY KEY,
  store_id VARCHAR(100) NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  logo TEXT,
  favicon TEXT,
  theme_color VARCHAR(50) DEFAULT '#059669',
  custom_domain VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  store_id VARCHAR(100) DEFAULT NULL,
  store_name VARCHAR(255) DEFAULT NULL,
  user_id VARCHAR(100) DEFAULT NULL,
  user_name VARCHAR(255) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(100) DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
