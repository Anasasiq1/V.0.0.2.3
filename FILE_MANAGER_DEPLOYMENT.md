# File Manager / Website Mode Deployment Guide

This mode allows you to deploy the platform as a normal, fast static website through **aaPanel File Manager**, **cPanel**, **Plesk**, or standard **Apache/Nginx** web root (`public_html` / `wwwroot`) without needing Node.js or PM2 running on the server.

---

## Step-by-Step Instructions

### 1. Build the Production Website
On your local machine or build environment, run:
```bash
npm run build:static
```
This generates the optimized production build in the `dist/` directory.

### 2. Compress the `dist` Directory
Compress the contents of the `dist/` folder into a `.zip` file (e.g., `dist.zip`).

Ensure the root of the ZIP contains:
* `index.html`
* `assets/`
* `.htaccess` (included automatically from `public/` for Apache URL rewriting)
* `_redirects` (for Netlify/Cloudflare/Nginx SPA routing)
* `manifest.json`

### 3. Upload via File Manager
1. Log into your **aaPanel** or **cPanel** control panel.
2. Open **File Manager**.
3. Navigate to your website's root folder:
   * aaPanel: `/www/wwwroot/yourdomain.com/`
   * cPanel: `/public_html/` or `/public_html/subdomain/`
4. Upload `dist.zip`.
5. Extract the ZIP contents directly into the web root.

### 4. Nginx Configuration (If using Nginx on aaPanel)
If your server uses **Nginx**, ensure your site configuration includes SPA fallback so direct link refreshes (e.g. `/stores`, `/admin`, `/market`) load seamlessly:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
*(If using Apache or LiteSpeed, the included `.htaccess` handles this automatically with zero configuration).*

### 5. Open Your Website
Open `https://yourdomain.com` in your browser. The entire storefront, multi-store directory, market, and templates will function instantly.
