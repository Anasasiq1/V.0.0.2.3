# 03 - Domain & Web Server Setup
 
This document outlines configuring custom domains (e.g., `store-wa.hm-q.in`, `yourdomain.com`) and setting up reverse proxy configurations using Nginx or aaPanel for both deployment modes.

---

## DNS Configuration

In your DNS provider (e.g. Cloudflare, Namecheap, GoDaddy, Hostinger):

| Type | Name | Content / Target | TTL |
|------|------|------------------|-----|
| A | `@` or subdomain | `<YOUR_SERVER_PUBLIC_IP>` | Auto / 300 |
| CNAME | `www` | `yourdomain.com` | Auto |

---

## Option A: Nginx Configuration for File Manager (Static Mode)

If deploying the static website to `/www/wwwroot/yourdomain.com/`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /www/wwwroot/yourdomain.com;
    index index.html;

    # SPA Direct Refresh Handling
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Caching
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Option B: Nginx Reverse Proxy for Node.js Mode (Ports 4302 / 3001 / 3000)

If running the full Node.js server under PM2 / Node.js Project Manager:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        # Point to your active PORT (e.g. 4302, 3001, 3000)
        proxy_pass http://127.0.0.1:4302;
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

---

## SSL / HTTPS Certificate (Certbot / aaPanel)

### Method 1: Certbot (CLI)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Method 2: aaPanel One-Click SSL
1. Go to **Websites** > Click your website name.
2. Select **SSL** tab > Click **Let's Encrypt**.
3. Select domain and click **Apply**.
4. Turn on **Force HTTPS**.

