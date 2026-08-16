# 03 - Domain & Web Server Setup

This document outlines configuring custom domains (e.g., `store-wa.hm-q.in`) and setting up reverse proxy configurations using Nginx or aaPanel.

---

## DNS Configuration

In your DNS provider (e.g. Cloudflare, Namecheap, GoDaddy, Hostinger):

| Type | Name | Content / Target | TTL |
|------|------|------------------|-----|
| A | `store-wa` (or `@`) | `<YOUR_SERVER_PUBLIC_IP>` | Auto / 300 |
| CNAME | `www` | `store-wa.hm-q.in` | Auto |

---

## Nginx Reverse Proxy Configuration

Create or edit `/etc/nginx/sites-available/store-wa.hm-q.in`:

```nginx
server {
    listen 80;
    server_name store-wa.hm-q.in;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store-wa.hm-q.in;

    ssl_certificate /etc/letsencrypt/live/store-wa.hm-q.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store-wa.hm-q.in/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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

    # Uploads & Assets static caching
    location /uploads/ {
        alias /var/www/store-app/data/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/store-wa.hm-q.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL / HTTPS Certificate (Certbot)

Generate a free Let's Encrypt SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d store-wa.hm-q.in
```

---

## aaPanel / Control Panel Deployment

1. Go to **Websites** > **Add Site**.
2. Domain: `store-wa.hm-q.in`.
3. Select **Reverse Proxy**.
4. Target URL: `http://127.0.0.1:3000`.
5. Apply SSL certificate in aaPanel SSL tab.
