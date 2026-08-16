# 02 - Installation & Deployment Guide

This document provides complete instructions for installing and running the platform under either of the two official deployment modes:

---

## 🎯 Choose Your Deployment Mode

| Feature | Mode A: File Manager (Static) | Mode B: Node.js (Full-Stack) |
| :--- | :--- | :--- |
| **Server Target** | aaPanel File Manager / cPanel `public_html` / Nginx / Apache | VPS / Dedicated Server / aaPanel Node.js / PM2 / Docker |
| **Node.js on Server** | ❌ Not required | ✅ Required (v18, v20, v22) |
| **Build Command** | `npm run build:static` | `npm run build` |
| **Backend / MySQL API**| Client-side storefront / catalog mode | Full REST API, MySQL/JSON persistence, POS, n8n webhook |
| **Port Configuration** | Default HTTP (80/443) | Dynamic `PORT` (`3000`, `3001`, `4302`, etc.) |

---

## Mode A: File Manager / Static Website Deployment

1. **Build the static site locally or in CI**:
   ```bash
   npm run build:static
   ```
2. **Compress `dist/` directory**:
   Zip the contents of `dist/` (includes `index.html`, `assets/`, `.htaccess`, `_redirects`, `manifest.json`).
3. **Upload to Server**:
   Upload the zip to your aaPanel / cPanel web root (`/www/wwwroot/yourdomain.com/` or `/public_html/`) and extract it.
4. **Open Domain**:
   Open `https://yourdomain.com` in your browser.

---

## Mode B: Node.js Full Application Deployment

### Step 1: Upload Source & Install Dependencies
```bash
cd /var/www/store-app
npm install
```

### Step 2: Configure Environment Variables (`.env`)
```ini
NODE_ENV=production
PORT=4302

# Optional MySQL Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=hmqin
DB_USERNAME=hmquser
DB_PASSWORD=your_secure_password

# Optional n8n Webhook
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/orders
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3: Build & Start Server
```bash
# Build frontend and server bundle
npm run build

# Start on any configured port (e.g. 3000, 3001, 4302)
PORT=4302 NODE_ENV=production npm start
```

### Step 4: Run under PM2 Process Manager
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "hyperlocal-store" --env PORT=4302
pm2 save
pm2 startup
```

---

## Verifying the Installation

1. **Local Health Check (Node.js mode)**:
```bash
curl http://localhost:4302/api/v1/health
```
Expected response: `{"success":true,"status":"operational","capabilities":[...]}`

2. **Access Admin Panel**:
`https://<YOUR-DOMAIN>/#admin` or navigate to `/admin`.
Default credentials provided in initial configuration. Change immediately upon deployment.
