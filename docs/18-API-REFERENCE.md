# 18 - REST API Reference Manual

This manual documents available backend REST endpoints, authentication methods, payload structures, and error codes.

---

## Endpoint Overview

### 1. System Health
- **GET** `/api/health`
  - **Auth**: Public
  - **Response**:
    ```json
    { "status": "ok", "timestamp": "2026-08-11T12:00:00.000Z" }
    ```

---

### 2. Customer Recognition & Session

#### **POST** `/api/customer/recognize`
- **Auth**: Public
- **Request Body**:
  ```json
  { "phone": "919633594302" }
  ```
- **Response (Recognized)**:
  ```json
  {
    "recognized": true,
    "customer": {
      "customer_id": "cust-919633594302",
      "whatsapp_number": "919633594302",
      "name": "Anas (Verified Customer)",
      "status": "active"
    },
    "token": "cust_tok_17234000_a1b2c3",
    "message": "നിങ്ങളുടെ WhatsApp നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്."
  }
  ```

#### **POST** `/api/customer/register`
- **Auth**: Public
- **Request Body**:
  ```json
  { "phone": "919847000000", "name": "New Customer" }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "customer": {
      "customer_id": "cust-k2j3h4",
      "whatsapp_number": "919847000000",
      "name": "New Customer"
    },
    "token": "cust_tok_..."
  }
  ```

#### **GET** `/api/customer/session`
- **Auth**: Session Cookie or Header `x-customer-token` / `Authorization: Bearer <token>`
- **Response**:
  ```json
  { "authenticated": true, "customer": { "customer_id": "...", "whatsapp_number": "..." } }
  ```

---

### 3. Store Governance (Super Admin)

#### **POST** `/api/admin/stores/create`
- **Auth**: Admin Session
- **Request Body**:
  ```json
  {
    "name": "Tasty Treats Bakery",
    "slug": "tasty-treats",
    "category": "Bakery & Sweets",
    "owner_name": "Anas",
    "owner_phone": "919633594302",
    "owner_email": "owner@tastytreats.com",
    "owner_password": "securepassword123",
    "modules": ["bakery", "grocery"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "store": { "id": "store-tasty-treats", "code": "STR-10025", "status": "ACTIVE" },
    "shareableLink": "https://store-wa.hm-q.in/store/tasty-treats"
  }
  ```

#### **POST** `/api/admin/stores/status`
- **Auth**: Admin Session
- **Request Body**:
  ```json
  { "storeId": "store-tasty-treats", "status": "SUSPENDED" }
  ```

---

### 4. Order Management

#### **POST** `/api/orders`
- **Auth**: Public or Customer Session
- **Request Body**:
  ```json
  {
    "order_id": "ORD-17234",
    "store_id": "store-hyperlocal-tirur",
    "customer_name": "Anas",
    "customer_phone": "919633594302",
    "items": [{ "id": "p-1", "title": "Farm Milk", "price": 50, "qty": 1 }],
    "grand_total": 50
  }
  ```
- **Response**:
  ```json
  { "success": true, "order": { "order_id": "ORD-17234", "status": "pending" } }
  ```

#### **POST** `/api/admin/orders/status`
- **Auth**: Admin / Staff Session
- **Request Body**:
  ```json
  { "orderId": "ORD-17234", "status": "dispatched" }
  ```
