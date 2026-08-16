# Backup & Disaster Recovery Guide

This document outlines backup, export, and disaster recovery procedures for the Hyperlocal Commerce Platform.

---

## 1. Automated System Backups

### Automated Daily Cron Job
On Linux production servers, configure a daily backup job using `crontab`:

```bash
sudo crontab -e
```

Add the following cron task (runs daily at 2:00 AM):
```cron
0 2 * * * cp /var/www/app/data_store.json /var/backups/hyperlocal/data_store_$(date +\%Y\%m\%d).json && find /var/backups/hyperlocal/ -type f -name "*.json" -mtime +30 -delete
```

Create backup destination directory:
```bash
sudo mkdir -p /var/backups/hyperlocal
```

---

## 2. Admin Portal JSON Backup & Restore

Store administrators can export or import full system state JSON snapshots directly through the Admin Portal (`/superadmin.php`).

### Exporting Backup Snapshot (`GET /api/backup`)
1. Log into `/superadmin.php`.
2. Navigate to **System Settings → Backup & Restore**.
3. Click **Download Full Backup JSON**.
4. The server generates a timestamped snapshot (`hyperlocal_backup_[TIMESTAMP].json`) containing modules, products, categories, stores, orders, and configuration settings.

### Restoring Backup Snapshot (`POST /api/restore`)
1. Log into `/superadmin.php`.
2. Navigate to **System Settings → Backup & Restore**.
3. Select a previously exported `.json` backup file.
4. Click **Restore Backup**.
5. The server validates schema integrity, updates `data_store.json` on disk, and reloads active in-memory state.

---

## 3. Disaster Recovery Procedure

In the event of server hardware failure or storage corruption:

1. Provision a new server instance following `docs/INSTALLATION.md`.
2. Deploy application code and install npm dependencies (`npm install && npm run build`).
3. Restore the latest `data_store.json` backup file to the project root:
   ```bash
   cp /var/backups/hyperlocal/data_store_20260811.json /var/www/app/data_store.json
   ```
4. Start the PM2 service (`pm2 start dist/server.cjs --name "hyperlocal-app"`).
5. Verify application data restoration by loading the customer storefront and admin portal.
