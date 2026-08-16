# 04 - Super Admin Governance System

The Super Admin System provides multi-store governance, provisioning, status management, module customization, and platform-wide audit logging.

---

## Super Admin Credentials & Access

- **Interface Entry**: Admin Panel modal or URL endpoint `#admin` / `Admin` button.
- **Role Identifier**: `SUPER_ADMIN`
- **Default Username**: `superadmin`
- **Default Password**: Set in initial configuration or `.env` (Change immediately upon deployment).

> **SECURITY NOTE**: Credentials are authenticated against server-side session tokens (`/api/auth/login`). Plaintext passwords are strictly prohibited in public documentation.

---

## Super Admin Core Responsibilities

1. **Multi-Store Provisioning**:
   - Create new stores using the **Store Creation Modal**.
   - Generates unique Store Code (e.g. `STR-10025`), Store ID, and URL slug (e.g. `/store/tasty-treats`).
   - Assigns initial operational business modules (Grocery, Food, Meat, Fashion, Electronics, etc.).
   - Establishes Store Owner profile (Name, Email, WhatsApp Number, Password).
   - Generates direct onboarding share link for WhatsApp.

2. **Store Governance & Status Switching**:
   - **ACTIVE**: Store is fully operational and open to customer orders.
   - **SUSPENDED**: Store ordering is temporarily locked (displays store maintenance mode to customers).
   - **ARCHIVED**: Store is soft-deleted and removed from public listings while retaining historic data.

3. **Dynamic Business Module Control**:
   - Enable/disable modules on a per-store basis.
   - Reorder module display hierarchy (custom ordering for home grid).

4. **Audit Logging & System Monitoring**:
   - Tracks platform events including store creation, status updates, module changes, staff role assignments, and data backups.
   - Export audit logs in JSON/CSV format.

5. **Backup & Restore Governance**:
   - Download complete full-state platform backup (`store_data.json`).
   - Restore database from previous snapshot with zero-downtime hot swap.
