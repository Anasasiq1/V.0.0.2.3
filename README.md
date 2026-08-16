# HM-Q Hyperlocal Commerce Platform

A high-performance, multi-tenant hyperlocal WhatsApp commerce platform supporting **Dual Deployment Architecture** from a single unified codebase.

---

## 🚀 Dual Deployment Architecture

HM-Q can be deployed using either of two official production methods:

### Mode A: File Manager / Static Web Hosting Deployment
- **Target Environments**: cPanel, aaPanel static sites, Apache, Nginx, Cloudflare Pages, AWS S3.
- **Workflow**: Run `npm run build:static` locally/CI -> upload `dist/` into `public_html/` or `www` -> site is live immediately without needing a Node.js process on the static hosting server.
- **Guide**: [**Mode A: Static File Manager Deployment Guide**](./docs/DEPLOYMENT_STATIC_FILE_MANAGER.md)

### Mode B: Node.js SSR / Full-Stack Server Deployment
- **Target Environments**: VPS (Ubuntu/Debian), Cloud Servers (AWS/GCP/DigitalOcean/Hetzner), aaPanel Node.js Project Manager, Docker.
- **Workflow**: Upload source -> `npm install` -> `npm run build` -> Run under PM2 (`pm2 start ecosystem.config.cjs`) with Nginx reverse proxy.
- **Port Flexibility**: Configurable via `PORT` environment variable (`PORT=3000`, `PORT=3001`, `PORT=4302`, etc.).
- **Guide**: [**Mode B: Node.js SSR Deployment Guide**](./docs/DEPLOYMENT_NODE_SSR.md)

---

## 📖 Complete Documentation Index

All production guides and operational documentation are available in the **[`/docs/`](./docs/README.md)** directory:

1. [**Documentation Overview**](./docs/README.md)
2. [**Installation Guide**](./docs/INSTALLATION.md)
3. [**Server Requirements**](./docs/SERVER_REQUIREMENTS.md)
4. [**Environment Variables Reference**](./docs/ENVIRONMENT_VARIABLES.md)
5. [**Static File Manager Deployment**](./docs/DEPLOYMENT_STATIC_FILE_MANAGER.md)
6. [**Node.js SSR Deployment**](./docs/DEPLOYMENT_NODE_SSR.md)
7. [**aaPanel Complete Deployment Guide**](./docs/AAPANEL_DEPLOYMENT.md)
8. [**Database Setup & Architecture**](./docs/DATABASE_SETUP.md)
9. [**n8n Workflow Automation Setup**](./docs/N8N_SETUP.md)
10. [**WhatsApp Integration Guide**](./docs/WHATSAPP_SETUP.md)
11. [**Payment & UPI Setup**](./docs/PAYMENT_SETUP.md)
12. [**Backup & Disaster Recovery**](./docs/BACKUP_RESTORE.md)
13. [**Update & Upgrade Guide**](./docs/UPDATE.md)
14. [**Troubleshooting & Issues**](./docs/TROUBLESHOOTING.md)
15. [**Production Deployment Checklist**](./docs/DEPLOYMENT_CHECKLIST.md)

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (defaults to port 3000 or process.env.PORT)
npm run dev
```

- **Customer Storefront**: `http://localhost:3000/`
- **Super Admin Panel**: `http://localhost:3000/superadmin.php`
- **Merchant Store Panel**: `http://localhost:3000/storepanel.php`

---

## 🏗️ Production Build Commands

```bash
# Mode A: Build frontend static bundle for public_html / File Manager upload
npm run build:static

# Mode B: Build frontend + backend Node.js server for PM2 / SSR hosting
npm run build

# Start production Node.js server
npm run start
```
