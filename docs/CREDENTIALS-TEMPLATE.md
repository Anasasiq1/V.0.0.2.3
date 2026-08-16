# System Credentials & Environment Template

> **CRITICAL SECURITY WARNING**:
> **DO NOT COMMIT REAL PASSWORDS, PRIVATE KEYS, OR PRODUCTION TOKENS TO GIT OR PUBLIC REPOSITORIES.**
> Use this document as a reference template for local environment values on your secure production server `.env` file.

---

## 1. Super Admin Portal

- **URL**: `https://<YOUR-DOMAIN>/#admin`
- **Username**: `<SUPER_ADMIN_USERNAME>`
- **Password**: `<SUPER_ADMIN_PASSWORD>`

---

## 2. Database Credentials (MySQL Optional Sync)

- **Host**: `<DB_HOST>` (e.g. `localhost` or `127.0.0.1`)
- **Port**: `<DB_PORT>` (Default: `3306`)
- **Database Name**: `<DB_NAME>` (e.g. `hmqin` or `hyperlocal_store`)
- **Username**: `<DB_USERNAME>`
- **Password**: `<DB_PASSWORD>`

---

## 3. n8n Workflow Automation Engine

- **n8n Instance URL**: `<N8N_INSTANCE_URL>` (e.g. `https://n8n.yourdomain.com`)
- **Order Webhook URL**: `<N8N_INSTANCE_URL>/webhook/order-placed`
- **API Bearer Token**: `<N8N_API_TOKEN>`

---

## 4. WhatsApp Cloud API / Service Provider

- **Provider**: `<WHATSAPP_PROVIDER>` (e.g. Meta WhatsApp Cloud API / Baileys Gateway)
- **API Base URL**: `<WHATSAPP_API_URL>`
- **Access Token / API Key**: `<WHATSAPP_API_TOKEN>`
- **Phone Number ID**: `<WHATSAPP_PHONE_NUMBER_ID>`
- **Business Account ID**: `<WHATSAPP_BUSINESS_ACCOUNT_ID>`

---

## 5. Environment File Template (`.env`)

```ini
# Application Base Configuration
APP_URL=https://store-wa.hm-q.in
PORT=3000
NODE_ENV=production

# Gemini AI API Key (Optional)
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=<YOUR_DB_USER>
MYSQL_PASSWORD=<YOUR_DB_PASSWORD>
MYSQL_DATABASE=<YOUR_DB_NAME>

# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/order-placed
```
