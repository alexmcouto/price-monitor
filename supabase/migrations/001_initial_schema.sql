-- ============================================
-- PRICE MONITOR DATABASE SCHEMA
-- Timor-Leste Market Intelligence System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: This extends Supabase Auth users with app-specific data

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'field_worker')) DEFAULT 'field_worker',
    sector TEXT NOT NULL CHECK (sector IN ('Central', 'Ensul')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_sector ON public.users(sector);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'piece', 'bag', 'liter', 'meter', 'sheet')),
    sector TEXT NOT NULL CHECK (sector IN ('Central', 'Ensul')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_sector ON public.products(sector);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_category ON public.products(category);

-- ============================================
-- CLIENTS TABLE
-- ============================================

CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_phone TEXT,
    sector TEXT NOT NULL CHECK (sector IN ('Central', 'Ensul')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_sector ON public.clients(sector);
CREATE INDEX idx_clients_active ON public.clients(is_active);

-- ============================================
-- COMPETITORS TABLE
-- ============================================

CREATE TABLE public.competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    sector TEXT NOT NULL CHECK (sector IN ('Central', 'Ensul')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_competitors_sector ON public.competitors(sector);
CREATE INDEX idx_competitors_active ON public.competitors(is_active);

-- ============================================
-- PRICE AUDITS TABLE
-- ============================================

CREATE TABLE public.price_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE RESTRICT,
    our_price DECIMAL(10,2) NOT NULL CHECK (our_price >= 0),
    competitor_price DECIMAL(10,2) NOT NULL CHECK (competitor_price >= 0),
    photo_url TEXT,
    notes TEXT,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audits_user ON public.price_audits(user_id);
CREATE INDEX idx_audits_date ON public.price_audits(audit_date DESC);
CREATE INDEX idx_audits_product ON public.price_audits(product_id);
CREATE INDEX idx_audits_client ON public.price_audits(client_id);
CREATE INDEX idx_audits_competitor ON public.price_audits(competitor_id);
CREATE INDEX idx_audits_created ON public.price_audits(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_audits ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- USERS TABLE POLICIES
-- ----------------------------------------
-- NOTE: These policies use JWT claims (auth.jwt()) instead of querying public.users
-- to avoid recursive policy evaluation which causes "Database error querying schema"

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all users (uses JWT metadata to avoid recursion)
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can update users (uses JWT metadata to avoid recursion)
CREATE POLICY "Admins can update users"
    ON public.users FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ----------------------------------------
-- PRODUCTS TABLE POLICIES
-- ----------------------------------------

-- All authenticated users can view active products
CREATE POLICY "Users can view active products"
    ON public.products FOR SELECT
    USING (is_active = TRUE AND auth.uid() IS NOT NULL);

-- Admins can view all products (including inactive)
CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can insert products
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can update products
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ----------------------------------------
-- CLIENTS TABLE POLICIES
-- ----------------------------------------

-- All authenticated users can view active clients
CREATE POLICY "Users can view active clients"
    ON public.clients FOR SELECT
    USING (is_active = TRUE AND auth.uid() IS NOT NULL);

-- Admins can view all clients
CREATE POLICY "Admins can view all clients"
    ON public.clients FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can insert clients
CREATE POLICY "Admins can insert clients"
    ON public.clients FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can update clients
CREATE POLICY "Admins can update clients"
    ON public.clients FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ----------------------------------------
-- COMPETITORS TABLE POLICIES
-- ----------------------------------------

-- All authenticated users can view active competitors
CREATE POLICY "Users can view active competitors"
    ON public.competitors FOR SELECT
    USING (is_active = TRUE AND auth.uid() IS NOT NULL);

-- Admins can view all competitors
CREATE POLICY "Admins can view all competitors"
    ON public.competitors FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can insert competitors
CREATE POLICY "Admins can insert competitors"
    ON public.competitors FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can update competitors
CREATE POLICY "Admins can update competitors"
    ON public.competitors FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ----------------------------------------
-- PRICE AUDITS TABLE POLICIES
-- ----------------------------------------

-- Field workers can view their own audits
CREATE POLICY "Users can view own audits"
    ON public.price_audits FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all audits
CREATE POLICY "Admins can view all audits"
    ON public.price_audits FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Field workers can create audits
CREATE POLICY "Users can create audits"
    ON public.price_audits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can delete audits
CREATE POLICY "Admins can delete audits"
    ON public.price_audits FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, sector)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'field_worker'),
        COALESCE(NEW.raw_user_meta_data->>'sector', 'Central')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKET SETUP (run in Supabase dashboard)
-- ============================================
-- Note: Create a storage bucket named 'price-audit-photos'
-- with public access for reading photos

-- Storage policy example (apply via Supabase dashboard):
-- INSERT policy: Allow authenticated users to upload to their folder
-- SELECT policy: Allow public access to view photos
