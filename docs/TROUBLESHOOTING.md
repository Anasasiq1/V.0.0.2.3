# Troubleshooting & Common Issues Guide

This document provides diagnosis and resolution steps for common deployment, runtime, database, network, and static routing issues.

---

## 1. Static Deployment Issues (Mode A)

### 1.1 Direct Store URL or Sub-Page Refresh Returns 404
- **Symptom**: Navigating to `https://example.com/store/ajmeeri-restaurant` or refreshing `/account` produces a 404 Not Found error.
- **Cause**: Web server is attempting to locate a physical file named `/store/ajmeeri-restaurant` instead of routing through `index.html`.
- **Solution**:
  - **Apache / cPanel**: Ensure `.htaccess` exists in your document root with rewrite rules enabled (`mod_rewrite`).
  - **Nginx**: Add `try_files $uri $uri/ /index.html;` to your `location /` block and reload Nginx (`nginx -s reload`).

### 1.2 Blank White Page on Initial Load
- **Symptom**: Browser opens a completely blank page.
- **Cause**: Assets failed to load due to incorrect base path or missing files.
- **Solution**:
  1. Open Browser Developer Tools (`F12` -> Console).
  2. If assets return 404, verify that `index.html` and the `assets/` folder are directly in `public_html/`, not nested inside `public_html/dist/`.
  3. Ensure file permissions are set to `644` for files and `755` for directories (`chmod -R 755 /www/wwwroot/domain`).

---

## 2. Node.js & SSR Deployment Issues (Mode B)

### 2.1 502 Bad Gateway (Nginx)
- **Symptom**: Nginx displays "502 Bad Gateway" when visiting the site.
- **Cause**: The Node.js / Express backend is not running or listening on a different port than Nginx is proxying.
- **Solution**:
  1. Check if Node is running: `pm2 status` or `ps aux | grep node`.
  2. Check current listening ports: `netstat -tlpn | grep 3000` (or `ss -tulpn`).
  3. Verify the `PORT` setting in `.env` matches your Nginx `proxy_pass http://127.0.0.1:3000;`.
  4. View server crash logs: `pm2 logs hmq-platform --lines 50`.

### 2.2 Server Fails to Start: "EADDRINUSE: address already in use"
- **Symptom**: Node process exits with `EADDRINUSE :::3000`.
- **Cause**: Another process is already running on port 3000.
- **Solution**:
  - Change the port in `.env` (e.g. `PORT=3001` or `PORT=4302`) and update Nginx `proxy_pass`.
  - Or kill the blocking process: `lsof -ti:3000 | xargs kill -9`.

---

## 3. Database Connection Issues

### 3.1 "ECONNREFUSED 127.0.0.1:3306" or Access Denied
- **Symptom**: Logs show `[MySQL Setup Notice] Access denied for user 'hmq_user'@'localhost'`.
- **Cause**: Incorrect database credentials or MySQL daemon stopped.
- **Solution**:
  1. Verify MySQL status: `systemctl status mysql` (or `systemctl status mariadb`).
  2. Test credentials from CLI: `mysql -u hmq_user -p -h localhost hmq_database`.
  3. Update `.env` with correct `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
  4. *Note*: HM-Q automatically falls back to atomic file storage (`data_store.json`) so your website remains accessible even if MySQL is temporarily offline.

---

## 4. API, CORS & Authentication Issues

### 4.1 CORS Error on API Calls
- **Symptom**: Browser console shows `Access to fetch at 'https://api.example.com' has been blocked by CORS policy`.
- **Cause**: Frontend and Backend are on different domains without proxying.
- **Solution**:
  - Prefer same-domain reverse proxy via Nginx (`location /api/ { proxy_pass http://127.0.0.1:3000/api/; }`).
  - Or ensure backend returns proper CORS headers for the frontend domain.

### 4.2 Admin Login Session Not Persisting
- **Symptom**: Admin gets logged out immediately after page reload.
- **Cause**: Browser blocked third-party cookies or HTTPS is missing.
- **Solution**:
  - Ensure the domain is served over HTTPS with a valid SSL certificate.
  - HM-Q supports both `HttpOnly` cookies and `x-admin-token` / `x-customer-token` authorization headers for maximum client compatibility.

---

## 5. WhatsApp & Payment Issues

### 5.1 WhatsApp Link Does Not Open App on Mobile
- **Symptom**: Clicking checkout link opens a blank web page instead of launching WhatsApp.
- **Cause**: Unencoded URL parameters or invalid phone formatting.
- **Solution**:
  - Verify store phone format in Store Panel: 10-digit number for India (e.g. `9876543210`) or with international code (e.g. `919876543210`).
  - HM-Q uses standard `wa.me/<phone>?text=<encoded_text>` protocol compatible with iOS, Android, and Desktop WhatsApp Web.

### 5.2 UPI QR Code / Payment Deep Link Not Triggering App
- **Symptom**: Mobile phone does not show GPay/PhonePe choice on checkout.
- **Cause**: Browser restrictions in certain in-app webviews (e.g. Instagram/Facebook webview).
- **Solution**:
  - HM-Q displays an on-screen UPI QR code and Copy UPI ID fallback so customers can complete the payment directly.
