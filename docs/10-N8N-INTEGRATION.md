# 10 - n8n Workflow & WhatsApp API Integration

n8n acts as the automation bridge between WhatsApp messaging (WhatsApp Cloud API / Webhooks) and the e-commerce web platform.

---

## n8n Workflow Architecture

```text
+-----------------------+     +-------------------------------+     +---------------------------+
| WhatsApp Cloud API    | --> | n8n Webhook Trigger           | --> | Expression / Code Node    |
| (Incoming Message)    |     | Extract remoteJid             |     | Format Link with ?phone=  |
+-----------------------+     +-------------------------------+     +---------------------------+
                                                                                  |
                                                                                  v
+-----------------------+                                           +---------------------------+
| Customer Receives Link| <---------------------------------------- | WhatsApp Send Node        |
| Click to Open Store   |                                           | Send Interactive Message  |
+-----------------------+                                           +---------------------------+
```

---

## Technical Configuration Details

### 1. Extracting Customer Phone Number
In n8n, incoming WhatsApp messages supply the sender's ID in the `remoteJid` field:
`919633594302@s.whatsapp.net`

n8n Expression to extract clean phone number:
```javascript
{{ $('WhatsApp Trigger').first().json.body.data.key.remoteJid.replace('@s.whatsapp.net', '') }}
```

### 2. Generating Customer Web Link
Construct the store entry URL:
```text
https://store-wa.hm-q.in/?phone={{ $('WhatsApp Trigger').first().json.body.data.key.remoteJid.replace('@s.whatsapp.net','') }}
```
*Example Output*:
`https://store-wa.hm-q.in/?phone=919633594302`

---

## Order Placement Notification Webhook (Store -> n8n -> WhatsApp)

When an order is created on the platform (`POST /api/orders`), the server triggers an outbound notification payload to n8n:

### Webhook Target URL
`<N8N_WEBHOOK_URL>/webhook/order-placed`

### Request Body (JSON)
```json
{
  "event": "ORDER_PLACED",
  "order_id": "ORD-17234",
  "store_name": "Hyperlocal Supermarket Tirur",
  "customer_name": "Anas",
  "customer_phone": "919633594302",
  "items_count": 3,
  "grand_total": 450,
  "dispatch_whatsapp": "919633594302"
}
```

### n8n WhatsApp Action Node
n8n receives the webhook and calls the WhatsApp API to deliver an instant order receipt message directly to the customer's WhatsApp chat.
