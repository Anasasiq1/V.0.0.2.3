# 16 - Security & Hardening Specifications

This document defines platform security features, session protections, RBAC verification, input sanitization, and API security policies.

---

## Security Features Matrix

### 1. Server-Enforced Customer Identity
- **Checkout Lock**: The server validates `customer_token` HTTP cookies or headers.
- Customer phone numbers submitted in request body payloads are **ignored** for authenticated sessions; the server overrides `customer_phone` from the authenticated session database.

### 2. Admin & Staff Session Tokens
- Auth tokens (`admin_tok_...`) are cryptographically generated on server login.
- Store isolation middleware (`req.headers.authorization` / session checking) prevents cross-store data leakage.

### 3. Password Hashing & Credentials
- Passwords are encrypted before storage.
- Default passwords should be updated upon first setup.

### 4. Input Sanitization & Parameter Normalization
- Phone numbers are sanitized to remove non-digit characters (`replace(/\D/g, '')`) and prepended with country code (`91`) to prevent injection.

### 5. HTTP & Cookie Security Headers
- `Set-Cookie: customer_token=...; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
- Prevents cross-site script access to customer session tokens.

### 6. Audit Trail Logging
- Critical operations (`STORE_CREATED`, `STATUS_UPDATED`, `MODULE_UPDATED`, `STAFF_MODIFIED`, `DATA_RESTORED`) record timestamped log entries in `audit_logs`.
