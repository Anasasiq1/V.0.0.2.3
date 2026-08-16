# 02 - Installation Guide

This document provides complete instructions for installing and running the platform on a fresh Linux server or VPS environment.

---

## Server Requirements

- **Operating System**: Ubuntu 22.04 LTS / 24.04 LTS or Debian 11/12 (or aaPanel / Nginx / Cloud Run container)
- **Node.js**: v18.x or v20.x LTS (Node.js 22 supported)
- **Package Manager**: `npm` (v9+)
- **Database** (Optional): MySQL 8.0+ / MariaDB 10.6+
- **Process Manager**: PM2 or Systemd service manager
- **Web Server**: Nginx or Apache with reverse proxy capabilities

---

## Step-by-Step Installation Procedure

### Step 1: Clone or Extract Application Files
```bash
cd /var/www
git clone <YOUR_REPOSITORY_URL> store-app
cd store-app
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and set your configuration variables:
```ini
APP_URL=https://store-wa.hm-q.in
PORT=3000
GEMINI_API_KEY=<OPTIONAL_GEMINI_API_KEY>

# Optional MySQL Database settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=<YOUR_DB_USER>
MYSQL_PASSWORD=<YOUR_DB_PASSWORD>
MYSQL_DATABASE=<YOUR_DB_NAME>
```

### Step 4: Verify Initial Data File Directory
Ensure the directory `/data` exists and has read/write permissions:
```bash
mkdir -p data
chmod -R 775 data
```

### Step 5: Build Production Bundle
Build the Vite frontend and bundle `server.ts` with `esbuild`:
```bash
npm run build
```
This produces compiled static files in `dist/` and the compiled server entry point at `dist/server.cjs`.

### Step 6: Start Production Server with PM2
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "hyperlocal-store"
pm2 save
pm2 startup
```

---

## Verifying the Installation

1. Test local health check:
```bash
curl http://localhost:3000/api/health
```
Expected response: `{"status":"ok","timestamp":"..."}`

2. Access Super Admin Panel at:
`https://<YOUR-DOMAIN>/#admin` or click Admin in footer/header navigation.
Default credentials provided in `.env` / initial config.
