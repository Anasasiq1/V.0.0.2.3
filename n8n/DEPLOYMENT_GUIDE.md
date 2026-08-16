# n8n Automation & WhatsApp Webhook Deployment Guide

## 1. Architectural Overview

This system follows a **strictly decoupled** architecture:
```
[Customer Checkout Website]
           │
           ▼ (HTTP POST with JSON payload)
   [n8n Webhook Node]
           │
           ▼ (Normalized Payload & Template Formatter)
   [n8n Automation Workflow]
           │
           ├───────────────────────────────┬───────────────────────────────┐
           ▼                               ▼                               ▼
    [Evolution API]              [Meta WhatsApp Cloud API]              [WAHA]
           │                               │                               │
           └───────────────────────────────┴───────────────────────────────┘
                                           │
                                           ▼
                       [Customer & Store WhatsApp Alerts]
```

### Key Principles:
1. **No WhatsApp Hardcoding on the Website**: The website code only knows about the configured n8n Webhook URL. It never contains provider keys, Evolution API endpoints, or Meta secrets.
2. **Provider Flexibility**: You can switch providers (Evolution API, Meta WhatsApp Cloud API, WAHA, Twilio, etc.) at any time directly in your n8n workflow without modifying website files.
3. **Idempotency & Retry**: Every order contains a unique `order_id`. Failed webhook dispatches can be retried directly from the Admin Panel Orders tab.

---

## 2. Fast Deployment via Docker Compose

### Prerequisites
- Docker & Docker Compose installed on your VPS / server.
- Port 5678 (n8n) and port 8080 (Evolution API or WAHA) open or proxied behind Nginx/Caddy.

### Step 1: Clone or Copy the `n8n` Directory
```bash
mkdir -p /opt/n8n-stack
cd /opt/n8n-stack
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
nano .env
```

### Step 3: Start Services
```bash
docker compose up -d
```

Check status:
```bash
docker compose ps
docker compose logs -f n8n
```

---

## 3. n8n Workflow Import & Activation

1. Access your n8n UI at `http://your-server-ip:5678` (or your domain e.g., `https://n8n.yourdomain.com`).
2. Complete the initial admin setup (set username & password).
3. In n8n, click **Workflows** ➔ **Import from File...** ➔ Select `n8n/production-workflow.json`.
4. Click **Publish / Active** (toggle top-right to ON).
5. Copy the production webhook URL:
   `https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook`
   *(Or for local testing: `http://localhost:5678/webhook/hyperlocal-order-webhook`)*

---

## 4. Website Admin Panel Configuration

1. Log into your Website Admin Panel (`/admin` or Admin tab).
2. Go to **Integrations (n8n)** tab.
3. Enter:
   - **n8n Webhook Endpoint URL**: `https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook`
   - **Host / Domain**: `n8n.yourdomain.com` (or `localhost`)
   - **Port**: `5678`
   - **Protocol**: `https` (or `http`)
   - **Webhook Signing Secret (Optional)**: `n8n_sec_your_secret_here`
4. Click **Save n8n Settings**.
5. Click **Test n8n Server Connection** to verify reachability.
6. Click **Test Webhook Payload Dispatch** to send a test order to your n8n workflow.

---

## 5. Connecting WhatsApp Providers in n8n

### Option A: Evolution API (Self-Hosted / Open-Source)
1. In `.env`:
   ```env
   WHATSAPP_PROVIDER=EVOLUTION_API
   EVOLUTION_API_BASE_URL=http://evolution-api:8080
   EVOLUTION_API_KEY=YOUR_GLOBAL_AUTHENTICATION_KEY
   EVOLUTION_INSTANCE_NAME=hyperlocal_store
   ```
2. Scan the QR code in Evolution API manager to link your WhatsApp number.

### Option B: Meta WhatsApp Cloud API (Official Business API)
1. In `.env`:
   ```env
   WHATSAPP_PROVIDER=META_CLOUD_API
   META_ACCESS_TOKEN=EAAG...
   META_PHONE_NUMBER_ID=1092837465...
   ```
2. The workflow automatically routes messages via `https://graph.facebook.com/v19.0/{PHONE_ID}/messages`.

### Option C: WAHA (WhatsApp HTTP API)
1. In `.env`:
   ```env
   WHATSAPP_PROVIDER=WAHA
   GENERIC_WA_API_URL=http://waha:3000/api/sendText
   ```

---

## 6. Standard Webhook Payload Reference

The website sends standard JSON to the webhook upon order placement:

```json
{
  "event": "order.created",
  "order": {
    "order_id": "ORD-2026-0814-XYZ",
    "store_id": "store-1",
    "store_code": "STR01",
    "store_name": "Ajmeeri Restaurant & Hypermarket",
    "customer_name": "Muhammed Rashid",
    "customer_phone": "919876543210",
    "customer_whatsapp": "919876543210",
    "delivery_address": "Flat 4B, Emerald Heights, City Center",
    "delivery_slot": "Express 15-20 min",
    "payment_method": "cod",
    "payment_status": "Pending",
    "subtotal": 450,
    "delivery_fee": 30,
    "total_amount": 480,
    "currency": "INR",
    "items": [
      {
        "product_id": "prod-1",
        "name": "Chicken Biryani (Full)",
        "quantity": 2,
        "price": 180,
        "total": 360
      }
    ]
  },
  "source": "website",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

---

## 7. Security Best Practices

1. **Header Verification**: When a `Webhook Signing Secret` is configured in the Admin Panel, the website sends an `X-Webhook-Secret` HTTP header. You can add a Header validation check in your n8n workflow.
2. **Reverse Proxy & SSL**: Always run n8n behind an HTTPS proxy (Caddy, Nginx, Cloudflare) in production.
3. **Internal Network**: When using Docker, place the website and n8n on the same Docker bridge network so webhook traffic stays internal without traversing the public internet.
