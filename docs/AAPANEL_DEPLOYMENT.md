# aaPanel Complete Deployment Guide

aaPanel is a popular web hosting control panel for Linux servers. This guide explains how to deploy HM-Q on aaPanel using either **Method A: File Manager / Static Site** or **Method B: Node.js Project Manager / PM2**.

---

## 1. aaPanel Server Prerequisites

1. **Linux OS**: Ubuntu 20.04/22.04 LTS, Debian 11/12, or AlmaLinux 8/9
2. **aaPanel Installed**: Web interface accessible on port `8888`
3. **App Store Plugins to Install in aaPanel**:
   - **Nginx** (1.22+ or 1.24+)
   - **MySQL** (8.0+ or MariaDB 10.6+)
   - **Node.js Version Manager** (v18.x, v20.x, or v22.x LTS)
   - **PM2 Manager** (Optional, or CLI pm2)

---

## 2. Method A: aaPanel File Manager / Static Deployment

### Step 1: Build Static Assets on Local / CI Machine
On your development computer:
```bash
npm install
npm run build:static
```
This produces the `dist/` directory.

### Step 2: Create Website in aaPanel
1. Open **aaPanel -> Website -> Add site**.
2. **Domain**: Enter your domain (e.g. `shop.example.com`).
3. **Type**: Select **PHP/Static** (leave PHP version as *Pure Static*).
4. **Root directory**: `/www/wwwroot/shop.example.com`
5. Click **Submit**.

### Step 3: Upload Static Files via aaPanel File Manager
1. Navigate to **Files -> /www/wwwroot/shop.example.com**.
2. Delete the default `index.html` and `404.html` created by aaPanel.
3. Upload `dist.zip` (compressed `dist/` folder) and click **Unzip**.
4. Move all files so that `index.html` is directly inside `/www/wwwroot/shop.example.com/`.

### Step 4: Configure SPA URL Rewrite in aaPanel
1. In aaPanel, go to **Website -> Click on your Domain -> URL rewrite**.
2. Select or enter the Nginx SPA rewrite rule:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
3. Click **Save**.

### Step 5: Configure SSL Certificate in aaPanel
1. In Website Settings, click **SSL -> Let's Encrypt**.
2. Select your domain and click **Apply**.
3. Enable **Force HTTPS**.

---

## 3. Method B: aaPanel Node.js Project Manager Deployment

### Step 1: Upload Source Code to aaPanel
1. Navigate to **Files -> /www/wwwroot/**.
2. Create folder `hmq-app`.
3. Upload the project repository files into `/www/wwwroot/hmq-app/`.

### Step 2: Configure Environment Variables
1. In aaPanel File Manager, open `/www/wwwroot/hmq-app/`.
2. Create a `.env` file with the following contents:
```env
NEXT_PUBLIC_SSR=true
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hmq_user
DB_PASSWORD=YourSecureDatabasePassword
DB_NAME=hmq_database
JWT_SECRET=YourRandomJWTSecretKey
GEMINI_API_KEY=
```

### Step 3: Install Node.js Version & Build
1. Open aaPanel **Terminal** or SSH into server:
```bash
cd /www/wwwroot/hmq-app
npm install
npm run build
```

### Step 4: Create Node Project in aaPanel Node.js Manager
1. Open **aaPanel -> Website -> Node project -> Add Node project**.
2. Fill in the parameters:
   - **Project Name**: `hmq-platform`
   - **Path**: `/www/wwwroot/hmq-app`
   - **Node Version**: Select `v20.x` or `v22.x`
   - **Run Opt**: Select `npm` or `start` (`node dist/server.cjs`)
   - **Port**: `3000` (or `3001` / `4302`)
   - **Project Domain**: `yourdomain.com` (aaPanel will automatically set up Nginx reverse proxy)
3. Click **Submit**.

### Step 5: Configure SSL & Nginx Reverse Proxy
1. If you configured the domain in the Node project step, aaPanel generates the Nginx reverse proxy automatically.
2. Go to **Website -> Node project -> Settings -> SSL -> Let's Encrypt** and issue the SSL certificate.
3. Verify the proxy setting:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 4. Maintenance & Operations in aaPanel

### Viewing Application Logs
- **Node.js Project Manager**: Click **Logs** next to the project to view live console output.
- **PM2 CLI**: Run `pm2 logs hmq-platform` in terminal.

### Restarting the Service
- In aaPanel Node.js Manager, click **Restart**.
- Or via terminal: `pm2 restart hmq-platform`.

### File Permissions
Ensure the web server user has proper read/write permissions for uploads and backup files:
```bash
chown -R www:www /www/wwwroot/hmq-app
chmod -R 755 /www/wwwroot/hmq-app
```
