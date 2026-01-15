-- ============================================
-- PRICE MONITOR SEED DATA
-- Realistic test data for Timor-Leste market
-- ============================================

-- ============================================
-- CENTRAL SECTOR - FOOD DISTRIBUTION
-- ============================================

-- Products: Food Distribution
INSERT INTO public.products (name, category, unit, sector) VALUES
-- Grains & Rice
('Rice Local 5kg', 'Grains', 'bag', 'Central'),
('Rice Local 25kg', 'Grains', 'bag', 'Central'),
('Rice Thai Jasmine 5kg', 'Grains', 'bag', 'Central'),
('Rice Thai Jasmine 25kg', 'Grains', 'bag', 'Central'),
('Wheat Flour 1kg', 'Grains', 'bag', 'Central'),
('Wheat Flour 25kg', 'Grains', 'bag', 'Central'),

-- Cooking Essentials
('Cooking Oil 1L', 'Cooking Essentials', 'liter', 'Central'),
('Cooking Oil 5L', 'Cooking Essentials', 'liter', 'Central'),
('Palm Oil 1L', 'Cooking Essentials', 'liter', 'Central'),
('Sugar White 1kg', 'Cooking Essentials', 'kg', 'Central'),
('Sugar White 50kg', 'Cooking Essentials', 'bag', 'Central'),
('Salt Fine 500g', 'Cooking Essentials', 'piece', 'Central'),
('Salt Fine 25kg', 'Cooking Essentials', 'bag', 'Central'),

-- Canned Goods
('Canned Tuna 185g', 'Canned Goods', 'piece', 'Central'),
('Canned Sardines 155g', 'Canned Goods', 'piece', 'Central'),
('Canned Corned Beef 340g', 'Canned Goods', 'piece', 'Central'),
('Condensed Milk 390g', 'Canned Goods', 'piece', 'Central'),
('Evaporated Milk 400ml', 'Canned Goods', 'piece', 'Central'),

-- Noodles & Instant Food
('Instant Noodles Pack', 'Instant Food', 'piece', 'Central'),
('Instant Noodles Box (40pcs)', 'Instant Food', 'piece', 'Central'),
('Vermicelli 400g', 'Instant Food', 'piece', 'Central'),

-- Beverages
('Mineral Water 600ml', 'Beverages', 'piece', 'Central'),
('Mineral Water 19L Gallon', 'Beverages', 'piece', 'Central'),
('Soft Drink 330ml Can', 'Beverages', 'piece', 'Central'),
('Soft Drink 1.5L Bottle', 'Beverages', 'piece', 'Central'),
('Coffee Instant 200g', 'Beverages', 'piece', 'Central'),

-- Snacks
('Biscuits Assorted 400g', 'Snacks', 'piece', 'Central'),
('Crackers Cream 300g', 'Snacks', 'piece', 'Central');

-- Clients: Food Distribution (Supermarkets, Hotels, Restaurants)
INSERT INTO public.clients (name, location, contact_phone, sector) VALUES
('Timor Plaza Supermarket', 'Dili, Comoro', '+670 7723 1001', 'Central'),
('Lita Store', 'Dili, Audian', '+670 7723 1002', 'Central'),
('Leader Supermarket', 'Dili, Caicoli', '+670 7723 1003', 'Central'),
('Pateo Supermarket', 'Dili, Bidau', '+670 7723 1004', 'Central'),
('Kmanek Supermarket', 'Dili, Comoro', '+670 7723 1005', 'Central'),
('Hotel Timor', 'Dili, Centro', '+670 7723 2001', 'Central'),
('Hotel Ramelau', 'Dili, Farol', '+670 7723 2002', 'Central'),
('Novo Turismo Hotel', 'Dili, Lecidere', '+670 7723 2003', 'Central'),
('Discovery Inn', 'Dili, Comoro', '+670 7723 2004', 'Central'),
('Casa Restaurant', 'Dili, Centro', '+670 7723 3001', 'Central'),
('Agora Restaurant', 'Dili, Farol', '+670 7723 3002', 'Central'),
('Dilicious Cafe', 'Dili, Tasi Tolu', '+670 7723 3003', 'Central'),
('Mini Market Becora', 'Dili, Becora', '+670 7723 4001', 'Central'),
('Warung Baucau', 'Baucau, Centro', '+670 7724 1001', 'Central'),
('Loja Maliana', 'Maliana, Centro', '+670 7725 1001', 'Central');

-- Competitors: Food Distribution
INSERT INTO public.competitors (name, location, sector) VALUES
('PT Mega Distributor', 'Dili, Comoro', 'Central'),
('Timor Global Trading', 'Dili, Bidau', 'Central'),
('Asia Food Supply', 'Dili, Becora', 'Central'),
('Dili Wholesale', 'Dili, Audian', 'Central'),
('East Timor Import Co', 'Dili, Caicoli', 'Central'),
('Premium Foods TL', 'Dili, Farol', 'Central'),
('Quick Supply Dili', 'Dili, Comoro', 'Central');

-- ============================================
-- ENSUL SECTOR - CONSTRUCTION MATERIALS
-- ============================================

-- Products: Construction Materials
INSERT INTO public.products (name, category, unit, sector) VALUES
-- Cement & Concrete
('Cement Tonasa 40kg', 'Cement', 'bag', 'Ensul'),
('Cement Tiga Roda 40kg', 'Cement', 'bag', 'Ensul'),
('Cement Holcim 40kg', 'Cement', 'bag', 'Ensul'),
('Ready Mix Concrete m3', 'Cement', 'meter', 'Ensul'),

-- Steel & Metal
('Steel Rebar 10mm (12m)', 'Steel', 'piece', 'Ensul'),
('Steel Rebar 12mm (12m)', 'Steel', 'piece', 'Ensul'),
('Steel Rebar 16mm (12m)', 'Steel', 'piece', 'Ensul'),
('Binding Wire 1kg', 'Steel', 'kg', 'Ensul'),
('Steel Mesh 2.4x6m', 'Steel', 'sheet', 'Ensul'),
('Galvanized Pipe 1 inch', 'Steel', 'meter', 'Ensul'),
('Galvanized Pipe 2 inch', 'Steel', 'meter', 'Ensul'),

-- Aggregates
('Sand River m3', 'Aggregates', 'meter', 'Ensul'),
('Sand Sea m3', 'Aggregates', 'meter', 'Ensul'),
('Gravel 1-2cm m3', 'Aggregates', 'meter', 'Ensul'),
('Gravel 2-3cm m3', 'Aggregates', 'meter', 'Ensul'),
('Crushed Stone m3', 'Aggregates', 'meter', 'Ensul'),

-- Roofing
('Zinc Roofing Sheet 3m', 'Roofing', 'sheet', 'Ensul'),
('Zinc Roofing Sheet 4m', 'Roofing', 'sheet', 'Ensul'),
('Zinc Roofing Sheet 5m', 'Roofing', 'sheet', 'Ensul'),
('Roof Tile Clay', 'Roofing', 'piece', 'Ensul'),
('Roof Ridge Cap', 'Roofing', 'piece', 'Ensul'),

-- Plumbing
('PVC Pipe 1/2 inch (4m)', 'Plumbing', 'piece', 'Ensul'),
('PVC Pipe 3/4 inch (4m)', 'Plumbing', 'piece', 'Ensul'),
('PVC Pipe 1 inch (4m)', 'Plumbing', 'piece', 'Ensul'),
('PVC Pipe 2 inch (4m)', 'Plumbing', 'piece', 'Ensul'),
('PVC Pipe 4 inch (4m)', 'Plumbing', 'piece', 'Ensul'),
('PVC Elbow 1 inch', 'Plumbing', 'piece', 'Ensul'),
('PVC Tee 1 inch', 'Plumbing', 'piece', 'Ensul'),
('Water Tank 500L', 'Plumbing', 'piece', 'Ensul'),
('Water Tank 1000L', 'Plumbing', 'piece', 'Ensul'),

-- Paint
('Wall Paint White 5L', 'Paint', 'piece', 'Ensul'),
('Wall Paint White 20L', 'Paint', 'piece', 'Ensul'),
('Wall Paint Colored 5L', 'Paint', 'piece', 'Ensul'),
('Primer 5L', 'Paint', 'piece', 'Ensul'),
('Wood Varnish 1L', 'Paint', 'piece', 'Ensul'),

-- Bricks & Blocks
('Red Brick Standard', 'Masonry', 'piece', 'Ensul'),
('Concrete Block 10cm', 'Masonry', 'piece', 'Ensul'),
('Concrete Block 15cm', 'Masonry', 'piece', 'Ensul'),
('Concrete Block 20cm', 'Masonry', 'piece', 'Ensul'),

-- Wood & Timber
('Timber 5x10cm (4m)', 'Wood', 'piece', 'Ensul'),
('Timber 5x5cm (4m)', 'Wood', 'piece', 'Ensul'),
('Plywood 4mm', 'Wood', 'sheet', 'Ensul'),
('Plywood 9mm', 'Wood', 'sheet', 'Ensul'),
('Plywood 18mm', 'Wood', 'sheet', 'Ensul');

-- Clients: Construction (Companies, Hardware Stores)
INSERT INTO public.clients (name, location, contact_phone, sector) VALUES
('Dili Construction Co', 'Dili, Comoro', '+670 7733 1001', 'Ensul'),
('PT Timor Building', 'Dili, Bidau', '+670 7733 1002', 'Ensul'),
('Lemos Construction', 'Dili, Becora', '+670 7733 1003', 'Ensul'),
('Baucau Builders', 'Baucau, Centro', '+670 7734 1001', 'Ensul'),
('Maliana Construction', 'Maliana, Centro', '+670 7735 1001', 'Ensul'),
('Hardware Store Comoro', 'Dili, Comoro', '+670 7733 2001', 'Ensul'),
('Toko Besi Becora', 'Dili, Becora', '+670 7733 2002', 'Ensul'),
('Building Supply Farol', 'Dili, Farol', '+670 7733 2003', 'Ensul'),
('Loja Material Caicoli', 'Dili, Caicoli', '+670 7733 2004', 'Ensul'),
('Hardware Central', 'Dili, Centro', '+670 7733 2005', 'Ensul'),
('Toko Bangunan Baucau', 'Baucau, Centro', '+670 7734 2001', 'Ensul'),
('Suai Building Supplies', 'Suai, Centro', '+670 7736 1001', 'Ensul'),
('Same Hardware', 'Same, Centro', '+670 7737 1001', 'Ensul'),
('Viqueque Construction', 'Viqueque, Centro', '+670 7738 1001', 'Ensul'),
('Lospalos Materials', 'Lospalos, Centro', '+670 7739 1001', 'Ensul');

-- Competitors: Construction Materials
INSERT INTO public.competitors (name, location, sector) VALUES
('PT Indo Material', 'Dili, Comoro', 'Ensul'),
('Timor Cement Supply', 'Dili, Bidau', 'Ensul'),
('Steel House Dili', 'Dili, Becora', 'Ensul'),
('Building Pro TL', 'Dili, Audian', 'Ensul'),
('Hardware Giant', 'Dili, Caicoli', 'Ensul'),
('Construct Plus', 'Dili, Farol', 'Ensul'),
('Material Express', 'Dili, Comoro', 'Ensul');

-- ============================================
-- NOTE: Users are created through Supabase Auth
-- ============================================
-- To create test users, use Supabase Dashboard > Authentication > Users
-- Or use the signup API with metadata:
--
-- Example user metadata for signup:
-- {
--   "full_name": "Admin User",
--   "role": "admin",
--   "sector": "Central"
-- }
--
-- Recommended test accounts:
-- 1. admin@central.tl - Admin, Central sector
-- 2. worker1@central.tl - Field Worker, Central sector
-- 3. worker2@central.tl - Field Worker, Central sector
-- 4. worker1@ensul.tl - Field Worker, Ensul sector
-- 5. worker2@ensul.tl - Field Worker, Ensul sector
