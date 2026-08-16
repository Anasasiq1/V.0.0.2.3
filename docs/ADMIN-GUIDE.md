# Administrator Guide & Security Documentation

This document covers access, security, session management, and features for the administrative interface of the Hyperlocal Commerce Platform.

---

## 1. Admin Entry Point & Separation

### Public vs. Admin Architecture
- **Customer Storefront:** `https://[YOUR_DOMAIN]/`
  - Completely clean, public storefront.
  - Contains NO admin buttons, links, configuration, settings, or management controls.
- **Admin Entry Point:** `https://[YOUR_DOMAIN]/superadmin.php`
  - Dedicated administrative entry point.
  - Requires explicit authentication.

### Removal of Query Parameter Access
Query parameter-based administration methods (such as `?admin=true`, `?admin=1`, `?isAdmin=true`, `?mode=admin`) have been **COMPLETELY REMOVED** and will NOT grant administrative access under any circumstances. Appending `?admin=true` to any storefront URL strictly behaves as the public customer storefront.

---

## 2. Server-Side Authentication & Session Flow

### Access Control Rules
1. Navigating to `/superadmin.php` opens a dedicated login screen.
2. Knowing the URL `/superadmin.php` alone **DOES NOT** grant access to store data or management controls.
3. Upon submitting credentials (`POST /api/admin/login`), the backend validates username and password/PIN.
4. On success, the server issues a cryptographically secure session token (`admin_sess_[TIMESTAMP]_[RANDOM_STRING]`) and sets a secure `HttpOnly`, `SameSite=Lax` session cookie (`admin_token`).
5. Every administrative request (`POST /api/data`, `GET /api/backup`, `POST /api/restore`, `POST /api/settings`, `POST /api/test-webhook`) verifies the active session server-side via `requireAdminAuth` middleware.

```
┌───────────────────────────┐
│ Client Browser            │
│ GET /superadmin.php       │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Server Session Validation │ ◄── Checks token in HttpOnly Cookie / Header
└─────────────┬─────────────┘
              │
      ┌───────┴───────┐
      │               │
  Valid Session   Invalid / Unauthenticated
      │               │
      ▼               ▼
┌─────────────┐ ┌──────────────────────┐
│ Admin Dashboard│ │ Admin Login Form /   │
│ Displayed   │ │ 401 Unauthorized     │
└─────────────┘ └──────────────────────┘
```

---

## 3. Session Lifetime & Logout

- **Session Duration:** Active sessions automatically expire after 24 hours.
- **Session Termination:** Clicking **Log Out** sends `POST /api/admin/logout`, invalidating the session token in the server's `activeSessions` map and wiping the `admin_token` cookie.
- **Browser Back Button Guard:** Pressing the browser back button after logout will NOT restore access, as all privileged API endpoints reject unauthenticated requests with `401 Unauthorized`.

---

## 4. Admin Management Features

The Admin Panel (`/superadmin.php`) includes complete management capabilities:

1. **Dashboard & Analytics:** Real-time revenue summaries, total orders, active products, and customer counts.
2. **Product Management:** Add, edit, duplicate, and delete products, update prices (MRP & Selling Price), stock status, and product images.
3. **Category Management:** Create, edit, reorder, and remove product categories.
4. **Order Management:** View incoming orders, update fulfillment statuses (Pending, Confirmed, Out for Delivery, Delivered, Cancelled), and send WhatsApp status updates.
5. **Store & Multi-Domain Configuration:** Configure custom domains per store, manage store hours, delivery radius, and branding.
6. **Banners & Offers:** Manage hero carousel banners, promotional badges, and discount offers.
7. **Staff Roles & User Permissions:** Manage staff accounts with fine-grained RBAC permissions.
8. **System Settings & Integrations:** Configure n8n webhook triggers, PWA options, and database backup/restore.

---

## 5. Security Best Practices for Administrators

- Change default passwords immediately after initial deployment.
- Never share administrative session cookies or credentials.
- Always click **Log Out** when finishing an admin session on shared computers.
