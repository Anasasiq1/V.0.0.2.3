# Update & Upgrade Guide

This guide details the step-by-step procedure for upgrading HM-Q to newer versions across both **Mode A (Static File Manager Deployment)** and **Mode B (Node.js SSR Deployment)**.

---

## 1. Upgrade Lifecycle Workflow

```
1. Create Backup (Database & Files)
              │
              ▼
2. Pull / Upload Updated Source Code
              │
              ▼
3. Install / Update Dependencies (npm install)
              │
              ▼
4. Verify Environment (.env)
              │
              ▼
5. Build Production Assets (npm run build)
              │
              ▼
6. Restart Application / Deploy Files
              │
              ▼
7. Run Regression Verification
              │
              ▼ (If Issues Occur)
8. Rollback to Previous Version
```

---

## 2. Upgrading Mode A: Static File Manager Deployments

### Step 1: Backup Current Live Assets
Download or rename your current `public_html` directory (e.g. `public_html_backup_20260816`).

### Step 2: Build New Release on Local Machine
```bash
git pull origin main
npm install
npm run build:static
```

### Step 3: Upload and Replace Live Files
1. Open aaPanel / cPanel File Manager.
2. Navigate to your document root (`/www/wwwroot/your-domain.com/` or `public_html/`).
3. Upload the new contents of `dist/` (or upload `dist.zip` and extract).
4. Verify that `index.html` and `.htaccess` are properly positioned.

### Step 4: Clear CDN / Cloudflare / Browser Cache
Purge your CDN cache or test in an Incognito window.

---

## 3. Upgrading Mode B: Node.js SSR Deployments

### Step 1: Create Full Backup
1. Go to Super Admin Panel -> **Backup & Restore** -> Create & download backup.
2. Or create a MySQL dump in CLI:
   ```bash
   mysqldump -u hmq_user -p hmq_database > /backup/pre_upgrade_dump.sql
   ```

### Step 2: Pull Latest Source Code
```bash
cd /www/wwwroot/hmq-app
git pull origin main
```

### Step 3: Install Updated Dependencies
```bash
npm install --production=false
```

### Step 4: Run Database Migrations (if applicable)
If new SQL migrations were added in `database/migrations/`:
```bash
mysql -u hmq_user -p hmq_database < database/migrations/002_update.sql
```

### Step 5: Build Production Bundles
```bash
npm run build
```

### Step 6: Graceful Reload / Restart with PM2
```bash
# Graceful zero-downtime reload
pm2 reload hmq-platform

# Or full restart
pm2 restart hmq-platform
```

### Step 7: Verify Service Health
```bash
pm2 status
curl http://127.0.0.1:3000/api/system/health-upscale
```

---

## 4. Rollback Procedure

If any issue arises during or after an upgrade:

### Rollback Node.js SSR:
```bash
# Revert to previous git commit or backup directory
git checkout <PREVIOUS_COMMIT_TAG>
npm install
npm run build
pm2 reload hmq-platform

# Restore database if schema changes were made
mysql -u hmq_user -p hmq_database < /backup/pre_upgrade_dump.sql
```

### Rollback Static Site:
Restore the previously backed up `public_html_backup` folder in your File Manager.
