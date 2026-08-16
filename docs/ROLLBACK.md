# Emergency Rollback Procedure (`ROLLBACK.md`)

This document outlines the procedure to roll back a production deployment to the previous working state in case of unexpected errors or service failures.

---

## 1. Rollback Strategy & Non-Destructive Principles

- **Data Preservation:** Never delete `data_store.json` without creating a timestamped backup first.
- **Service Continuity:** Keep PM2 process running throughout the rollback sequence.
- **Rollback Pipeline:**
  ```
  IDENTIFY ISSUE
        ↓
  BACKUP CURRENT DATA
        ↓
  RESTORE PREVIOUS CODE (git reset / checkout)
        ↓
  RESTORE PRE-DEPLOYMENT DATA STORE
        ↓
  REBUILD & RELOAD PM2
        ↓
  VERIFY HEALTH
  ```

---

## 2. Step-by-Step Rollback Execution

### Step 1: Backup Current State
Even when rolling back, capture a snapshot of current data:
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp /var/www/hyperlocal-app/data_store.json /var/www/backups/data_store_failed_$TIMESTAMP.json
```

### Step 2: Roll Back Application Code
Revert to the previous git commit:
```bash
cd /var/www/hyperlocal-app
git reset --hard HEAD~1
```

### Step 3: Restore Pre-Deployment Data Backup
Restore the backup file created prior to deployment:
```bash
# Replace with your actual backup timestamp
PREV_BACKUP="/var/www/backups/20260813_050000/data_store.json"
if [ -f "$PREV_BACKUP" ]; then
  cp "$PREV_BACKUP" /var/www/hyperlocal-app/data_store.json
fi
```

### Step 4: Re-install Dependencies & Rebuild
```bash
npm install --production=false
npm run build
```

### Step 5: Reload PM2 Process
```bash
pm2 reload hyperlocal-app
```

### Step 6: Post-Rollback Verification
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs hyperlocal-app --lines 30`
3. Verify site HTTP status: `curl -I https://store-wa.hm-q.in`
4. Confirm N8N workflow settings remain aligned with active webhook endpoint.
