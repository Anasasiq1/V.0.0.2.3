# 20 - System Evolution & Version History

---

## [v3.5.0] - 2026-08-11

### Added
- **WhatsApp Customer Auto-Recognition (`/api/customer/recognize`)**: Immediate customer recognition from `?phone=...` URLs with automated session generation.
- **Server-Enforced Checkout Phone Lock**: Checkout phone field is locked (`disabled` / `read-only`) for recognized customers. Backend enforces identity from server session token (`customer_token`).
- **Malayalam Toast Notifications**: Added Malayalam banner toast: `"നിങ്ങളുടെ WhatsApp നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്."`
- **URL Sanitation**: Automatic removal of `?phone=` query parameter from address bar using HTML5 `history.replaceState`.
- **Super Admin Multi-Store Provisioning**: `StoreCreationModal` with auto-generated Store Codes (`STR-10025`), slug generation, module assignments, and WhatsApp onboarding link builder.
- **Store Status Governance**: Operational status switching (`ACTIVE`, `SUSPENDED`, `ARCHIVED`) with customer maintenance page.
- **Centralized Multi-Store Isolation**: Removed multi-domain hostname dependency in favor of unified platform routing (`/store/:slug`).
- **Comprehensive Production Documentation**: Created 20 modular documentation guides in `/docs/`.

### Security Hardening
- Server-side override of customer phone in order submission.
- HTTP-Only `customer_token` session cookie policy.
- Role-Based Access Control (RBAC) permission boundaries across API endpoints.
