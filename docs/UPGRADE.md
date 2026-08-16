# Upgrading Production Deployments (`UPGRADE.md`)

This document details the step-by-step procedure for upgrading an existing running production environment to the latest version without data loss or service disruption.

---

## 1. Upgrade Pipeline Overview

```
CURRENT RUNNING VERSION
        ↓
BACKUP (Files, data_store.json, .env, Uploads)
        ↓
FETCH LATEST CODE (git pull / upload)
        ↓
INSTALL / UPDATE DEPENDENCIES
        ↓
DATABASE MIGRATION (Automatic JSON preservation)
        ↓
BUILD PRODUCTION BUNDLE (npm run build)
        ↓
RESTART SERVICES (pm2 reload hyperlocal-app)
        ↓
HEALTH CHECK & SMOKE TEST
        ↓
GO LIVE
```

---

## 2. Step-by-Step Zero-Downtime Upgrade Guide

### Step 1: Create Pre-Deployment Backup
Before modifying any files, execute an full backup:
```bash
# Create timestamped backup directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /var/www/backups/$TIMESTAMP

# Backup data_store.json, .env, and uploads
cp /var/www/hyperlocal-app/data_store.json /var/www/backups/$TIMESTAMP/data_store.json
cp /var/www/hyperlocal-app/.env /var/www/backups/$TIMESTAMP/.env
if [ -d "/var/www/hyperlocal-app/uploads" ]; then
  cp -r /var/www/hyperlocal-app/uploads /var/www/backups/$TIMESTAMP/uploads
fi
```

### Step 2: Fetch Latest Code
```bash
cd /var/www/hyperlocal-app
git fetch origin
git pull origin main
```

### Step 3: Verify `.env` Configuration
Ensure new environment parameters (such as `N8N_WEBHOOK_URL`) are present:
```bash
cat .env
```

### Step 4: Install Dependencies
```bash
npm install --production=false
```

### Step 5: Execute Production Build
```bash
npm run build
```

### Step 6: Reload PM2 Application
```bash
pm2 reload hyperlocal-app
```

### Step 7: Post-Upgrade Verification
1. Verify server process:
   ```bash
   pm2 status
   pm2 logs hyperlocal-app --lines 30
   ```
2. Verify Store Panel URL: `https://yourdomain.com/storepanel`
3. Verify Admin Panel URL: `https://yourdomain.com/admin`
4. Confirm `data_store.json` contains existing merchant data intact.

---

## 3. Data Protection Guarantee

- **No Auto-Reset:** The application server detects existing records inside `data_store.json` on startup and skips seeding demo data.
- **Atomic File Operations:** All store modifications write asynchronously to `.tmp` files before renaming, guaranteeing zero file corruption during power or process interruption.
