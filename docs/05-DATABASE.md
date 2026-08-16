# 05 - Database Architecture & Schema

The platform supports a dual storage model: atomic JSON file persistence (`/data/store_data.json`) for light zero-dependency execution, with optional MySQL database synchronization via `mysql2`.

---

## Data Model & Entity Relationship Overview

```text
+-------------------+           +-------------------+          +-------------------+
|      Stores       | 1       * |      Modules      | 1      * |     Products      |
|-------------------|-----------|-------------------|----------|-------------------|
| id (PK)           |           | id (PK)           |          | id (PK)           |
| code (e.g. STR-..) |           | store_id (FK)     |          | store_id (FK)     |
| name              |           | name              |          | module_id (FK)    |
| slug              |           | icon              |          | category_id (FK)  |
| status            |           | sort_order        |          | name, price       |
+-------------------+           +-------------------+          +-------------------+
         |                                                               |
         | 1                                                             | 1
         |                                                               |
         | *                                                             | *
+-------------------+           +-------------------+          +-------------------+
|       Users       |           |     Customers     | 1      * |      Orders       |
|-------------------|           |-------------------|----------|-------------------|
| id (PK)           |           | customer_id (PK)  |          | id / order_id(PK) |
| store_id (FK)     |           | whatsapp_number   |          | store_id (FK)     |
| role (SUPER/OWNER)|           | name              |          | customer_id (FK)  |
| email, permissions|           | status            |          | items, total, status|
+-------------------+           +-------------------+          +-------------------+
```

---

## Core Entities & JSON Schema Definitions

### 1. `stores`
```typescript
interface Store {
  id: string;             // e.g. "store-hyperlocal-tirur"
  code: string;           // e.g. "STR-10025"
  name: string;           // e.g. "Hyperlocal Supermarket Tirur"
  slug: string;           // e.g. "hyperlocal-tirur"
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  address: string;
  whatsapp_number: string;
  created_at: string;
}
```

### 2. `modules`
```typescript
interface HyperlocalModule {
  id: string;             // e.g. "grocery", "fresh-meat", "bakery"
  store_id: string;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}
```

### 3. `customers`
```typescript
interface Customer {
  customer_id: string;     // e.g. "cust-919633594302"
  whatsapp_number: string; // e.g. "919633594302"
  name: string;            // e.g. "Anas"
  registered_at: string;
  last_seen_at: string;
  status: 'active' | 'blocked';
}
```

### 4. `orders`
```typescript
interface Order {
  order_id: string;       // e.g. "ORD-17234"
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string; // Server-authenticated phone number
  items: Array<{
    id: string;
    title: string;
    price: number;
    qty: number;
  }>;
  grand_total: number;
  status: 'pending' | 'accepted' | 'dispatched' | 'delivered' | 'cancelled';
  created_at: string;
}
```

### 5. `audit_logs`
```typescript
interface AuditLog {
  id: string;
  action: string;         // e.g. "STORE_CREATED", "STATUS_UPDATED"
  details: string;
  store_id?: string;
  user_name?: string;
  timestamp: string;
}
```
