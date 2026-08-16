# 11 - Order Lifecycle & Checkout System

This document details the order creation, cart state management, checkout verification, and store fulfillment workflow.

---

## Order Lifecycle States

```text
[ CART CHECKOUT ] -> [ PENDING ] -> [ ACCEPTED ] -> [ DISPATCHED ] -> [ DELIVERED ]
                         |
                         +--------> [ CANCELLED ]
```

| Order Status | Description | Triggered By |
|--------------|-------------|--------------|
| `pending` | Order submitted by customer, awaiting store review. | Customer placing order |
| `accepted` | Store staff accepts and begins preparing items. | Store Staff / Vendor Panel |
| `dispatched` | Order handed to delivery partner or out for delivery. | Store Staff / Dispatch |
| `delivered` | Order successfully handed to customer. | Store Staff / Delivery Driver |
| `cancelled` | Order rejected or cancelled due to out-of-stock items. | Store Staff / Customer |

---

## Order Placement & Server Validation

### Step 1: Cart Items Selection
- Products are added to client-side cart (`localStorage` persistent).
- Supports module filter, quantity adjustments, and special delivery notes.

### Step 2: Checkout Validation (`CheckoutView.tsx`)
- Checks if customer is logged in / recognized via WhatsApp session.
- If recognized: phone input is read-only (`+91 9633594302`).
- If unrecognized: phone input is enabled; auto-registers customer on submit.

### Step 3: API Request (`POST /api/orders`)
```json
{
  "order_id": "ORD-17234",
  "store_id": "store-hyperlocal-tirur",
  "customer_name": "Anas",
  "customer_phone": "919633594302",
  "items": [
    { "id": "p-1", "title": "Fresh Farm Milk 1L", "price": 50, "qty": 2 },
    { "id": "p-2", "title": "Premium Whole Wheat Bread", "price": 45, "qty": 1 }
  ],
  "grand_total": 145,
  "delivery_address": "WVRW+J7M, Tirur, Kerala",
  "payment_method": "COD",
  "created_at": "2026-08-11T12:00:00Z"
}
```

### Step 4: Backend Enforcement & Database Write
1. Server checks `customer_token` header or cookie.
2. If customer session exists, server replaces payload phone with session's authenticated phone.
3. Order is appended to `orders` array in `/data/store_data.json` and optionally saved to MySQL.
4. Returns `{ "success": true, "order": newOrder }`.
5. Direct WhatsApp order dispatch receipt generated for store & customer.
