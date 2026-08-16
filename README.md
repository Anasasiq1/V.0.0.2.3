# HM-Q Hyperlocal Commerce OS & Platform (V.0.0.2.4)

A high-performance, multi-tenant hyperlocal commerce operating system supporting **Dual Deployment Architecture**, unified headless API Gateway (`/api/v1/*`), in-store POS cashier terminals, delivery fleet logistics, merchant SaaS tiers, and n8n webhook automation from a single unified codebase.

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

## 🛠️ Commerce OS Core Capabilities

1. **Unified Developer REST Gateway (`/api/v1/*`)**: Standardized endpoints for Flutter, React Native, iOS, Android, and external ERPs.
2. **Developer API Key Authentication & Scopes**: Production/Test environment key management, rate limits (RPM), IP whitelisting, and instant key revocation.
3. **Delivery Rider Fleet Logistics**: Live online/busy/offline duty toggles, order assignment, COD cash settlement tracking, and rider ratings.
4. **Point of Sale (POS) Cashier Terminal**: Fast barcode lookup, itemized billing, 5% GST tax calculation, and UPI QR code thermal receipt generator.
5. **Merchant SaaS Tiers & Subscriptions**: Configurable monthly/yearly merchant onboarding plans, commission rates, and product catalog limits.
6. **Customer Feedback & Review Moderation**: Real-time moderation pipeline with merchant direct responses and verified buyer badges.
7. **Webhook Dispatcher**: HMAC-SHA256 signed event triggers for n8n, Evolution API, and external webhook listeners.

---

## 📖 Complete Documentation Index

All production guides and operational documentation are available in the **[`/docs/`](./docs/README.md)** directory:

1. [**Production Audit & Verification Report**](./docs/21-PRODUCTION-AUDIT-REPORT.md)
2. [**REST API Reference & Gateway Manual**](./docs/18-API-REFERENCE.md)
3. [**Installation Guide**](./docs/INSTALLATION.md)
4. [**Server Requirements**](./docs/SERVER_REQUIREMENTS.md)
5. [**Environment Variables Reference**](./docs/ENVIRONMENT_VARIABLES.md)
6. [**Static File Manager Deployment**](./docs/DEPLOYMENT_STATIC_FILE_MANAGER.md)
7. [**Node.js SSR Deployment**](./docs/DEPLOYMENT_NODE_SSR.md)
8. [**aaPanel Complete Deployment Guide**](./docs/AAPANEL_DEPLOYMENT.md)
9. [**Database Setup & Architecture**](./docs/DATABASE_SETUP.md)
10. [**n8n Workflow Automation Setup**](./docs/N8N_SETUP.md)
11. [**WhatsApp Integration Guide**](./docs/WHATSAPP_SETUP.md)
12. [**Payment & UPI Setup**](./docs/PAYMENT_SETUP.md)
13. [**Backup & Disaster Recovery**](./docs/BACKUP_RESTORE.md)
14. [**Update & Upgrade Guide**](./docs/UPDATE.md)
15. [**Troubleshooting & Issues**](./docs/TROUBLESHOOTING.md)
16. [**Production Deployment Checklist**](./docs/DEPLOYMENT_CHECKLIST.md)

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
