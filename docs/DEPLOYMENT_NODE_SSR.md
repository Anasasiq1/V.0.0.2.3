# Mode B: Node.js SSR / Full-Stack Deployment Guide

This guide details how to deploy the HM-Q platform as a production Node.js application utilizing Express, PM2, aaPanel Node.js Manager, and an Nginx reverse proxy.

---

## 1. Architecture Summary

```
Client Browser
      │
      ▼ (HTTPS Port 443)
Domain / Nginx Reverse Proxy
      │
      ▼ (Reverse Proxy to 127.0.0.1:3000 / 3001 / 4302)
Node.js / Express Application (Managed via PM2 / aaPanel)
├── SSR & Static Asset Serving (dist/)
├── REST API Endpoints (/api/*)
├── PWA Manifest & Dynamic Service Worker
└── WebSocket / Automation Triggers
      │
      ▼
Database (MySQL 8.0+ / Atomic Snapshot Storage)
```

---

## 2. Port Flexibility & Multi-Instance Support

HM-Q is designed with dynamic port binding. The server binds to `0.0.0.0:${PORT}` using the `PORT` environment variable:
- **Port 3000** (Default): `PORT=3000`
- **Port 3001**: `PORT=3001`
- **Port 4302**: `PORT=4302`
- **Custom Port**: Any available cloud/aaPanel port

---

## 3. Step-by-Step Installation Procedure

### STEP 1: Upload Project Source
Upload the project source code to your server directory:
```bash
# Example destination:
/www/wwwroot/hmq-app/
```

### STEP 2: Open Terminal / SSH
Log into your server via SSH and navigate to the project directory:
```bash
cd /www/wwwroot/hmq-app
```

### STEP 3: Install Dependencies
```bash
npm install
```

### STEP 4: Configure Environment File
Create your production `.env` file based on `.env.example`:
```bash
cp .env.example .env
nano .env
```

### STEP 5: Set SSR Mode to Enabled
Ensure `NEXT_PUBLIC_SSR` is set to `true`:
```env
NEXT_PUBLIC_SSR=true
```

### STEP 6: Configure Application Port & Database
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hmq_user
DB_PASSWORD=YourSecureDatabasePassword
DB_NAME=hmq_database
GEMINI_API_KEY=your_optional_gemini_api_key
JWT_SECRET=your_super_secret_jwt_random_key
```

### STEP 7: Build Production Bundles
```bash
npm run build
```
This command compiles both the optimized frontend assets and bundles the Node.js server to `dist/server.cjs`.

### STEP 8: Test Server Start Manually
Verify that the server starts cleanly:
```bash
npm run start
```
You should see:
```
[HM-Q Server] Running on http://0.0.0.0:3000
```
Press `Ctrl + C` to stop the manual test.

### STEP 9: Configure PM2 Process Manager
Start the application under PM2 process management:

```bash
# Option A: Start using package script
pm2 start npm --name "hmq-platform" -- run start

# Option B: Or start using the included ecosystem config
pm2 start ecosystem.config.cjs

# Option C: Direct node binary start
pm2 start dist/server.cjs --name "hmq-platform" --env PORT=3000
```

### STEP 10: Save PM2 Process List for Auto-Restart on Reboot
```bash
pm2 save
pm2 startup
```

### STEP 11: Configure Nginx Reverse Proxy
In your Nginx site configuration (or via aaPanel -> Site -> Reverse Proxy):

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Proxy all traffic to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload size limit for product images and backups
    client_max_body_size 50M;
}
```

### STEP 12: Configure Domain & DNS Records
Ensure your domain's DNS `A` records point to your server IP address.

### STEP 13: Enable SSL / HTTPS
Generate a free Let's Encrypt SSL certificate via aaPanel or Certbot:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### STEP 14: Final Verification
Open `https://yourdomain.com` in your browser. Verify that:
1. Home page, categories, and stores render instantly.
2. `/superadmin.php` loads the Super Admin Panel.
3. Database status endpoint `https://yourdomain.com/api/database/status` returns operational status.
4. Orders and WhatsApp notification triggers function seamlessly.
