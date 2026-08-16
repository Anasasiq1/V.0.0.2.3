# 04 - Super Admin Governance System

The Super Admin System provides multi-store governance, provisioning, status management, module customization, template engine control, and platform-wide audit logging.

---

## Super Admin Credentials & Access

- **Interface Entry**: Admin Panel modal or direct URL endpoint `/admin` or `#admin` / `Admin` button.
- **Role Identifier**: `super_admin`
- **Default Username**: `admin`
- **Default Password**: `admin123` (or configured via environment / initial setup).
- **Default PIN**: `1234`

> **SECURITY NOTE**: Once logged in, change the Super Admin credentials in **Admin Settings** > **Security & Access Control**. Plaintext passwords are automatically encrypted on save with PBKDF2 cryptography.

---

## Super Admin Core Responsibilities

1. **Multi-Store Provisioning**:
   - Create new stores using the **Store Creation Modal**.
   - Generates unique Store Code (e.g. `STR-10025`), Store ID, and URL slug (e.g. `/stores/fresh-mart`).
   - Assigns initial operational business modules (Grocery, Food, Meat, Fashion, Electronics, etc.).
   - Establishes Store Owner profile (Name, Email, WhatsApp Number, Password).
   - Generates direct onboarding share link for WhatsApp.

2. **Store Governance & Status Switching**:
   - **ACTIVE**: Store is fully operational and open to customer orders.
   - **SUSPENDED**: Store ordering is temporarily locked (displays store maintenance mode to customers).
   - **ARCHIVED**: Store is soft-deleted and removed from public listings while retaining historic data.

3. **Dynamic Business Module & Template Control**:
   - Enable/disable modules on a per-store basis.
   - Reorder module display hierarchy (custom ordering for home grid).
   - Switch active platform template (Modern, Minimalist, Express Quick Commerce, Vintage, Ultra-Premium).

4. **Audit Logging & System Monitoring**:
   - Tracks platform events including store creation, status updates, module changes, staff role assignments, and data backups.
   - Export audit logs in JSON/CSV format.

5. **Backup & Restore Governance**:
   - Download complete full-state platform backup (`data_store.json`).
   - Restore database from previous snapshot with zero-downtime hot swap and safe secret preservation.

