# Complete Setup & Operations Manual

Welcome to the **Master Setup and Operations Guide** for the Hyperlocal WhatsApp Multi-Store Platform. This comprehensive manual brings together all components required to install, configure, operate, and maintain the entire platform in a production environment.

---

## Quick Table of Contents

1. [Architecture & Overview](#1-architecture--overview)
2. [Fresh Server Installation](#2-fresh-server-installation)
3. [Domain & Reverse Proxy Setup](#3-domain--reverse-proxy-setup)
4. [Super Admin Setup & Store Provisioning](#4-super-admin-setup--store-provisioning)
5. [WhatsApp Customer Flow & Phone Lock](#5-whatsapp-customer-flow--phone-lock)
6. [n8n Automation & Webhooks](#6-n8n-automation--webhooks)
7. [Backup, Restore & Maintenance](#7-backup-restore--maintenance)
8. [Troubleshooting Guide](#8-troubleshooting-guide)

---

## 1. Architecture & Overview

The platform uses a full-stack architecture built on:
- **Frontend**: React 19 SPA powered by Vite, Tailwind CSS v4, Lucide icons, and Motion animations.
- **Backend**: Express on Node.js, compiling to a single self-contained CommonJS bundle (`dist/server.cjs`) via `esbuild`.
- **Database**: Atomic JSON storage (`/data/store_data.json`) with optional MySQL database sync (`mysql2`).
- **Authentication**: Dual session management — Admin JWT/Session tokens for staff/owners and HTTP-Only session cookies for customer WhatsApp recognition.

---

## 2. Fresh Server Installation

On a clean Ubuntu 22.04 or 24.04 server:

```bash
# 1. Update packages and install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx pm2

# 2. Clone Repository
cd /var/www
git clone <YOUR_GIT_REPO_URL> store-app
cd store-app

# 3. Install NPM Dependencies
npm install

# 4. Set Environment Configuration
cp .env.example .env
# Edit .env with your specific settings

# 5. Build Application
npm run build

# 6. Launch with PM2
pm2 start dist/server.cjs --name "hyperlocal-store"
pm2 save
pm2 startup
```

---

## 3. Domain & Reverse Proxy Setup

For custom domain `store-wa.hm-q.in`:

```nginx
server {
    listen 80;
    server_name store-wa.hm-q.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store-wa.hm-q.in;

    ssl_certificate /etc/letsencrypt/live/store-wa.hm-q.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store-wa.hm-q.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Obtain SSL certificate with Certbot:
```bash
sudo certbot --nginx -d store-wa.hm-q.in
```

---

## 4. Super Admin Setup & Store Provisioning

1. Access Admin Panel at `https://store-wa.hm-q.in/#admin`.
2. Log in using Super Admin credentials (`superadmin`).
3. Click **Stores Management** > **+ Create New Store**.
4. Fill in:
   - Store Name: *Tasty Treats Bakery*
   - Owner Name, Owner Phone (`919633594302`), Owner Email, Temporary Password.
   - Select Initial Modules: Grocery, Meat, Bakery, etc.
5. Click **Create Store & Provision**.
6. System outputs Store Code (`STR-10025`), Store Link (`/store/tasty-treats`), and direct WhatsApp onboarding message.

---

## 5. WhatsApp Customer Flow & Phone Lock

When n8n or WhatsApp sends a message containing:
`https://store-wa.hm-q.in/?phone=919633594302`

1. The customer clicks the link.
2. The site queries POST `/api/customer/recognize`.
3. If recognized:
   - Sets secure session `customer_token`.
   - Displays Malayalam welcome toast: `"നിങ്ങളുടെ WhatsApp നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്."`
   - Strips `?phone=` from browser address bar.
   - Locks checkout phone input (`disabled` / `read-only`).
4. On order submission, the backend overwrites payload phone with the server-verified session phone.

---

## 6. n8n Automation & Webhooks

In n8n:
- Extract sender phone from `remoteJid`:
  `{{ $('WhatsApp Trigger').first().json.body.data.key.remoteJid.replace('@s.whatsapp.net','') }}`
- Construct customer link:
  `https://store-wa.hm-q.in/?phone={{ $('WhatsApp Trigger').first().json.body.data.key.remoteJid.replace('@s.whatsapp.net','') }}`
- Receive order placement notifications via webhook target: `<N8N_URL>/webhook/order-placed`

---

## 7. Backup, Restore & Maintenance

- **Automated Backup**: Scheduled cron job backing up `/data/store_data.json` and `/data/uploads/`.
- **Zero-Downtime Restore**: Super Admin can upload previously saved `store_data.json` directly through the Web UI (**System Settings** > **Restore Data**).

---

## 8. Troubleshooting Guide

- **Server Down / 502 Bad Gateway**: Run `pm2 restart hyperlocal-store`.
- **Customer Phone Editable**: Check if browser cleared `hyperlocal_customer_token`. Verify `/api/customer/session` endpoint.
- **Port 3000 Busy**: Run `lsof -i :3000` and kill conflicting process.
