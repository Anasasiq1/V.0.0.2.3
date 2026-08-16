# 19 - Production Pre-Flight Checklist

Complete this checklist prior to launching the production environment.

---

## Production Verification Matrix

- [x] **Domain & SSL**: Custom domain `store-wa.hm-q.in` configured with HTTPS/SSL certificates.
- [x] **Node Environment**: `NODE_ENV=production` set in `.env` or process manager environment.
- [x] **Default Passwords Changed**: Default Super Admin and Store Owner passwords updated from default placeholders.
- [x] **Data Persistence Permissions**: `/data` directory exists with `chmod 775` permissions.
- [x] **Build Verification**: `npm run build` generates `/dist/server.cjs` and static client bundle cleanly without errors.
- [x] **Process Governance**: PM2 or Systemd set up with auto-restart on system reboot (`pm2 save && pm2 startup`).
- [x] **WhatsApp Recognition**: Link with `?phone=919633594302` opens store, recognizes existing customer, displays Malayalam welcome toast, and cleans URL parameter.
- [x] **Checkout Lock Verification**: Authenticated customer phone field is `disabled` / `read-only` and cannot be modified in checkout UI.
- [x] **Server Identity Protection**: Server overwrites payload phone number with session's authenticated phone number on order placement.
- [x] **n8n Integration Verified**: Webhook payload successfully reaches n8n and triggers WhatsApp dispatch notification.
- [x] **Audit Log Tracking**: Operations logged cleanly in `audit_logs` table.
- [x] **Backup Verification**: Automated backup script `/scripts/backup.sh` scheduled via Cron.
