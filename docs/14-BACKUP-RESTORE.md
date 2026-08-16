# 14 - Backup & Restore System

This document outlines backup procedures, database exports, file snapshots, and emergency restoration procedures.

---

## What Needs to Be Backed Up

1. **Main Data Store File**: `/data/store_data.json`
2. **Uploaded Images & Files**: `/data/uploads/`
3. **Environment Configuration**: `.env`
4. **MySQL Database Dump** (If MySQL sync is active)

---

## Automated Backup Script Example

Create `/scripts/backup.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/hyperlocal-store"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APP_DIR="/var/www/store-app"

mkdir -p "$BACKUP_DIR"

echo "Starting backup at $TIMESTAMP..."

# 1. Backup JSON store data
cp "$APP_DIR/data/store_data.json" "$BACKUP_DIR/store_data_$TIMESTAMP.json"

# 2. Backup Uploads Directory
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C "$APP_DIR/data" uploads/

# 3. Backup MySQL Database if used
if command -v mysqldump &> /dev/null; then
  mysqldump -u hmqin -p'<YOUR_DB_PASSWORD>' hmqin > "$BACKUP_DIR/mysql_dump_$TIMESTAMP.sql"
fi

# 4. Clean backups older than 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed successfully at $TIMESTAMP."
```

Make executable and schedule in Cron:
```bash
chmod +x /scripts/backup.sh
crontab -e
# Run backup daily at 2:00 AM
0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## Super Admin Web Restore

1. Log into Super Admin Panel.
2. Navigate to **System Settings & Backup**.
3. Under **Restore Database**, select previously downloaded `store_data.json` snapshot file.
4. Click **Restore Data**.
5. Server replaces `/data/store_data.json` and updates state immediately without requiring server restart.
