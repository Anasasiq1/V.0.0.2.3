# Domain & Reverse Proxy Setup Guide

This document explains how to map custom domains, configure Nginx reverse proxies, and manage SSL certificates for the Hyperlocal Commerce Platform.

---

## 1. Domain Routing Architecture

The platform supports **Multi-Domain Routing**. The system identifies the requested store or tenant dynamically based on the incoming `Host` header sent by the browser.

```
Request: https://shop1.com/ ─────► Nginx ─────► Express Server ─────► Resolves Store 1 Data
Request: https://shop2.com/ ─────► Nginx ─────► Express Server ─────► Resolves Store 2 Data
Request: https://myshop.in/  ─────► Nginx ─────► Express Server ─────► Resolves Store 3 Data
```

---

## 2. DNS Configuration

For each domain pointing to your installation, configure DNS records at your domain registrar (Cloudflare, GoDaddy, Namecheap):

| Record Type | Host | Points To | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `[YOUR_SERVER_PUBLIC_IP]` | Automatic / 300s |
| **CNAME** | `www` | `@` or `[YOUR_SERVER_PUBLIC_IP]` | Automatic / 300s |

---

## 3. Nginx Configuration for Multi-Domain Setup

Create an Nginx configuration file in `/etc/nginx/sites-available/hyperlocal.conf`:

```nginx
# HTTP - Redirect all traffic to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name shop1.com www.shop1.com shop2.com myshop.in store-wa.hm-q.in;

    return 301 https://$host$request_uri;
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name shop1.com www.shop1.com shop2.com myshop.in store-wa.hm-q.in;

    # SSL Certificates (Managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/shop1.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop1.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 25M;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root reverse proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}
```

Enable site configuration:
```bash
sudo ln -s /etc/nginx/sites-available/hyperlocal.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Provisioning Multi-Domain SSL Certificates

Use Certbot to request a single multi-domain SSL certificate or individual certificates:

```bash
sudo certbot --nginx -d shop1.com -d www.shop1.com -d shop2.com -d myshop.in
```

Certbot automatically configures auto-renewal via cron / systemd timer. You can test renewal with:
```bash
sudo certbot renew --dry-run
```

---

## 5. Mapping Domains inside the Admin Portal

Once the DNS and Nginx records point to the server:

1. Log into the Admin Portal at `https://[YOUR_DOMAIN]/superadmin.php`.
2. Navigate to **Store Settings → Custom Domains**.
3. Add the hostname (e.g. `shop1.com`) and associate it with the corresponding Store ID.
4. Click **Save Settings**.

The server's domain resolver middleware (`getTenantStoreId`) will now automatically serve the correct catalog whenever requests originate from `shop1.com`.
