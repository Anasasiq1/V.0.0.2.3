# Multi-Tenant Data Isolation Architecture

This document describes the tenant isolation architecture ensuring strict data privacy between stores across multiple customer domains.

---

## 1. Domain-to-Tenant Mapping Mechanics

The server resolves tenant identity directly from incoming HTTPS `Host` headers rather than trusting client-submitted parameters:

```typescript
function getTenantStoreId(req: express.Request): string | null {
  const host = (req.headers.host || req.get('host') || '').toLowerCase().split(':')[0];
  if (!host) return null;

  const settings = storeData.settings as any;
  if (Array.isArray(settings?.custom_domains)) {
    const match = settings.custom_domains.find((d: any) => d.domain?.toLowerCase() === host);
    if (match && match.store_id) return match.store_id;
  }

  if (Array.isArray(storeData.stores)) {
    const storeMatch = storeData.stores.find(
      (s: any) =>
        s.custom_domain?.toLowerCase() === host ||
        s.domain?.toLowerCase() === host ||
        s.primary_domain?.toLowerCase() === host
    );
    if (storeMatch) return storeMatch.id;
  }

  return null;
}
```

---

## 2. Server-Side Data Scoping

When a user visits `https://shop1.com/`, the server executes `/api/data`:

1. `getTenantStoreId(req)` extracts `shop1.com` from the `Host` header.
2. The server filters products to returning ONLY items where `product.store_id === 'store-shop1'`.
3. Products belonging to other stores (`store-shop2`, `store-shop3`) are completely filtered out before sending the payload.

```
Incoming Request: Host: shop1.com
       │
       ▼
Tenant Resolver: Store ID = store-shop1
       │
       ▼
Data Filter:
products.filter(p => p.store_id === 'store-shop1')
       │
       ▼
Response: Only Store 1 Catalog Returned
```

---

## 3. Strict Tenant Isolation Rules

1. **Client Isolation:** A customer visiting Store A cannot view or purchase products belonging to Store B.
2. **Order Scoping:** Orders are assigned `store_id` upon creation, ensuring store owners only view their store's sales records.
3. **Admin Scoping:** Admin accounts assigned to a specific store role can only access and edit records within their assigned store context.
4. **Unconfigured Domains:** Requests from unregistered domains default safely to the master storefront or a default template without exposing private configuration data.
