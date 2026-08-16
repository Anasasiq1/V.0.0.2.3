# WhatsApp Integration & Multi-Provider Setup

HM-Q is designed to be **provider-agnostic**, supporting direct browser WhatsApp deep-linking (`wa.me`) as well as automated backend gateways (Evolution API, Meta Cloud WhatsApp API, WAHA, and Generic HTTP Gateways).

---

## 1. Direct Customer WhatsApp Link (`wa.me`)

Out of the box, HM-Q operates without requiring any paid third-party API subscription. When a customer completes checkout or clicks the WhatsApp support button:
1. HM-Q formats an emoji-rich order bill with product details, delivery slot, address, and total amount.
2. It generates a pre-filled direct WhatsApp link:
   ```
   https://wa.me/<STORE_WHATSAPP_PHONE>?text=<ENCODED_ORDER_TEXT>
   ```
3. On mobile, this launches WhatsApp directly; on desktop, it opens WhatsApp Web.

---

## 2. Customer Phone Recognition & Single-Click Login

HM-Q automatically recognizes customers when they arrive via WhatsApp campaign links:
- **Campaign URL Format**: `https://yourdomain.com/?phone=919876543210` or `https://yourdomain.com/store/ajmeeri-restaurant?phone=919876543210`
- The system recognizes the customer, loads their saved addresses, order history, and auto-fills checkout.

---

## 3. Automated WhatsApp Providers (via n8n or Backend)

For automated order dispatch, OTP verification, and status updates, configure your preferred provider in `n8n/.env` or Admin Panel:

### Provider 1: Evolution API (Self-Hosted / Open Source)
```env
WHATSAPP_PROVIDER=EVOLUTION_API
EVOLUTION_API_BASE_URL=http://evolution_api:8080
EVOLUTION_API_KEY=your_evolution_api_key_secret
EVOLUTION_INSTANCE_NAME=hyperlocal_store
```

### Provider 2: Meta WhatsApp Cloud API (Official)
```env
WHATSAPP_PROVIDER=META_CLOUD_API
META_PHONE_NUMBER_ID=your_phone_number_id
META_ACCESS_TOKEN=your_permanent_system_user_token
```

### Provider 3: WAHA / Generic HTTP Gateway
```env
WHATSAPP_PROVIDER=GENERIC
GENERIC_WA_API_URL=http://waha:3000/api/sendText
```

---

## 4. Phone Number Normalization

HM-Q automatically sanitizes and normalizes phone numbers to standard E.164 international format:
- Strips spaces, dashes, parentheses (`+91 (987) 65-43210` -> `919876543210`).
- Defaults 10-digit numbers to India country code `+91`.
- Defaults 8-digit numbers to Qatar `+974` or handles any custom international prefix provided by the user.
