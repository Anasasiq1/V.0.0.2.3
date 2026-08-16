# HM-Q Comprehensive Installation Guide

This document is the master installation guide for HM-Q Hyperlocal Commerce Platform. It guides you from server provisioning to live production deployment in both **Mode A (Static File Manager Hosting)** and **Mode B (Node.js SSR Hosting)**.

---

## Table of Contents
1. [Server Requirements](#1-server-requirements)
2. [PHP / Static Hosting Requirements](#2-php--static-hosting-requirements)
3. [Node.js Requirements](#3-nodejs-requirements)
4. [Database Requirements](#4-database-requirements)
5. [File Permissions](#5-file-permissions)
6. [Environment Setup](#6-environment-setup)
7. [Static Installation (Mode A)](#7-static-installation-mode-a)
8. [SSR Installation (Mode B)](#8-ssr-installation-mode-b)
9. [Domain Setup](#9-domain-setup)
10. [SSL Configuration](#10-ssl-configuration)
11. [API Configuration](#11-api-configuration)
12. [n8n Automation Configuration](#12-n8n-automation-configuration)
13. [WhatsApp Provider Configuration](#13-whatsapp-provider-configuration)
14. [Payment Configuration](#14-payment-configuration)
15. [Backup & Disaster Recovery](#15-backup--disaster-recovery)
16. [Troubleshooting](#16-troubleshooting)
17. [Updates & Upgrades](#17-updates--upgrades)
18. [Rollback](#18-rollback)

---

## 1. Server Requirements
- **OS**: Ubuntu 20.04/22.04 LTS, Debian 11/12, or AlmaLinux 8/9.
- **Hardware**: Minimum 1 CPU Core, 1 GB RAM, 10 GB Disk. Recommended: 2+ Cores, 2 GB+ RAM, 25 GB SSD.
- See full specifications in [SERVER_REQUIREMENTS.md](./SERVER_REQUIREMENTS.md).

---

## 2. PHP / Static Hosting Requirements
- "File Manager Deployment" means uploading the compiled static web output (`dist/`) directly into `public_html/` or `/www/wwwroot/domain/`.
- No PHP runtime is needed to serve static assets. Any standard Apache or Nginx static hosting works seamlessly.

---

## 3. Node.js Requirements
- **Node.js**: `v18.18.0`+ (`v20.x` or `v22.x` LTS recommended).
- **npm**: `v9.0.0`+.
- **Process Manager**: PM2 or aaPanel Node.js Project Manager.

---

## 4. Database Requirements
- **MySQL**: 8.0.x or MariaDB 10.6.x (Charset: `utf8mb4`).
- **Resilience Fallback**: If MySQL is not configured, HM-Q operates out-of-the-box using the built-in atomic file storage engine (`data_store.json`).
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md).

---

## 5. File Permissions
Ensure proper permissions for web assets and writable uploads:
```bash
chown -R www:www /www/wwwroot/your-domain.com
chmod -R 755 /www/wwwroot/your-domain.com
```

---

## 6. Environment Setup
Copy the template `.env.example` and configure your settings:
```bash
cp .env.example .env
```
Refer to [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for full variable details.

---

## 7. Static Installation (Mode A)
1. Run `npm run build:static` on your build machine.
2. Upload the generated `dist/` directory contents into `public_html/` or `/www/wwwroot/your-domain/`.
3. Ensure `.htaccess` (Apache) or `try_files` (Nginx) is configured for SPA routing.
4. Detailed guide: [DEPLOYMENT_STATIC_FILE_MANAGER.md](./DEPLOYMENT_STATIC_FILE_MANAGER.md).

---

## 8. SSR Installation (Mode B)
1. Upload source to server directory (e.g. `/www/wwwroot/hmq-app`).
2. Run `npm install` and `npm run build`.
3. Start via PM2: `pm2 start ecosystem.config.cjs`.
4. Configure Nginx reverse proxy to `http://127.0.0.1:3000`.
5. Detailed guide: [DEPLOYMENT_NODE_SSR.md](./DEPLOYMENT_NODE_SSR.md).

---

## 9. Domain Setup
1. Create an `A` record in your DNS provider pointing your domain to the server IP.
2. If using subdomains for merchants (e.g. `*.yourdomain.com`), configure wildcard DNS.

---

## 10. SSL Configuration
Issue a free Let's Encrypt SSL certificate via Certbot or aaPanel:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 11. API Configuration
In Mode B, the API runs on the same origin under `/api/*`. In Mode A with a separate API server, set `VITE_API_URL=https://api.yourdomain.com`.

---

## 12. n8n Automation Configuration
Set your webhook URL in Super Admin Panel or `.env`:
```env
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook
```
See [N8N_SETUP.md](./N8N_SETUP.md).

---

## 13. WhatsApp Provider Configuration
HM-Q supports direct browser `wa.me` deep-linking out of the box, as well as Meta Cloud API, Evolution API, and WAHA. See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md).

---

## 14. Payment Configuration
Configure platform and store UPI VPAs in the Admin Panel / Store Panel for direct merchant payouts. See [PAYMENT_SETUP.md](./PAYMENT_SETUP.md).

---

## 15. Backup & Disaster Recovery
Perform single-click full or selective exports via **Super Admin Panel -> Backup & Restore**. See [BACKUP_RESTORE.md](./BACKUP_RESTORE.md).

---

## 16. Troubleshooting
For common issues like 404 on page refresh, 502 Bad Gateway, or database connection errors, consult [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## 17. Updates & Upgrades
Follow the zero-downtime update lifecycle in [UPDATE.md](./UPDATE.md).

---

## 18. Rollback
In case of unforeseen issues, revert using the steps documented in [UPDATE.md](./UPDATE.md#4-rollback-procedure).
