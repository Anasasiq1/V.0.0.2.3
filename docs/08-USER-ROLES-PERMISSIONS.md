# 08 - User Roles & RBAC Staff Permissions

The platform enforces Role-Based Access Control (RBAC) to ensure strict isolation between Super Admins, Store Owners, Managers, and Staff members.

---

## System Roles Hierarchy

| Role Code | Name | Scope | Capabilities |
|-----------|------|-------|--------------|
| `SUPER_ADMIN` | Super Administrator | Global Platform | All operations across all stores, store creation, audit logs, backup/restore. |
| `STORE_OWNER` | Store Owner | Specific Store | Full management of assigned store, catalog, modules, staff, settings, finance. |
| `MANAGER` | Store Manager | Specific Store | Order management, product creation/editing, inventory updates, customer view. |
| `STAFF` | Dispatch / Counter Staff | Specific Store | Order processing, order status updates, inventory checks. |

---

## Granular Permission Keys

Store Owners can assign fine-grained permissions to custom staff profiles:

```typescript
export interface UserPermissions {
  'products.view': boolean;
  'products.create': boolean;
  'products.edit': boolean;
  'products.delete': boolean;
  'orders.view': boolean;
  'orders.update': boolean;
  'orders.cancel': boolean;
  'customers.view': boolean;
  'customers.edit': boolean;
  'users.manage': boolean;
  'settings.manage': boolean;
  'reports.view': boolean;
  'modules.manage': boolean;
}
```

---

## Managing Staff Accounts

1. Log into Store Owner Admin Panel (`/#vendor`).
2. Navigate to **Staff & Permissions**.
3. Click **Add New Staff Member**.
4. Fill in Name, Email, Phone, Role (`MANAGER` or `STAFF`), and toggle specific permission checkboxes.
5. Click **Save Staff Account**.

Staff members log in using their credentials and are strictly constrained to their store ID and checked permissions.
