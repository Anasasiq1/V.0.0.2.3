# n8n Workflow Automation & Webhook Integration Guide

HM-Q includes native webhook event triggers that send structured JSON payloads to an n8n workflow engine upon order placement, status changes, template activations, and scheduled health checks.

---

## 1. Webhook Architecture

```
Customer Places Order
        │
        ▼
HM-Q Express Backend (/api/orders)
        │
        ▼ POST HTTP Webhook (Bearer / Secret Authentication)
n8n Workflow Webhook Node (https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook)
        │
        ├──▶ Format WhatsApp Message (Markdown/Emoji)
        ├──▶ Send to WhatsApp API (Evolution / Meta Cloud / WAHA)
        ├──▶ Save to Google Sheets / ERP / Inventory
        └──▶ Send Push Notification to Merchant
```

---

## 2. Configuration Options

### Option A: Via Super Admin Panel UI (No Restart Required)
1. Open Super Admin Panel (`/superadmin.php` or navigate to Admin -> Platform Settings).
2. Go to the **Webhook / n8n Automation** section.
3. Enter your **n8n Webhook URL** (e.g. `https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook`).
4. (Optional) Enter your **Webhook Secret / Token**.
5. Toggle **Enable Webhook Triggers** to ON.
6. Click **Save Settings**.

### Option B: Via Server Environment (`.env`)
```env
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/hyperlocal-order-webhook
N8N_WEBHOOK_SECRET=your_secret_token_here
```

---

## 3. Webhook Payload Structure

When a customer checks out, HM-Q dispatches a webhook payload with full order context:

```json
{
  "event": "order.created",
  "timestamp": "2026-08-16T12:00:00.000Z",
  "order": {
    "id": "ORD-12345",
    "order_number": "ORD-12345",
    "store_id": "STR-001",
    "store_name": "Ajmeeri Restaurant",
    "store_whatsapp": "919876543210",
    "customer": {
      "customer_id": "cust-abc123",
      "name": "Anas Asiq",
      "whatsapp_number": "919446000000",
      "address": "Main Road, Tirur, Kerala"
    },
    "items": [
      {
        "id": "prod-1",
        "name": "Chicken Biryani",
        "price": 180,
        "quantity": 2,
        "selectedVariant": "Full"
      }
    ],
    "subtotal": 360,
    "delivery_fee": 30,
    "total": 390,
    "payment_method": "UPI",
    "payment_status": "PAID",
    "delivery_slot": "Instant (20-30 mins)"
  }
}
```

---

## 4. Ready-to-Use n8n Workflow Templates

Pre-built workflow definitions are included in the repository:
- `automation/n8n/workflows/whatsapp_order_integration.json`
- `automation/n8n/workflows/template_activation.json`
- `automation/n8n/workflows/template_import_validation.json`
- `automation/n8n/workflows/scheduled_health_checks.json`

### Importing into n8n:
1. Open your n8n web dashboard.
2. Click **Workflows -> Add Workflow -> Import from JSON**.
3. Select `automation/n8n/workflows/whatsapp_order_integration.json`.
4. Update credentials for your WhatsApp provider (Meta Cloud / Evolution / WAHA).
5. Click **Activate Workflow**.
