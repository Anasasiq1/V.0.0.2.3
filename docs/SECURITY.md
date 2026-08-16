# Security Architecture & OWASP Compliance Standards

This document outlines the security architecture, OWASP alignment, and access safeguards implemented in the Hyperlocal Commerce Platform.

---

## 1. OWASP Top-10 Compliance Matrix

| OWASP Vulnerability Category | Mitigation Strategy Implemented |
| :--- | :--- |
| **A01: Broken Access Control** | Every state-changing endpoint (`/api/data`, `/api/backup`, `/api/restore`, `/api/settings`) verifies active server-side admin sessions via `requireAdminAuth`. Client query parameter overrides (`?admin=true`) are completely disabled. |
| **A02: Cryptographic Failures** | Admin session tokens are generated using server-side timestamps and cryptographically random strings. Passwords and credentials are wiped from public API responses (`/api/data`). |
| **A03: Injection** | Parametric database queries are used for SQL operations. Local JSON writes use strict typed object mapping. |
| **A04: Insecure Design** | Complete logical separation between public customer storefront (`/`) and administrative management (`/superadmin.php`). |
| **A05: Security Misconfiguration** | Session cookies utilize `HttpOnly` and `SameSite=Lax` parameters to prevent client-side script hijacking. |
| **A07: Identification & Auth Failures** | Dedicated server-side session store (`activeSessions` map) with automatic 24-hour expiration and instant server-side revocation on logout (`POST /api/admin/logout`). |
| **A08: Software and Data Integrity** | Application state snapshots are validated prior to JSON restoration. |

---

## 2. API Data Sanitization

To ensure administrative credentials and staff user details are never leaked to public customers:

```typescript
if (!session) {
  const sanitizedSettings = { ...dataToReturn.settings };
  delete (sanitizedSettings as any).admin_password;
  delete (sanitizedSettings as any).admin_pin;
  delete (sanitizedSettings as any).admin_username;

  const sanitizedUsers = (dataToReturn.users || []).map((u) => {
    const { password, ...rest } = u;
    return rest;
  });

  dataToReturn = {
    ...dataToReturn,
    settings: sanitizedSettings as StoreSettings,
    users: sanitizedUsers as any,
  };
}
```

---

## 3. Cookie & Session Security Standards

- **Cookie Name:** `admin_token`
- **Flags:** `HttpOnly`, `SameSite=Lax`, `Max-Age=86400`
- **Server Verification:** Tokens checked via `HttpOnly` cookie or `Authorization: Bearer <token>` / `x-admin-token` headers.
- **Session Cleanup:** Invalidated tokens are immediately deleted from server memory.

---

## 4. Security Hardening Checklist for Server Operators

1. Enforce HTTPS across all domains using Let's Encrypt / Certbot.
2. Ensure `.env` and `data_store.json` files have strict file permissions (`600` or `664`).
3. Set up firewall rules (UFW / Cloudflare) to only allow ports `80` and `443`.
4. Never check real passwords or API keys into git repositories.
