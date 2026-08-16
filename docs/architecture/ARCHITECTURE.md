# HM-Q Hyperlocal Multi-Level Ecosystem - System Architecture

## Overview
The platform features a multi-layered decoupled architecture separating Platform Template Engine, Store Template customization, Commerce services, Multi-Tenant management, Database storage, and n8n Workflow Automation.

```
+-----------------------------------------------------------------------+
|                          CLIENT APPLICATION                           |
|      (React 19 + Vite + Tailwind CSS + PWA Service Worker)            |
+-----------------------------------------------------------------------+
|  Platform Template Engine        |  Store Template Engine             |
|  - HM-Q Modern (Default)         |  - Independent Store Branding      |
|  - HM-Q Classic (Lightweight)    |  - Colors, Banners, Cards          |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          HM-Q BACKEND API                             |
|             (Express + Node.js + TypeScript Server)                   |
| - Platform Template API          - Store Template API                 |
| - Multi-Tenant Store Services    - Order & WhatsApp Engine            |
+-----------------------------------------------------------------------+
         |                                                 |
         v                                                 v
+-------------------+                            +-------------------+
| DATABASE LAYER    |                            | AUTOMATION LAYER  |
| PostgreSQL / MySQL|                            | n8n Workflows     |
+-------------------+                            +-------------------+
```

## Key Architectural Principles

1. **Single Platform Active Template**:
   - Only ONE platform-level template is active at any given moment.
   - Switch between templates (e.g. `hm-q-modern` to `hm-q-classic`) is atomic with instant rollback capability.
2. **Strict Store Template Isolation**:
   - Store templates customize individual vendor storefronts without modifying platform templates.
   - Keyed strictly by `store_id`.
3. **Canonical Shared Business Logic**:
   - Single authoritative Header, Search, ProductCard, CategoryCard, Cart, Checkout, and WhatsApp handlers.
   - Zero duplicate state engines or redundant controllers.
