# Production Launch & Go-Live Verification Checklist

Complete this checklist before declaring the application live in production.

---

## 1. Pre-Deployment Infrastructure Audit
- [ ] Server provisioned with Node.js v20+ and PM2 installed.
- [ ] Environment file `.env` created with production configuration (`NODE_ENV=production`).
- [ ] Nginx installed and configured with reverse proxy rules pointing to port 3000.
- [ ] SSL certificate active via Let's Encrypt / Certbot (`https://` enabled).
- [ ] File permissions set correctly on `data_store.json` (`chmod 664`).

---

## 2. Customer Storefront Verification
- [ ] Public website opens at `https://[YOUR_DOMAIN]/`.
- [ ] Customer website contains **NO** admin buttons, admin links, settings menus, or management controls.
- [ ] Query parameter `?admin=true` does **NOT** grant admin access (`https://[YOUR_DOMAIN]/?admin=true` stays on customer storefront).
- [ ] Products, categories, cart, search, and WhatsApp order placement function properly.
- [ ] Active delivery location is set to **`pathampad`** (Verify `Ghanshyam Nagar` is completely absent).

---

## 3. Admin Portal Verification
- [ ] Admin portal opens at `https://[YOUR_DOMAIN]/superadmin.php`.
- [ ] Accessing `/superadmin.php` unauthenticated displays the admin login screen without exposing store data.
- [ ] Submitting valid credentials authenticates successfully and issues a session token.
- [ ] Unauthenticated API requests to `POST /api/data`, `GET /api/backup`, and `POST /api/settings` return `401 Unauthorized`.
- [ ] Public `/api/data` responses do **NOT** leak `admin_password`, `admin_pin`, `admin_username`, or user passwords.
- [ ] Clicking **Log Out** invalidates the active session and prevents back-button access.
- [ ] Default admin password changed to a secure custom password.

---

## 4. Multi-Tenant & Multi-Domain Audit
- [ ] Primary domain correctly loads associated store data.
- [ ] Custom domain mappings configured inside **Admin Portal → Store Settings → Custom Domains**.
- [ ] Domain-based filtering successfully isolates products per tenant domain.

---

## 5. Persistence & Recovery Verification
- [ ] Product created in Admin Panel persists across page refreshes.
- [ ] Server restart (`pm2 restart hyperlocal-app`) retains customized products and settings.
- [ ] Demo data seeding does **NOT** overwrite customized store data.
- [ ] Full backup JSON downloadable from **Admin Portal → System Settings → Backup & Restore**.
- [ ] Automated daily cron backup configured on server.
