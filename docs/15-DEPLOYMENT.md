# 15 - Production Deployment Guide

This guide details zero-downtime deployment, updating application code, running build checks, and verifying post-deployment health.

---

## Standard Deployment Steps

### Step 1: Pre-Deployment Backup
Always execute a manual snapshot before pulling updates:
```bash
cp /var/www/store-app/data/store_data.json /var/backups/store_data_pre_deploy.json
```

### Step 2: Pull Latest Code
```bash
cd /var/www/store-app
git pull origin main
```

### Step 3: Install Dependencies
```bash
npm install --production=false
```

### Step 4: Run Type Checks & Linter
```bash
npm run lint
```

### Step 5: Build Production Artifacts
```bash
npm run build
```
This runs `vite build` to output `/dist` static assets and `esbuild server.ts` to bundle `/dist/server.cjs`.

### Step 6: Restart Process Manager
```bash
pm2 restart hyperlocal-store
```

### Step 7: Verify Post-Deployment Health
```bash
curl http://localhost:3000/api/health
```

---

## Important Safety Guarantees

> **DATA SAFETY GUARANTEE**: Rebuilding or redeploying code **NEVER overwrites production data**. Data stored in `/data/store_data.json` persists across builds, restarts, and deployments.
