# Payment & UPI Integration Guide

HM-Q provides frictionless, zero-fee direct merchant payment handling via Unified Payments Interface (UPI), Dynamic QR Codes, and deep-link routing for all major payment apps.

---

## 1. Supported Payment Modes

1. **UPI Instant Pay (Direct App Launch)**:
   - Google Pay (GPay)
   - PhonePe
   - Paytm
   - BHIM UPI / CRED / Any installed UPI App
2. **Dynamic UPI QR Code**: Real-time generated QR code with exact amount and merchant VPA for desktop/laptop customers.
3. **Cash on Delivery (COD)**: Configurable per store or platform-wide.
4. **Custom Payment Gateways**: Razorpay, Stripe, or Cashfree hooks.

---

## 2. Setting Up Store / Platform UPI Details

### Super Admin (Platform-Wide Default UPI)
1. Open Super Admin Panel -> **Payment Settings**.
2. Set **Platform UPI ID** (e.g. `merchant@okhdfcbank`).
3. Set **Payee Name** (e.g. `HM-Q Store Network`).
4. Toggle UPI / COD payment methods.

### Store Owners / Merchants (Store-Specific UPI)
1. Store Owners can set their own dedicated UPI ID in the **Store Panel -> Store Settings**.
2. When a customer orders from that store, the payment is directly routed to the store owner's bank account with zero intermediate commission deductions.

---

## 3. UPI Intent URI Specification

HM-Q dynamically generates standard NPCI compliant UPI URIs:

```
upi://pay?pa=<MERCHANT_UPI_ID>&pn=<PAYEE_NAME>&am=<ORDER_AMOUNT>&cu=INR&tn=Order_<ORDER_ID>
```

- **`pa`**: Merchant Virtual Payment Address (e.g. `storename@okicici`)
- **`pn`**: Payee / Merchant Business Name
- **`am`**: Exact order total amount (including delivery fees & discounts)
- **`cu`**: Currency code (`INR`)
- **`tn`**: Transaction reference note (`Order #ORD-12345`)

---

## 4. Mobile Checkout Flow & App Launching

On mobile devices, when the user clicks **"Pay ₹... with UPI"**:
1. The app invokes `upiCheckoutHandler.ts`.
2. The browser triggers the native Android / iOS intent chooser for GPay, PhonePe, and Paytm.
3. Once completed, the order is confirmed and the invoice is dispatched via WhatsApp.
