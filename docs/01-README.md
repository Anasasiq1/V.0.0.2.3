# 01 - System Overview & Architecture

## System Purpose
**Hyperlocal WhatsApp Multi-Store Commerce Platform** is a full-stack, centralized multi-tenant e-commerce platform built with React, Node.js, Express, TypeScript, and Tailwind CSS. The platform enables Super Admins to provision, manage, and govern multiple independent hyperlocal stores (e.g. Supermarket, Fresh Meat, Bakery, Pharmacy, Electronics, Fashion) with WhatsApp-driven order dispatch, automated customer recognition, RBAC staff permissions, dynamic reorderable modules, and full backup/restore governance.

---

## Architecture Diagram

```text
                               +----------------------------------+
                               |     n8n / WhatsApp Gateway       |
                               +----------------------------------+
                                                |
                                    WhatsApp Link with ?phone=
                                                v
+-----------------------------------------------------------------------------------+
|                            Client Frontend (React / Vite)                        |
|                                                                                   |
|  [ Customer Web App ]    [ Store Admin Panel ]    [ Super Admin Governance ]     |
|  - Auto Phone Recognition - Product Management     - Multi-Store Provisioning    |
|  - Checkout Phone Lock    - Order Fulfillment      - Operational Status Switch   |
|  - Dynamic Module Views   - RBAC Staff Management  - Audit Log Tracking          |
+-----------------------------------------------------------------------------------+
                                                |
                                     REST APIs / JSON IPC
                                                v
+-----------------------------------------------------------------------------------+
|                        Server Backend (Express / Node.js)                         |
|                                                                                   |
|  - Customer Session Auth   - Role & Permission Enforcement (RBAC)                 |
|  - Server-Side Order Lock  - Admin Session Authentication                         |
|  - Store Context Isolation - JSON File Storage / MySQL Synchronization            |
+-----------------------------------------------------------------------------------+
                                                |
                                                v
+-----------------------------------------------------------------------------------+
|                       Storage Layer (JSON / MySQL DB)                             |
|                                                                                   |
|  - Stores & Settings       - Products & Categories                                |
|  - Orders & Audit Logs     - Customers & Customer Sessions                        |
|  - Staff & Roles           - Reorderable Business Modules                         |
+-----------------------------------------------------------------------------------+
```

---

## Core System Actors & Responsibilities

1. **Super Admin**:
   - Platform governance, store creation (`STR-10025`), domain setup, store status management (`ACTIVE`, `SUSPENDED`, `ARCHIVED`), module assignments, global audit logging.
2. **Store Owner**:
   - Manages store profile, module configuration, staff creation, role permission assignment, order fulfillment, catalog management.
3. **Store Manager / Staff**:
   - Operates within assigned store boundaries with granular RBAC permissions (e.g. `orders.view`, `products.edit`, `customers.view`).
4. **Customer**:
   - Seamless WhatsApp link entry, instant identity recognition, single-click browsing, cart checkout with locked phone identity, WhatsApp order placement.

---

## Tech Stack Summary

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Motion (Framer Motion).
- **Backend**: Node.js, Express, TypeScript (`tsx` in dev, `esbuild` bundled CommonJS for production).
- **Database**: Local JSON persistence (`/data/store_data.json`) with optional MySQL sync (`mysql2`).
- **Automation / Integrations**: n8n workflow engine, WhatsApp Cloud API / Webhook.
