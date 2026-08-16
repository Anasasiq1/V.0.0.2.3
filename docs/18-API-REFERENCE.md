# 18 - REST API Reference & Developer Gateway Manual (v1 & Core)

This manual documents the AI Studio Commerce OS unified REST endpoints, API Key authentication, HMAC-SHA256 payload signing, request structures, and error codes.

---

## Base URLs & Gateways

- **Production / Dev Base**: `http://localhost:3000` or `https://your-domain.com`
- **Core Endpoints**: `/api/*`
- **Unified Commerce OS v1 Gateway**: `/api/v1/*`

---

## Authentication Schemes

### 1. Developer API Key Auth
Include your API Key in either the `x-api-key` header or as a Bearer token in the `Authorization` header:
```http
x-api-key: hmq_live_f89b21...
# or
Authorization: Bearer hmq_live_f89b21...
```

### 2. Admin Session Token
Include the admin token generated during password login (`/api/auth/login`):
```http
Authorization: Bearer adm_session_...
# or
x-admin-token: adm_session_...
```

### 3. Customer Session Token
Include customer token in headers:
```http
Authorization: Bearer cust_tok_...
```

---

## Unified `/api/v1/*` REST Suite

### 1. System Health & Capabilities
- **GET** `/api/v1/health`
- **Auth**: Public
- **Response**:
```json
{
  "success": true,
  "platform": "AI Studio Commerce OS",
  "version": "v2.4.0-enterprise",
  "status": "operational",
  "timestamp": "2026-08-16T18:00:00.000Z",
  "capabilities": [
    "multi_tenant_stores",
    "hyperlocal_quick_commerce",
    "whatsapp_order_engine",
    "pos_cashier_terminal",
    "rider_fleet_management",
    "developer_api_keys",
    "webhook_dispatcher",
    "merchant_subscriptions",
    "loyalty_and_referral"
  ]
}
```

---

### 2. Developer API Key Management
- **GET** `/api/v1/developer/keys` (List all API keys)
- **POST** `/api/v1/developer/keys` (Generate new API key)
  - **Body**:
    ```json
    {
      "name": "Flutter Mobile Storefront",
      "client_name": "iOS / Android Mobile",
      "environment": "production",
      "scopes": ["read:products", "read:orders", "write:orders"],
      "rate_limit_rpm": 600
    }
    ```
- **DELETE** `/api/v1/developer/keys/:id` (Revoke API key)

---

### 3. Client App Registry
- **GET** `/api/v1/developer/clients` (List registered applications)
- **POST** `/api/v1/developer/clients` (Register new client app)
  - **Body**:
    ```json
    {
      "app_name": "HM-Q Rider Logistics",
      "client_type": "delivery_mobile_app",
      "platform": "flutter",
      "bundle_id": "com.hmq.rider.app",
      "version": "v2.1.0"
    }
    ```

---

### 4. Webhook Subscriptions & Trigger Engine
- **GET** `/api/v1/developer/webhooks` (List webhooks & delivery logs)
- **POST** `/api/v1/developer/webhooks` (Register target URL for event dispatches)
  - **Body**:
    ```json
    {
      "name": "n8n Order Sync",
      "target_url": "https://n8n.yourdomain.com/webhook/orders",
      "events": ["order.created", "order.delivered", "payment.success"]
    }
    ```
- **POST** `/api/v1/developer/webhooks/:id/test` (Send live HMAC-signed test ping)

---

### 5. Delivery Rider Fleet & Dispatch
- **GET** `/api/v1/delivery/riders` (List all riders, locations & statuses)
- **POST** `/api/v1/delivery/riders` (Register new rider partner)
  - **Body**:
    ```json
    {
      "name": "Rahul Varma",
      "phone": "9847123456",
      "vehicle_type": "bike",
      "vehicle_number": "KL-55-AB-1234",
      "assigned_store_name": "Ajmeeri Restaurant"
    }
    ```
- **PATCH** `/api/v1/delivery/riders/:id/status` (Update duty status: online | offline | busy)

---

### 6. Point of Sale (POS) Cashier Checkout
- **GET** `/api/v1/pos/transactions` (List POS bills and sales)
- **POST** `/api/v1/pos/checkout` (Process in-store checkout)
  - **Body**:
    ```json
    {
      "store_id": "STR-10025",
      "store_name": "Ajmeeri Restaurant",
      "cashier_name": "Counter 1",
      "customer_name": "Walk-in Guest",
      "customer_phone": "9847000000",
      "items": [
        { "product_id": "prod-1", "name": "Chicken Biryani", "price": 180, "quantity": 2, "subtotal": 360 }
      ],
      "payment_method": "upi_qr",
      "discount_amount": 0
    }
    ```

---

### 7. Merchant Subscriptions & SaaS Tiers
- **GET** `/api/v1/subscriptions/plans` (List merchant plans and active store subscriptions)

---

### 8. Reviews Moderation & Ratings
- **GET** `/api/v1/reviews` (List customer feedback & ratings)
- **PATCH** `/api/v1/reviews/:id/status` (Approve / Reject review)
  - **Body**: `{ "status": "approved" }`

---

### 9. Sponsored Advertisements
- **GET** `/api/v1/advertisements` (List active hero and banner campaigns)

---

### 10. Loyalty Rewards
- **GET** `/api/v1/loyalty/rewards` (List available point redemption rewards)
