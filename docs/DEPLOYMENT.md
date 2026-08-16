# Production Deployment Guide (`DEPLOYMENT.md`)

This guide provides complete instructions for deploying the upgraded Hyperlocal Commerce Platform on production servers (Ubuntu, aaPanel, Cloud Run, VPS, PM2) while preserving existing live store data.

---

## 1. System & Server Requirements

- **Operating System:** Ubuntu 20.04 / 22.04 LTS, Debian 11+, or Linux-based container environment
- **Node.js:** Node.js v18.x or v20.x LTS (Node.js v20 LTS recommended)
- **Package Manager:** npm v9+ or pnpm v8+
- **Reverse Proxy:** Nginx 1.18+ or Apache 2.4 with SSL certificate (Let's Encrypt / Certbot)
- **Process Manager:** PM2 v5+
- **Memory:** Minimum 1 GB RAM (2 GB recommended)
- **Disk Space:** Minimum 5 GB SSD storage

---

## 2. Directory Structure & File Permissions

```bash
/var/www/hyperlocal-app/
├── dist/                  # Production compiled bundle
│   ├── index.html
│   └── server.cjs         # Express + Vite compiled server
├── data_store.json        # Authoritative persistent database
├── uploads/               # Store asset upload directory
├── .env                   # Environment secrets
└── package.json
```

Set file permissions for web service execution:
```bash
sudo chown -R www-data:www-data /var/www/hyperlocal-app
sudo chmod -R 755 /var/www/hyperlocal-app
sudo chmod 600 /var/www/hyperlocal-app/.env
```

---

## 3. Fresh Production Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/Anasasiq1/V.0.0.1.git /var/www/hyperlocal-app
cd /var/www/hyperlocal-app
```

### Step 2: Install Dependencies
```bash
npm install --production=false
```

### Step 3: Configure Environment
Copy `.env.example` to `.env` and configure required values:
```bash
cp .env.example .env
nano .env
```

### Step 4: Build Production Assets
```bash
npm run build
```
*Note: `npm run build` runs `vite build` followed by `esbuild` bundling `server.ts` into `dist/server.cjs`.*

### Step 5: Start Process with PM2
```bash
pm2 start dist/server.cjs --name "hyperlocal-app"
pm2 save
pm2 startup
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

```nginx
server {
    listen 80;
    server_name store-wa.hm-q.in *.store-wa.hm-q.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store-wa.hm-q.in *.store-wa.hm-q.in;

    ssl_certificate /etc/letsencrypt/live/store-wa.hm-q.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store-wa.hm-q.in/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Issue Let's Encrypt SSL:
```bash
sudo certbot --nginx -d store-wa.hm-q.in -d *.store-wa.hm-q.in
```

---

## 5. Health Check & Verification

```bash
# Verify application HTTP response
curl -I https://store-wa.hm-q.in/api/data

# Verify PM2 status
pm2 status
```
