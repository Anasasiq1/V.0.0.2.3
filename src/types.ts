export type ModuleSize = 'large' | 'medium' | 'small' | 'banner';

export interface Module {
  id: string;
  name: string;
  description: string;
  time: string;
  icon: string;
  image?: string;
  bgColor: string;
  textColor?: string;
  size: ModuleSize;
  order: number;
  badge?: string;
  enabled?: boolean;
}

export interface Category {
  id: string;
  name: string;
  moduleId: string;
  icon: string;
  image?: string;
  enabled?: boolean;
  order?: number;
  store_id?: string;
  is_demo?: boolean;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface ProductCustomField {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  moduleId: string;
  store_id?: string;
  is_demo?: boolean;
  price: number;
  oldPrice?: number;
  rating: number;
  deliveryTime: string;
  image: string;
  description: string;
  variants?: ProductVariant[];
  available: boolean;
  enabled?: boolean;
  stock?: number;
  stock_alert_threshold?: number;
  customFields?: ProductCustomField[];
  cart_interest_count?: number;
  requires_prescription?: boolean;
  order?: number;
  // Market extensions
  is_market?: boolean;
  market_category_id?: string;
  is_deal_of_the_day?: boolean;
  is_trending?: boolean;
  brand?: string;
  discount_percent?: number;
  free_delivery?: boolean;
  badge?: string;
  rating_count?: number;
}

export interface MarketCategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  order?: number;
  enabled: boolean;
  tag?: string; // 'Your Vibe' | 'Popular' | 'Hot'
}

export interface MarketBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  btn_text?: string;
  link_category_id?: string;
  link_product_id?: string;
  badge?: string;
  order?: number;
  enabled: boolean;
}

export interface MarketSettings {
  currency_symbol?: string; // e.g. '₹' or 'QAR'
  show_deals_of_day?: boolean;
  show_trending?: boolean;
  show_your_vibe?: boolean;
  show_brand_showcases?: boolean;
  custom_hero_title?: string;
}

export interface ItemPrescription {
  fileName: string;
  fileData?: string;
  fileType?: string;
}

export type OrderStatus = 'Order Placed' | 'Preparing' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface DeliverySlot {
  id: string;
  time: string;
  label: string;
  fee: number;
  isFree: boolean;
  isActive: boolean;
  order?: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  linkModuleId?: string;
  active?: boolean;
  btnText?: string;
  bgGradient?: string;
  icon?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  category: string;
  variantName?: string;
  prescription?: ItemPrescription;
}

export interface Order {
  order_id: string;
  customer_id?: string;
  customer_phone: string;
  customer_name?: string;
  store_id?: string;
  store_name?: string;
  items: OrderItem[];
  total_amount: number;
  delivery_type?: 'scheduled' | 'urgent';
  delivery_slot_time?: string;
  delivery_fee?: number;
  notes: string;
  order_time: string;
  status: OrderStatus;
  is_food_order?: boolean;
  payment_method?: 'cod' | 'upi_online' | 'wallet';
  payment_status?: 'Pending' | 'Paid (COD)' | 'Paid (UPI Verified)' | 'Paid (Wallet)' | 'Failed';
  payment_transaction_id?: string;
  webhook_status?: 'success' | 'failed' | 'skipped' | 'pending';
  webhook_retry_count?: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  image: string;
  qty: number;
  categoryId: string;
  prescription?: ItemPrescription;
}

export interface Customer {
  customer_id: string;
  whatsapp_number: string;
  whatsapp_id?: string;
  name?: string;
  email?: string;
  address?: string;
  saved_addresses?: string[];
  registered_at: string;
  last_seen_at: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface BottomNavItem {
  id: string; // 'home' | 'categories' | 'market' | 'royal_club' | 'account' | 'stores' | 'modules' | 'cart' | 'wishlist' | 'orders' | 'wallet'
  label: string;
  icon: string;
  enabled: boolean;
  order: number;
  badge?: string;
  action?: string;
  is_custom?: boolean;
}

export interface ProfileCustomMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  linkTab?: string;
  action?: string;
  url?: string;
  badge?: string;
  enabled: boolean;
  order?: number;
}

export interface ProfileSettings {
  enable_royal_club?: boolean;
  enable_vouchers?: boolean;
  enable_get_help?: boolean;
  enable_free_delivery_banner?: boolean;
  enable_orders?: boolean;
  enable_tickets?: boolean;
  enable_esim?: boolean;
  enable_tamwin?: boolean;
  enable_country_selector?: boolean;
  enable_wallet?: boolean;
  enable_addresses?: boolean;
  enable_settings?: boolean;
  enable_theme_toggle?: boolean;
  enable_app_version?: boolean;
  support_whatsapp_number?: string;
  support_message?: string;
  custom_menu_items?: ProfileCustomMenuItem[];
}

export interface RoyalClubPerk {
  id: string;
  title: string;
  desc: string;
  icon: string;
  enabled: boolean;
}

export interface RoyalClubSettings {
  enabled?: boolean;
  monthly_price?: number;
  yearly_price?: number;
  currency?: string;
  enable_free_trial?: boolean;
  trial_days?: number;
  hero_title?: string;
  hero_subtitle?: string;
  badge_text?: string;
  perks?: RoyalClubPerk[];
  vip_members?: string[];
}

export interface StoreSettings {
  n8n_webhook_url: string;
  n8n_webhook_enabled?: boolean;
  n8n_host?: string;
  n8n_port?: number | string;
  n8n_protocol?: 'http' | 'https';
  n8n_encryption_key?: string;
  n8n_webhook_secret?: string;
  n8n_last_test_status?: string;
  n8n_last_test_time?: string;
  store_name: string;
  delivery_address: string;
  admin_pin: string;
  admin_username?: string;
  admin_password?: string;
  jwt_secret?: string;
  admin_login_banner?: string;
  admin_banner_title?: string;
  admin_banner_subtitle?: string;
  admin_logo?: string;
  express_delivery_fee?: number;
  delivery_slots?: DeliverySlot[];
  pwa_enabled?: boolean;
  pwa_name?: string;
  pwa_short_name?: string;
  pwa_description?: string;
  pwa_icon?: string;
  pwa_theme_color?: string;
  pwa_bg_color?: string;
  pwa_display_mode?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  send_to_customer_whatsapp?: boolean;
  whatsapp_support_enabled?: boolean;
  whatsapp_mode?: 'n8n_api' | 'direct' | 'both' | 'customer_only' | 'store_only';
  customer_wa_auto_open?: boolean;
  store_whatsapp_phone?: string;
  super_admin_whatsapp_phone?: string;
  cod_enabled?: boolean;
  upi_enabled?: boolean;
  wallet_enabled?: boolean;
  wallet_demo_balance?: number;
  upi_id?: string;
  upi_phone?: string;
  upi_payee_name?: string;
  upi_qr_image?: string;
  bottom_nav_items?: BottomNavItem[];
  profile_settings?: ProfileSettings;
  royal_club_settings?: RoyalClubSettings;
}

export type UserRole = 'super_admin' | 'store_owner' | 'manager' | 'staff' | 'admin';

export interface GranularPermissions {
  products_view: boolean;
  products_create: boolean;
  products_edit: boolean;
  products_delete: boolean;
  categories_view: boolean;
  categories_create: boolean;
  categories_edit: boolean;
  categories_delete: boolean;
  orders_view: boolean;
  orders_create: boolean;
  orders_update: boolean;
  orders_cancel: boolean;
  customers_view: boolean;
  customers_edit: boolean;
  staff_view: boolean;
  staff_create: boolean;
  staff_edit: boolean;
  staff_delete: boolean;
  reports_view: boolean;
  settings_view: boolean;
  settings_edit: boolean;
  whatsapp_manage: boolean;
  modules_manage: boolean;
  users_manage: boolean;
}

export interface RolePermissions extends Partial<GranularPermissions> {
  manage_products?: boolean;
  manage_categories?: boolean;
  manage_modules?: boolean;
  manage_orders?: boolean;
  manage_delivery_slots?: boolean;
  manage_payment_settings?: boolean;
  manage_pwa?: boolean;
  manage_staff_roles?: boolean;
  view_analytics?: boolean;
}

export interface AdminUser {
  id: string;
  store_id?: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  role: UserRole;
  phone?: string;
  whatsapp_phone?: string;
  permissions: GranularPermissions | RolePermissions;
  active: boolean;
  created_at?: string;
}

export type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface PendingStoreChange {
  id: string;
  store_id: string;
  store_name: string;
  requested_at: string;
  requested_by: string;
  changes: {
    whatsapp_phone?: string;
    phone?: string;
    upi_id?: string;
    name?: string;
    address?: string;
  };
  old_values: {
    whatsapp_phone?: string;
    phone?: string;
    upi_id?: string;
    name?: string;
    address?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface VendorStore {
  id: string; // e.g. STR-10025
  store_code?: string; // e.g. STR-10025
  name: string; // e.g. ABC Supermarket
  slug: string; // e.g. abc-supermarket
  category?: string;
  owner_name: string;
  phone: string;
  whatsapp_phone: string;
  email?: string;
  address: string;
  logo?: string;
  username: string;
  password?: string;
  status: StoreStatus;
  active: boolean;
  modules: string[]; // List of active module IDs, e.g. ['mod-grocery', 'mod-meat']
  registered_at: string;
  owner_user_id?: string;
  settings?: Partial<StoreSettings>;
  pending_changes?: PendingStoreChange | null;
}

export interface AuditLog {
  id: string;
  store_id?: string;
  store_name?: string;
  user_id?: string;
  user_name?: string;
  action: string;
  details?: string;
  timestamp: string;
  ip?: string;
}

// --- TEMPLATE ENGINE TYPES ---
export interface PlatformTemplateManifest {
  id: string;
  name: string;
  version: string;
  engineVersion: string;
  author: string;
  description: string;
  type: 'platform';
  responsive: boolean;
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  previewImage?: string;
  tags?: string[];
}

export type PlatformTemplateStatus = 'Active' | 'Installed' | 'Draft' | 'Archived';

export interface PlatformTemplate {
  id: string;
  manifest: PlatformTemplateManifest;
  status: PlatformTemplateStatus;
  config?: Record<string, any>;
  installed_at: string;
  updated_at: string;
}

export interface PlatformTemplateSettings {
  active_template_id: string;
  previous_template_id?: string | null;
  updated_by: string;
  updated_at: string;
}

export interface TemplateAuditLog {
  id: string;
  action: string; // 'TEMPLATE_ACTIVATED' | 'TEMPLATE_IMPORTED' | 'TEMPLATE_ROLLEDBACK' | 'TEMPLATE_DELETED'
  template_id: string;
  template_name: string;
  previous_template_id?: string | null;
  admin: string;
  timestamp: string;
  details?: string;
}

// --- STORE TEMPLATE TYPES ---
export type StoreTemplateType = 'default-store' | 'grocery' | 'fashion' | 'restaurant' | 'electronics' | 'minimalist';

export interface StoreTemplateConfig {
  id: string;
  store_id: string;
  template_id: StoreTemplateType;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  productCardStyle: 'grid' | 'list' | 'compact' | 'feature';
  showCategoriesBar: boolean;
  showStoreHours: boolean;
  customCSS?: string;
  status: 'published' | 'draft';
  version: string;
  published_at?: string;
  updated_at: string;
}

export interface StoreTemplateInfo {
  id: StoreTemplateType;
  name: string;
  description: string;
  category: string;
  defaultColors: { primary: string; secondary: string };
  previewImage?: string;
}

// --- ENTERPRISE COMMERCE OS EXTENSIONS ---

export type ApiKeyEnvironment = 'production' | 'test';
export type ApiKeyScope =
  | 'read:products'
  | 'write:products'
  | 'read:categories'
  | 'write:categories'
  | 'read:orders'
  | 'write:orders'
  | 'read:stores'
  | 'write:stores'
  | 'read:customers'
  | 'write:customers'
  | 'read:analytics'
  | 'delivery:manage'
  | 'pos:manage'
  | 'webhooks:manage'
  | 'admin:all';

export interface ApiKey {
  id: string;
  name: string;
  client_name: string;
  key_prefix: string; // e.g. hmq_live_...
  secret_hash?: string;
  environment: ApiKeyEnvironment;
  scopes: ApiKeyScope[];
  status: 'active' | 'revoked' | 'expired';
  rate_limit_rpm: number; // Requests per minute
  ip_whitelist?: string[];
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  total_requests: number;
}

export type AppClientType = 'customer_mobile_app' | 'vendor_mobile_app' | 'delivery_mobile_app' | 'web_store' | 'pos_terminal' | 'third_party_saas';

export interface ApiClientApp {
  id: string;
  app_name: string;
  client_type: AppClientType;
  platform: 'ios' | 'android' | 'flutter' | 'react_native' | 'web' | 'node';
  bundle_id?: string;
  version: string;
  status: 'active' | 'inactive' | 'development';
  created_at: string;
  assigned_store_id?: string; // Optional store binding
  allowed_origins?: string[];
  webhook_url?: string;
}

export type WebhookEvent = 
  | 'order.created'
  | 'order.accepted'
  | 'order.ready'
  | 'order.assigned'
  | 'order.picked_up'
  | 'order.delivered'
  | 'order.cancelled'
  | 'product.created'
  | 'product.updated'
  | 'store.created'
  | 'store.updated'
  | 'customer.registered'
  | 'payment.success'
  | 'delivery.status_changed';

export interface WebhookSubscription {
  id: string;
  name: string;
  target_url: string;
  events: WebhookEvent[];
  signing_secret: string;
  is_active: boolean;
  retry_count: number;
  created_at: string;
  last_triggered_at?: string;
  last_status_code?: number;
  total_deliveries: number;
  failed_deliveries: number;
}

export interface WebhookDeliveryLog {
  id: string;
  subscription_id: string;
  event: WebhookEvent;
  payload: any;
  status_code: number;
  response_time_ms: number;
  timestamp: string;
  status: 'success' | 'failed' | 'retrying';
  error_message?: string;
  attempts: number;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp_phone?: string;
  vehicle_type: 'bike' | 'scooter' | 'van' | 'bicycle' | 'electric_scooter';
  vehicle_number?: string;
  status: 'online' | 'offline' | 'busy' | 'suspended';
  assigned_store_id?: string; // If dedicated to a store, or null if platform-wide pool
  assigned_store_name?: string;
  current_location?: {
    lat: number;
    lng: number;
    address_name: string;
    updated_at: string;
  };
  rating: number;
  total_deliveries: number;
  today_deliveries: number;
  pending_orders: string[]; // Order IDs currently being delivered
  wallet_balance: number;
  cash_in_hand: number;
  registered_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_products: number;
  max_orders_per_month: number;
  commission_rate_percent: number;
  features: string[];
  is_popular?: boolean;
  enabled: boolean;
}

export interface StoreSubscription {
  id: string;
  store_id: string;
  store_name: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

export interface Advertisement {
  id: string;
  title: string;
  store_id?: string;
  store_name?: string;
  banner_image: string;
  target_type: 'store' | 'product' | 'category' | 'external_url';
  target_id?: string;
  target_url?: string;
  placement: 'home_hero' | 'category_top' | 'market_deal' | 'checkout_footer';
  priority: number;
  start_date: string;
  end_date: string;
  impressions_count: number;
  clicks_count: number;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
}

export interface Review {
  id: string;
  entity_type: 'product' | 'store';
  entity_id: string;
  entity_name: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  rating: number; // 1 to 5
  comment: string;
  verified_purchase: boolean;
  images?: string[];
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  merchant_reply?: {
    comment: string;
    replied_at: string;
  };
}

export interface PosProductItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_name?: string;
  barcode?: string;
  subtotal: number;
}

export interface PosTransaction {
  id: string;
  bill_number: string;
  store_id: string;
  store_name: string;
  cashier_name: string;
  customer_name?: string;
  customer_phone?: string;
  items: PosProductItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'upi_qr' | 'card' | 'split';
  payment_status: 'paid' | 'pending' | 'refunded';
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  points_required: number;
  discount_amount: number;
  coupon_code: string;
  min_order_value: number;
  icon?: string;
  is_active: boolean;
}

export interface PlatformShowcaseSettings {
  show_landing_hero: boolean;
  platform_tagline: string;
  hero_headline: string;
  hero_subheadline: string;
  enable_quick_app_switcher: boolean;
  supported_sectors: string[];
}

export interface AppData {
  modules: Module[];
  categories: Category[];
  products: Product[];
  banners: PromoBanner[];
  orders: Order[];
  users?: AdminUser[];
  customers?: Customer[];
  stores?: VendorStore[];
  settings: StoreSettings;
  audit_logs?: AuditLog[];
  platform_templates?: PlatformTemplate[];
  platform_template_settings?: PlatformTemplateSettings;
  template_audit_logs?: TemplateAuditLog[];
  store_templates?: StoreTemplateConfig[];
  market_categories?: MarketCategory[];
  market_banners?: MarketBanner[];
  market_settings?: MarketSettings;
  // Commerce OS Extensions
  api_keys?: ApiKey[];
  api_clients?: ApiClientApp[];
  webhook_subscriptions?: WebhookSubscription[];
  webhook_logs?: WebhookDeliveryLog[];
  delivery_riders?: DeliveryBoy[];
  subscription_plans?: SubscriptionPlan[];
  store_subscriptions?: StoreSubscription[];
  advertisements?: Advertisement[];
  reviews?: Review[];
  pos_transactions?: PosTransaction[];
  loyalty_rewards?: LoyaltyReward[];
  platform_showcase?: PlatformShowcaseSettings;
}

