# Database Architecture & Schema Documentation (`DATABASE.md`)

This document describes the primary database model, entity schemas, and SQL migration options powering the Hyperlocal Commerce Platform.

---

## 1. Storage & Persistence Model

The application uses an atomic file-based persistent database system:

1. **Persistent Primary Store (`data_store.json`):**
   - Serves as the authoritative database in production.
   - Saves updates atomically to disk asynchronously without blocking HTTP requests.
   - Preserves all stores, products, customers, orders, categories, and settings across server restarts.

2. **Relational Database Synchronization (Optional):**
   - Environment variables support connecting or exporting to MySQL / PostgreSQL (`schema.sql`).
   - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`.

---

## 2. Schema Collections

### `stores` (Merchant Tenant Records)
- `id` (PK): String (e.g. `STR-10025`)
- `store_code`: String (e.g. `STR-10025`)
- `slug`: String (e.g. `ajmeeri-restaurant`)
- `name`: String
- `username`: String
- `password`: String (SHA-256 hashed)
- `whatsapp_phone`: String (Merchant order dispatch number)
- `phone`: String
- `status`: String (`ACTIVE`, `SUSPENDED`, `ARCHIVED`)
- `pending_changes`: Object (`PendingStoreChange` submitted for Admin approval)

### `products` (Catalog Items)
- `id` (PK): String
- `store_id` (FK): String
- `name`: String
- `category`: String
- `price`: Number
- `mrp`: Number
- `unit`: String
- `stock`: Number
- `in_stock`: Boolean

### `customers` (Customer Accounts)
- `customer_id` (PK): String
- `whatsapp_number`: String (Used as primary auth key & URL parameter)
- `name`: String
- `email`: String
- `address`: String
- `saved_addresses`: Array of Strings

### `orders` (Transactions)
- `order_id` (PK): String
- `store_id` (FK): String
- `store_name`: String
- `customer_id`: String
- `customer_name`: String
- `customer_phone`: String (Target for customer WhatsApp confirmation ONLY)
- `merchant_whatsapp_phone`: String (Target for store order alerts ONLY)
- `subtotal`: Number
- `discount`: Number
- `delivery_charge`: Number
- `final_total`: Number
- `payment_method`: String
- `payment_status`: String

---

## 3. SQL Relational Backup Schema (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(64) PRIMARY KEY,
    store_code VARCHAR(64) UNIQUE,
    slug VARCHAR(128) UNIQUE,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(128) NOT NULL,
    password VARCHAR(255) NOT NULL,
    whatsapp_phone VARCHAR(32) NOT NULL,
    phone VARCHAR(32),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(64) NOT NULL,
    stock INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64),
    customer_id VARCHAR(64),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    merchant_whatsapp_phone VARCHAR(32) NOT NULL,
    final_total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(64) DEFAULT 'COD',
    payment_status VARCHAR(64) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
