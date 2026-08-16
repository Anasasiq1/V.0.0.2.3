# 07 - Hyperlocal Business Modules

The platform features a modular business layout where each store can enable, disable, and customize specific business modules.

---

## Available Built-In Modules

| Module ID | Module Name | Primary Categories | Default Theme Color |
|-----------|-------------|--------------------|---------------------|
| `grocery` | Supermarket & Grocery | Rice, Oils, Spices, Dairy, Household | Emerald Green (`#059669`) |
| `fresh-meat` | Fresh Meat & Fish | Chicken, Mutton, Fish, Seafood, Marinated | Rose / Red (`#E11D48`) |
| `bakery` | Bakery & Confectionery | Cakes, Fresh Bread, Pastries, Snacks | Amber / Gold (`#D97706`) |
| `pharmacy` | Health & Pharmacy | First Aid, OTC Medicines, Personal Care | Teal (`#0D9488`) |
| `fashion` | Apparel & Fashion | Menswear, Womenswear, Footwear | Indigo (`#4F46E5`) |
| `electronics` | Electronics & Gadgets | Accessories, Mobile, Audio, Chargers | Blue (`#0284C7`) |

---

## Module Control & Customization

### Enabling / Disabling Modules
- **Super Admin**: Can toggle module access globally across stores or per specific store via **Stores Management** > **Manage Modules**.
- **Store Owner**: Can enable/disable assigned modules and reorder display priorities in **Store Settings** > **Module Layout**.

### Reordering Modules
Modules feature a `sort_order` property. Store owners can drag-and-drop or adjust sort numbers to prioritize what customers see first on the store homepage.

### Adding Future Custom Modules
To define a new module in code:
1. Register module definition in `/src/types.ts`:
   ```typescript
   export interface HyperlocalModule {
     id: string;
     store_id: string;
     name: string;
     icon: string;
     description: string;
     is_active: boolean;
     sort_order: number;
   }
   ```
2. Add module default metadata and category mapping in `/src/data/initialData.ts`.
3. Add custom color theme helper in `/src/lib/categoryTheme.ts`.
