# Node.js Application Mode Deployment Guide

This mode runs the platform as a full-stack **Node.js Express + React Application** supporting persistent MySQL/JSON storage, live WhatsApp webhook automation, POS cashier billing, and external app connectors.

---

## Step-by-Step Instructions

### 1. Upload Source Code
Upload the repository files to your server directory (e.g., `/www/wwwroot/hmq-app/` or `/var/www/hmq-app/`).

### 2. Configure Environment Variables (`.env`)
Create or edit your `.env` file in the project root:

```env
NODE_ENV=production
PORT=4302

# Optional MySQL Database (Falls back to local data_store.json automatically if omitted)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=hmqin
DB_USERNAME=hmquser
DB_PASSWORD=your_secure_password

# Optional n8n Webhook Automation
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/orders
N8N_WEBHOOK_SECRET=your_secret_key
```

> **Port Configuration:**
> You can set `PORT=3000`, `PORT=3001`, `PORT=4302`, or any available port. The server binds dynamically to `process.env.PORT`.

---

### 3. Install Dependencies & Build
Run in the project root:
```bash
npm install
npm run build
```
This compiles the client into `dist/` and packages the server bundle into `dist/server.cjs`.

---

### 4. Start the Application

#### Method A: Using PM2 (Recommended for Production)
```bash
# Start with PM2
pm2 start dist/server.cjs --name "hmq-commerce" --env PORT=4302

# Save PM2 process list to restart on system reboot
pm2 save
pm2 startup
```

#### Method B: Using aaPanel Node.js Project Manager
1. Open **aaPanel** > **Node.js Project Manager**.
2. Click **Add Project**:
   * **Project directory:** Select the project root folder.
   * **Start command / Entry file:** `dist/server.cjs` (or `npm start`).
   * **Port:** `4302` (or `3000` / `3001`).
   * **Node.js Version:** `v18+` or `v20+`.
3. Click **Submit** to start.

---

### 5. Nginx Reverse Proxy Configuration (aaPanel / VPS)
To connect your domain (`yourdomain.com`) to the Node.js port (`4302`), add this to your Nginx site configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
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

### 6. Verification
Test that your server is running:
```bash
curl -I http://127.0.0.1:4302/api/v1/health
```
You will receive:
```json
{"success":true,"status":"operational","capabilities":[...]}
```
