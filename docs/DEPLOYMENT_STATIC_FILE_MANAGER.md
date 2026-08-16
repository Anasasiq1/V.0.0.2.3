# Mode A: Static File Manager Deployment Guide

This guide details how to deploy the HM-Q frontend as a static website on standard web hosting, cPanel, aaPanel, Apache, Nginx, or Cloudflare Pages without requiring a Node.js process to serve the static frontend.

---

## 1. Architecture Summary

```
Client Browser
      │
      ▼
Static Web Server (public_html / www / htdocs)
├── index.html
├── assets/ (CSS, JS bundles)
├── sw.js (PWA Service Worker)
└── .htaccess (Apache SPA Rewrite Fallback)
      │
      ▼ (API Requests to /api/*)
Backend Server / Reverse Proxy
      │
      ▼
Database (MySQL / Persistent Storage)
```

---

## 2. Key Specifications

- **STATIC BUILD COMMAND**: `npm run build:static` (or `npm run build`)
- **OUTPUT DIRECTORY**: `dist/`
- **UPLOAD DESTINATION**: `public_html` / `www` / `htdocs` / `/www/wwwroot/your-domain.com/`

---

## 3. Step-by-Step Installation Procedure

### STEP 1: Prepare the Source Code
Clone or extract the source repository on your local computer or build machine.

### STEP 2: Configure Static Environment
Create or configure `.env` on your build machine:
```env
NEXT_PUBLIC_SSR=false
# Optional: Set remote backend API URL if API is hosted on a separate subdomain
VITE_API_URL=
```
*(Note: If static files and API endpoints are on the same domain via reverse proxy, leave `VITE_API_URL` empty for automatic relative `/api` paths).*

### STEP 3: Install Build Dependencies
```bash
npm install
```

### STEP 4: Run the Static Production Build
```bash
npm run build:static
```

### STEP 5: Identify the Generated Output Directory
The build outputs all static production assets into the `dist/` folder:
```
dist/
├── index.html
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── ...
├── sw.js
├── manifest.json
└── .htaccess
```

### STEP 6: Open aaPanel / cPanel File Manager
Log into your hosting control panel (e.g. aaPanel, cPanel, CyberPanel, DirectAdmin, Plesk).

### STEP 7: Navigate to Document Root
Open your domain's document root directory:
- **aaPanel**: `/www/wwwroot/your-domain.com/`
- **cPanel**: `public_html/` (or `public_html/subdomain/`)
- **Apache/Nginx standard**: `/var/www/html/`

### STEP 8: Upload the Generated Static Files
Upload the contents of the `dist/` folder. You can create a ZIP archive of `dist/` (`dist.zip`), upload it, and extract it directly on the server.

### STEP 9: Extract Archive (if ZIP was uploaded)
Extract `dist.zip` inside your document root.

### STEP 10: Verify File Placement in Root
Ensure `index.html` resides directly in the document root:
- **Correct**:
  ```
  public_html/
  ├── index.html
  ├── assets/
  ├── manifest.json
  └── .htaccess
  ```
- **Incorrect**:
  ```
  public_html/
  └── dist/
      └── index.html
  ```

### STEP 11: Configure Domain & DNS
Point your domain's DNS `A` or `CNAME` record to your server IP address.

### STEP 12: Configure HTTPS / SSL Certificate
Enable a Let's Encrypt or custom SSL certificate in your control panel to ensure secure HTTPS connections and full PWA service worker support.

### STEP 13: Test the Website
Open your browser, navigate to your domain, test navigation across stores, categories, market, and cart.

---

## 4. SPA Routing & Fallback Configuration

Because HM-Q uses client-side routing for dynamic paths (e.g. `/store/ajmeeri-restaurant`, `/account`, `/categories`, `/market`), deep-link refreshes must route through `index.html`.

### Apache / cPanel (`.htaccess`)
A pre-configured `.htaccess` is included in the build:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx Configuration
In your Nginx site configuration block:
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;
    root /www/wwwroot/yourdomain.com;
    index index.html;

    # Single Page App Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Node.js backend (if running on internal port)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Asset Caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|webp)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
```

---

## 5. Pre-Flight Verification Checklist

- [ ] Static build generated successfully with `npm run build:static`
- [ ] `index.html` is located directly in `public_html/` or `/www/wwwroot/DOMAIN/`
- [ ] Direct URL refresh on `/store/ajmeeri-restaurant` loads without 404
- [ ] Direct URL refresh on `/account`, `/categories`, and `/market` loads properly
- [ ] SSL / HTTPS is active (Service Worker registers cleanly)
- [ ] API calls route correctly to backend without CORS errors
