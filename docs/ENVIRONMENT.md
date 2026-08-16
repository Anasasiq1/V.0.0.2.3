# Production Environment Variables Reference (`ENVIRONMENT.md`)

This document lists all environment variables used by the Hyperlocal Commerce Platform in production environments.

---

## 1. Core Runtime Variables

| Variable Name | Description | Required | Default | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Application HTTP server port | Yes | `3000` | `3000` |
| `NODE_ENV` | Application environment state | Yes | `production` | `production` |
| `APP_URL` | Canonical domain URL for storefront & store links | Yes | `http://localhost:3000` | `https://store-wa.hm-q.in` |

---

## 2. N8N & Webhook Integration

| Variable Name | Description | Required | Default | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `N8N_WEBHOOK_URL` | Production N8N order processing webhook URL | Yes | Empty | `https://n8n.example.com/webhook/hyperlocal-order-webhook` |
| `EVOLUTION_API_BASE_URL` | Evolution WhatsApp API gateway host | Recommended | `https://wa-api.example.com` | `https://wa-api.hm-q.in` |
| `EVOLUTION_INSTANCE_NAME` | Evolution WhatsApp instance name | Recommended | `instance` | `hmq-main` |
| `EVOLUTION_API_KEY` | Evolution WhatsApp API secret key | Recommended | Empty | `<SECURE_EVOLUTION_KEY>` |

---

## 3. Storage & Relational Database Configuration

The system primary database uses atomic persistent JSON storage (`data_store.json`). For optional SQL sync or relational database mirrors, configure:

| Variable Name | Description | Required | Default | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_HOST` / `MYSQL_HOST` | Database host address | Optional | `localhost` | `127.0.0.1` |
| `DATABASE_PORT` / `MYSQL_PORT` | Database port | Optional | `3306` | `3306` |
| `DATABASE_NAME` / `MYSQL_DATABASE` | Database name | Optional | `hyperlocal` | `hmqin` |
| `DATABASE_USER` / `MYSQL_USER` | Database username | Optional | `root` | `hmqin_user` |
| `DATABASE_PASSWORD` / `MYSQL_PASSWORD` | Database password | Optional | Empty | `<SECURE_DB_PASSWORD>` |

---

## 4. AI & Server Secrets

| Variable Name | Description | Required | Default | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key for server AI features | Optional | Empty | `AIzaSy...` |
| `ADMIN_JWT_SECRET` | Secret key for signing sessions | Recommended | `hyperlocal-secret-key` | `<64_CHAR_RANDOM_HEX>` |

---

## 5. Environment File Setup

In production, populate `.env` in the project root:

```bash
# Production .env Template
PORT=3000
NODE_ENV=production
APP_URL=https://store-wa.hm-q.in

# Webhook & N8N
N8N_WEBHOOK_URL=https://n8n.hm-q.in/webhook/hyperlocal-order-webhook
EVOLUTION_API_BASE_URL=https://wa-api.hm-q.in
EVOLUTION_INSTANCE_NAME=hmq-instance
EVOLUTION_API_KEY=YOUR_EVOLUTION_API_KEY_HERE

# Database Options
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=hmqin
DATABASE_USER=hmqin_user
DATABASE_PASSWORD=YOUR_SECURE_DB_PASSWORD
```

Restrict permissions on `.env`:
```bash
chmod 600 .env
```
