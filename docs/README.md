# HM-Q Platform Deployment Documentation

Welcome to the comprehensive deployment, operations, and architecture documentation for the HM-Q Hyperlocal WhatsApp Commerce Platform.

---

## Dual Deployment Architecture Overview

HM-Q provides dual deployment flexibility from a single, unified codebase:

1. **Mode A: File Manager / Static Web Hosting Deployment**
   - Ideal for cPanel, aaPanel static sites, Apache, Nginx, or Cloudflare Pages.
   - Serve compiled frontend files (`dist/`) directly from `public_html` or `www` without requiring a Node.js process.

2. **Mode B: Node.js Full-Stack / SSR Deployment**
   - Ideal for VPS, cloud instances, Docker, and aaPanel Node.js Project Manager.
   - Run the complete full-stack Express server with dynamic port flexibility (`3000`, `3001`, `4302`), PM2 cluster management, and Nginx reverse proxying.

---

## Documentation Index

| # | Document | Description |
| :--- | :--- | :--- |
| **01** | [**INSTALLATION.md**](./INSTALLATION.md) | Complete end-to-end installation and server setup walkthrough. |
| **02** | [**SERVER_REQUIREMENTS.md**](./SERVER_REQUIREMENTS.md) | Hardware, OS, runtime, database, and network port requirements. |
| **03** | [**ENVIRONMENT_VARIABLES.md**](./ENVIRONMENT_VARIABLES.md) | Full classification (Public, Server Only, Secret) of all configuration variables. |
| **04** | [**DEPLOYMENT_STATIC_FILE_MANAGER.md**](./DEPLOYMENT_STATIC_FILE_MANAGER.md) | Step-by-step guide for building and uploading static files to `public_html`. |
| **05** | [**DEPLOYMENT_NODE_SSR.md**](./DEPLOYMENT_NODE_SSR.md) | Step-by-step guide for Node.js, PM2, and Nginx reverse proxy hosting. |
| **06** | [**AAPANEL_DEPLOYMENT.md**](./AAPANEL_DEPLOYMENT.md) | Dedicated guide for deploying on aaPanel (Static & Node.js Manager). |
| **07** | [**DATABASE_SETUP.md**](./DATABASE_SETUP.md) | MySQL 8.0+ / MariaDB setup, migrations, and atomic JSON fallback engine. |
| **08** | [**N8N_SETUP.md**](./N8N_SETUP.md) | Webhook triggers, workflow integration, and automation architecture. |
| **09** | [**WHATSAPP_SETUP.md**](./WHATSAPP_SETUP.md) | Direct `wa.me` links, customer phone recognition, and multi-provider APIs. |
| **10** | [**PAYMENT_SETUP.md**](./PAYMENT_SETUP.md) | UPI ID setup, dynamic QR codes, deep-links (GPay/PhonePe), and COD. |
| **11** | [**BACKUP_RESTORE.md**](./BACKUP_RESTORE.md) | Disaster recovery, full/selective JSON and MySQL exports & imports. |
| **12** | [**UPDATE.md**](./UPDATE.md) | Version upgrade procedures and rollback workflows. |
| **13** | [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) | Solutions for 404s, 502 Bad Gateway, database, CORS, and port issues. |
| **14** | [**DEPLOYMENT_CHECKLIST.md**](./DEPLOYMENT_CHECKLIST.md) | Pre-flight and post-deployment verification checklists for both modes. |
