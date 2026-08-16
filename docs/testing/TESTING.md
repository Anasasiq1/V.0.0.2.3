# HM-Q Testing & Regression Verification Checklist

## Functional & Technical Verification Protocol

- [x] **TypeScript Typechecking**: Run `npm run lint` (`tsc --noEmit`) to verify zero type or compile errors.
- [x] **Applet Compilation**: Verify build using `compile_applet` tool.
- [x] **Platform Template Switching**:
  - Test activation of `hm-q-modern`.
  - Test activation of `hm-q-classic`.
  - Test atomic rollback to previous platform template.
- [x] **Store Template Isolation**:
  - Customize Store A's template colors, branding, and product card layout.
  - Verify Store B's layout remains completely isolated.
  - Verify global platform template activation does NOT override Store A's specific store template settings.
- [x] **Canonical Component Consolidation**:
  - Single Header handles logo, location, account, cart drawer, and theme toggling.
  - Single ProductCard handles standard grid, horizontal list, low stock alerts, and cart increment/decrement.
  - Single BottomNav handles tab navigation and cart badge.
- [x] **Commerce Engine Integration**:
  - Add items to cart.
  - Open cart drawer / checkout view.
  - Place order and verify WhatsApp integration links.
