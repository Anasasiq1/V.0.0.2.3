# 09 - WhatsApp Customer Recognition & Identity Flow

The platform implements an automated WhatsApp customer recognition flow that provides zero-friction access for WhatsApp users while maintaining secure server-side customer identity.

---

## User Flow Overview

```text
WhatsApp Chat Link with ?phone=919633594302
                   |
                   v
Open Website URL in Browser
                   |
                   v
Backend Auto-Recognition Endpoint (/api/customer/recognize)
                   |
        +----------+----------+
        |                     |
     [ Existing ]         [ New / Unregistered ]
        |                     |
        v                     v
"നിങ്ങളുടെ WhatsApp നമ്പർ   Display Phone Input (Enabled)
ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്" Customer enters phone / registers
        |                     |
        v                     v
Customer Authenticated Session Created (customer_token)
                   |
                   v
Checkout Phone Input Locked (Disabled / Read-Only)
                   |
                   v
URL Parameter Purged (?phone= removed)
```

---

## Technical Specifications

### 1. URL Ingestion & Normalization
When a user opens a link formatted by n8n or WhatsApp:
`https://store-wa.hm-q.in/?phone=919633594302`

1. Frontend reads `phone` query parameter.
2. Normalizes phone number (removes non-digits, ensures country code format e.g. `919633594302`).
3. Sends POST request to `/api/customer/recognize`:
   ```json
   { "phone": "919633594302" }
   ```

### 2. Backend Recognition Logic
- Searches `customers` table for matching `whatsapp_number`.
- **If Found**:
  - Updates `last_seen_at` timestamp.
  - Generates secure random session token `cust_tok_<TIMESTAMP>_<RANDOM>`.
  - Sets HTTP-Only cookie `customer_token` and returns token in JSON response.
  - Returns Malayalam success notice: `"നിങ്ങളുടെ WhatsApp നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്."`
- **If Not Found**:
  - Returns `{ "recognized": false }` allowing customer to enter phone number freely.

### 3. URL Parameter Cleanup
To protect user privacy, the URL parameter is cleaned immediately after recognition without triggering a page refresh:
```typescript
const cleanUrl = new URL(window.location.href);
cleanUrl.searchParams.delete('phone');
window.history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search);
```

---

## Checkout Phone Lock Policy

- **Authenticated / Recognized Customer**:
  - Checkout phone input is set to `disabled` and `read-only`.
  - Input field displays customer's verified WhatsApp number.
  - Green security status pill shown: **Registered & Locked**.
  - Customer cannot edit or replace phone number in checkout UI.

- **Server-Side Security Enforcement**:
  - The backend `/api/orders` endpoint ignores any phone number submitted in the payload for authenticated requests and forces `customer_phone` from the server session (`getCustomerSessionFromReq`).
