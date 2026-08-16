# Backup & Disaster Recovery Guide

HM-Q includes an enterprise-grade, comprehensive Backup and Disaster Recovery system with UI-driven exports/imports, automated rolling snapshots, and MySQL synchronization.

---

## 1. Backup Types & Scope

### Full System Backup
Captures the entire platform state into a single compressed JSON / ZIP archive:
- **Stores & Vendors**: All merchant store profiles, branding, hours, and modules.
- **Merchant & Admin Users**: User accounts, hashed credentials, and granular permission sets.
- **Product Catalogs**: All inventory, multi-variant pricing, images, and SEO tags.
- **Categories & Dynamic Modules**: Global & store-specific taxonomy.
- **Orders & Invoices**: Full customer transaction history and status logs.
- **Customer Profiles**: WhatsApp numbers, saved addresses, wallet points.
- **Platform & Store Templates**: Active themes, storefront CSS variables, and layout overrides.
- **System Settings & Audit Logs**: Platform configurations, webhook URLs, and activity trails.

### Selective / Granular Backup
Allows exporting or importing individual datasets (e.g. Products only, Stores only, Orders only) for seamless data portability.

---

## 2. Creating a Backup via Super Admin Panel

1. Log into the Super Admin Panel (`/superadmin.php`).
2. Navigate to the **Backup & Restore** tab.
3. Choose **Full System Backup** or select specific entities.
4. Click **Create & Download Backup**.
5. The system generates a timestamped `.json` or `.zip` backup package (e.g. `hmq-backup-2026-08-16-120000.json`).

---

## 3. Restoring from a Backup

1. Open **Super Admin Panel -> Backup & Restore**.
2. Under **Restore Platform Data**, click **Select Backup File** and upload your `.json` backup file.
3. Review the preview summary of items to be restored.
4. Click **Execute Restore**.
5. The system atomically replaces and syncs the state with MySQL and local storage, logging an audit trail event.

---

## 4. Automated File Snapshots

On the server filesystem, HM-Q automatically manages rolling backups:
- **Primary Data**: `data_store.json`
- **Rolling Backup**: `data_store.json.bak`
- **Temporary Atomic Write Buffer**: `data_store.json.tmp`

Every write operation executes through atomic rename routines to eliminate file corruption risks even during unexpected server restarts.

---

## 5. MySQL Database Dumps

To perform direct MySQL dumps via CLI or cron job:
```bash
# Export
mysqldump -u hmq_user -p hmq_database > /backup/mysql/hmq_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u hmq_user -p hmq_database < /backup/mysql/hmq_20260816.sql
```
