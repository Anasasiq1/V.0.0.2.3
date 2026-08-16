# Production Deployment Checklist

Use this checklist before and after deploying HM-Q to ensure all systems, routes, permissions, and payment channels are operational.

---

## 1. Mode A: Static File Manager Checklist

### Build & Package Stage
- [ ] Build completed with `npm run build:static` without errors
- [ ] Output directory `dist/` verified
- [ ] `dist/index.html` exists and is non-empty
- [ ] `dist/assets/` contains JavaScript and CSS bundles
- [ ] `dist/sw.js` and `dist/manifest.json` are present

### Upload & Web Server Stage
- [ ] Uploaded files placed directly in web document root (`public_html/` or `/www/wwwroot/domain/`)
- [ ] `index.html` confirmed at root level (not nested inside `dist/` subfolder)
- [ ] File permissions set (`644` for files, `755` for directories)
- [ ] Web server SPA rewrite configured (`.htaccess` for Apache / `try_files` for Nginx)
- [ ] Valid SSL Certificate (Let's Encrypt / Custom SSL) activated and HTTPS forced

### Functional Verification Stage
- [ ] Root home page `https://yourdomain.com/` loads instantly
- [ ] Direct navigation to `/store/ajmeeri-restaurant` loads without 404
- [ ] Direct refresh on `/categories`, `/market`, and `/account` loads properly
- [ ] Product images and category icons load with 200 OK status
- [ ] Cart drawer opens and items can be added
- [ ] UPI QR generation and WhatsApp order link format correctly

---

## 2. Mode B: Node.js SSR Checklist

### Environment & Server Preparation
- [ ] Node.js v18.x, v20.x, or v22.x LTS installed
- [ ] npm dependencies installed with `npm install`
- [ ] Production `.env` created from `.env.example`
- [ ] `NEXT_PUBLIC_SSR=true` confirmed
- [ ] `PORT` configured (e.g. `3000`, `3001`, or `4302`)
- [ ] Database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) configured
- [ ] Production bundle compiled with `npm run build`

### Process Manager & Reverse Proxy Stage
- [ ] Node process running under PM2 (`pm2 start ecosystem.config.cjs` or `pm2 start dist/server.cjs`)
- [ ] PM2 status shows `online` with zero restart loops (`pm2 status`)
- [ ] `pm2 save` and `pm2 startup` executed for boot persistence
- [ ] Nginx reverse proxy configured to forward requests to `http://127.0.0.1:${PORT}`
- [ ] Nginx `client_max_body_size 50M;` configured for media uploads
- [ ] SSL certificate active and HTTPS forced

### Functional & API Verification Stage
- [ ] Database connectivity verified (`/api/database/status` returns operational status)
- [ ] Super Admin Panel accessible at `/superadmin.php` and login functional
- [ ] Store creation and Store Panel (`/storepanel.php`) login functional
- [ ] Customer phone recognition and unified login working
- [ ] Orders successfully trigger WhatsApp bill generation and n8n webhooks
- [ ] Full backup export and test restore executed successfully
