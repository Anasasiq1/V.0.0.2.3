# Production Verification Checklist (`PRODUCTION_CHECKLIST.md`)

Execute this checklist after deploying or upgrading the Hyperlocal Commerce Platform.

---

## Pre-Deployment Verification
- [ ] Database backup created (`cp data_store.json data_store.json.bak_$(date +%Y%m%d_%H%M%S)`)
- [ ] Environment secrets configured in `.env` (`N8N_WEBHOOK_URL`, `PORT`, `APP_URL`)
- [ ] Upload directory permissions verified (`chmod -R 755 uploads`)
- [ ] Dependencies installed (`npm install --production=false`)
- [ ] Production build compiled successfully (`npm run build`)

---

## Core Application Verification
- [ ] Application process running (`pm2 status`)
- [ ] Reverse proxy and HTTPS working (`https://store-wa.hm-q.in`)
- [ ] Admin Panel login working (`/admin`)
- [ ] Store Panel login working (`/storepanel` using Store Code, Username, or Slug)
- [ ] Store URL resolving correctly (`/store/:slug`)
- [ ] Inactive/suspended store URL displaying "Store Currently Inactive" message
- [ ] Authenticated store session preserved after page refresh
- [ ] Multi-tenant isolation verified (Store A sees only Store A orders and products)
- [ ] Store Team can edit products using Admin-created categories
- [ ] Store Team cannot create categories (restricted to Super Admin)
- [ ] Sensitive store change requests generate `PendingStoreChange` records
- [ ] Admin approval of sensitive store changes applies update to store profile

---

## Customer & Order System Verification
- [ ] Customer profile data persisted across visits
- [ ] Automatic WhatsApp number detection working upon entering via URL parameter (`?phone=...`)
- [ ] Cart checkout creates order correctly
- [ ] Payment UPI / QR functionality generating valid dynamic links
- [ ] Duplicate order prevention verified (`processedOrderIds` idempotency guard)

---

## WhatsApp & N8N Automation Verification
- [ ] N8N workflow imported and activated
- [ ] N8N webhook trigger endpoint responding with 200 OK
- [ ] Customer confirmation message sent strictly to `customer_phone`
- [ ] Merchant order notification sent strictly to `merchant_whatsapp_phone`
- [ ] Merchant notification NEVER sent to `customer_phone`
- [ ] Webhook error fail-safe verified (order completes even if N8N service is temporarily offline)

---

## Post-Deployment Verification
- [ ] Log inspection clean (`pm2 logs hyperlocal-app --lines 50`)
- [ ] Rollback backup preserved in `/var/www/backups/`
