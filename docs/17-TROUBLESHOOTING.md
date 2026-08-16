# 17 - Troubleshooting & Diagnostic Matrix

This guide provides practical solutions for common operational issues across web server, database, WhatsApp links, and checkout processes.

---

## Troubleshooting Matrix

### Issue 1: Website Not Opening / Connection Refused
- **Symptom**: `502 Bad Gateway` or `Connection Refused` in browser.
- **Cause**: Node.js Express server is stopped or crashing on startup.
- **Check**:
  ```bash
  pm2 status
  pm2 logs hyperlocal-store --lines 50
  ```
- **Fix**: Restart PM2 process: `pm2 restart hyperlocal-store`. Verify `PORT=3000` is open.

---

### Issue 2: Customer WhatsApp Link Not Recognizing User
- **Symptom**: User clicks `?phone=919633594302` link but phone field stays editable or unregistered.
- **Cause**: Phone number format mismatch between WhatsApp parameter and database (e.g. missing `91` country code prefix).
- **Check**:
  Inspect customer number in `/data/store_data.json` under `customers` array.
- **Fix**: Ensure phone normalizer converts 10-digit numbers to `91<10_DIGITS>`. Verify `/api/customer/recognize` endpoint returns `recognized: true`.

---

### Issue 3: Checkout Phone Input Remains Editable for Authenticated User
- **Symptom**: Customer logged in via WhatsApp link, but checkout phone field is still editable.
- **Cause**: Customer token lost or `localStorage` cleared.
- **Check**: Browser DevTools > Application > Local Storage > check `hyperlocal_customer_token`.
- **Fix**: Re-trigger customer session check via GET `/api/customer/session`.

---

### Issue 4: Audit Logs / Data Changes Not Saving
- **Symptom**: Created store disappears after server restart.
- **Cause**: File permission issue writing to `/data/store_data.json`.
- **Check**:
  ```bash
  ls -la /var/www/store-app/data/
  ```
- **Fix**: Grant write permissions:
  ```bash
  chmod 775 /var/www/store-app/data
  chmod 664 /var/www/store-app/data/store_data.json
  ```

---

### Issue 5: Port 3000 Already in Use
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`.
- **Cause**: Previous server instance still occupying port 3000.
- **Fix**:
  ```bash
  lsof -i :3000
  kill -9 <PID>
  pm2 restart hyperlocal-store
  ```
