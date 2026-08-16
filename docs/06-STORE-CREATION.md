# 06 - Store Creation & Provisioning Flow

This document explains the store creation workflow operated by the Super Admin.

---

## Store Creation Workflow

```text
Super Admin Panel -> Click "Create Store" Modal -> Enter Details -> Generate STR-10025 Code -> Onboarding Share Link
```

### Step 1: Accessing Store Creation
1. Open Admin Panel.
2. Ensure you are authenticated as **Super Admin**.
3. Navigate to **Stores Management** tab.
4. Click **+ Create New Store**.

### Step 2: Input Parameters
The Super Admin enters the following store attributes:
- **Store Name**: e.g. *Tasty Treats Bakery*
- **Store Slug**: e.g. `tasty-treats` (Auto-formatted for clean URLs)
- **Store Code**: Auto-generated (e.g., `STR-10025`)
- **Category / Theme**: e.g. Bakery & Sweets, Grocery, Meat, Pharmacy
- **Store Owner Name**: e.g. *Anas*
- **Store Owner WhatsApp**: e.g. `919633594302`
- **Store Owner Email**: e.g. `owner@tastytreats.com`
- **Initial Password**: Set temporary store owner password
- **Selected Modules**: Checkboxes for initial modules (e.g. Grocery, Bakery, Meat)

### Step 3: Backend Provisioning (`/api/admin/stores/create`)
The server executes atomic creation:
1. Validates uniqueness of store slug and store code.
2. Creates store entry in `stores` data table with status `ACTIVE`.
3. Provisions assigned modules in `modules` table linked to `store_id`.
4. Creates Store Owner user account in `users` table with `role: "STORE_OWNER"` and full permissions.
5. Writes an audit log entry (`STORE_CREATED`).

### Step 4: WhatsApp Onboarding Link Generation
After creation, the Super Admin modal outputs a ready-to-share WhatsApp onboarding message:

```text
🏬 Store Created Successfully!

Store Name: Tasty Treats Bakery
Store Code: STR-10025
Store URL: https://store-wa.hm-q.in/store/tasty-treats
Owner Login: 919633594302
Initial Password: <SET_PASSWORD>

Share directly on WhatsApp:
https://wa.me/919633594302?text=Welcome%20to%20your%20new%20store!
```
