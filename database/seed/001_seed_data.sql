-- =========================================================
-- DATABASE SEED DATA FOR HM-Q HYPERLOCAL ECOSYSTEM
-- =========================================================

-- Seed Default Platform Templates
INSERT INTO platform_templates (id, name, version, engine_version, author, description, type, status, manifest_json)
VALUES 
('hm-q-modern', 'HM-Q Modern Experience', '3.3.0', '1.0.0', 'HM-Q Core', 'Default modern platform template with location-aware header, horizontal pills, category modules and bottom nav.', 'platform', 'Active', '{"id":"hm-q-modern","name":"HM-Q Modern Experience","version":"3.3.0","type":"platform"}'),
('hm-q-classic', 'HM-Q Classic Lightweight', '1.0.0', '1.0.0', 'HM-Q Core', 'Ultra-fast, compact platform template designed for high performance and low connectivity.', 'platform', 'Installed', '{"id":"hm-q-classic","name":"HM-Q Classic Lightweight","version":"1.0.0","type":"platform"}')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Platform Settings
INSERT INTO platform_template_settings (id, active_template_id, previous_template_id, updated_by)
VALUES (1, 'hm-q-modern', NULL, 'superadmin')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Modules
INSERT INTO modules (id, name, description, time, icon, order_index) VALUES
('mod-grocery', 'Grocery', 'Fresh, daily & trusted essentials', '20-30 min', '🥦', 1),
('mod-pharmacy', 'Pharmacy', 'All Types Medicine & Healthcare', '30-40 min', '💊', 2),
('mod-shop', 'Shop', 'Everything You Need', '20-30 min', '🛍️', 3),
('mod-food', 'Food', 'Explore our foods', '30-45 min', '🍔', 4)
ON CONFLICT (id) DO NOTHING;
