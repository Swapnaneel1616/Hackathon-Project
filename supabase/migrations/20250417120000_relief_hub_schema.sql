-- Relief Hub — public schema aligned with app types (warehouses, reservations, tickets, shelters).
-- Run against Supabase Postgres (SQL editor or: npm run db:migrate with DIRECT_URL in .env.local).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.nutrition_category AS ENUM (
  'protein',
  'carbs',
  'fiber',
  'produce',
  'hydration'
);

CREATE TYPE public.stock_level AS ENUM ('green', 'yellow', 'red');

CREATE TYPE public.disaster_phase AS ENUM (
  'watch_pre',
  'watch_critical',
  'during',
  'post'
);

CREATE TYPE public.reservation_status AS ENUM ('active', 'fulfilled', 'expired');

CREATE TYPE public.ticket_status AS ENUM (
  'pending',
  'accepted',
  'closed',
  'expired',
  'rejected'
);

CREATE TYPE public.user_role AS ENUM ('resident', 'admin');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address_line TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  household_size INTEGER NOT NULL DEFAULT 1 CHECK (household_size >= 1 AND household_size <= 20),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  role public.user_role NOT NULL DEFAULT 'resident',
  bonus_redeemed_visit BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profiles_email_idx ON public.profiles (lower(email));

-- ---------------------------------------------------------------------------
-- Reference & operational tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_government_site BOOLEAN NOT NULL DEFAULT TRUE,
  category_caps JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_stock JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.shelters (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT NOT NULL REFERENCES public.warehouses (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  estimated_meals INTEGER NOT NULL DEFAULT 0 CHECK (estimated_meals >= 0),
  headcount INTEGER NOT NULL DEFAULT 0 CHECK (headcount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shelters_warehouse_id_idx ON public.shelters (warehouse_id);

CREATE TABLE public.catalog_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category public.nutrition_category NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  warehouse_id TEXT NOT NULL REFERENCES public.warehouses (id) ON DELETE CASCADE,
  warehouse_name TEXT NOT NULL,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.reservation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX reservations_user_idx ON public.reservations (user_id);
CREATE INDEX reservations_wh_idx ON public.reservations (warehouse_id);
CREATE INDEX reservations_status_expires_idx
  ON public.reservations (status, expires_at);

CREATE TABLE public.donation_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id TEXT NOT NULL REFERENCES public.warehouses (id) ON DELETE CASCADE,
  warehouse_name TEXT NOT NULL,
  donor_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  donor_email TEXT NOT NULL,
  donor_display_name TEXT NOT NULL,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_points INTEGER NOT NULL DEFAULT 0,
  status public.ticket_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX donation_tickets_wh_idx ON public.donation_tickets (warehouse_id);
CREATE INDEX donation_tickets_donor_email_idx ON public.donation_tickets (lower(donor_email));
CREATE INDEX donation_tickets_status_idx ON public.donation_tickets (status);

CREATE TABLE public.point_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX point_ledger_user_idx ON public.point_ledger (user_id, created_at DESC);

-- Single-row app state (demo / global phase)
CREATE TABLE public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  disaster_phase public.disaster_phase NOT NULL DEFAULT 'watch_pre',
  hours_to_impact INTEGER NOT NULL DEFAULT 72 CHECK (hours_to_impact >= 0 AND hours_to_impact <= 500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Triggers: new auth user → profile; updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: own row
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Warehouses & shelters & catalog: world-readable
CREATE POLICY warehouses_select_all ON public.warehouses FOR SELECT USING (true);
CREATE POLICY shelters_select_all ON public.shelters FOR SELECT USING (true);
CREATE POLICY catalog_select_all ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY app_settings_select_all ON public.app_settings FOR SELECT USING (true);

-- Admins (role on profile) can update warehouses + app_settings + read all profiles/tickets
CREATE POLICY warehouses_update_admin ON public.warehouses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY app_settings_update_admin ON public.app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY profiles_update_admin_points ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Reservations: own rows
CREATE POLICY reservations_select_own ON public.reservations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY reservations_insert_own ON public.reservations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reservations_update_own ON public.reservations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY reservations_select_admin ON public.reservations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Donation tickets: donor by email match (when linked user) or same user id; admins see all
CREATE POLICY tickets_select_own_or_admin ON public.donation_tickets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR donor_user_id = auth.uid()
    OR lower(donor_email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY tickets_insert_resident ON public.donation_tickets FOR INSERT
  WITH CHECK (donor_user_id = auth.uid());

CREATE POLICY tickets_update_admin ON public.donation_tickets FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Point ledger: own read; admin insert/update via service role typically — allow own read
CREATE POLICY ledger_select_own ON public.point_ledger FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY ledger_select_admin ON public.point_ledger FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

GRANT SELECT ON public.warehouses, public.shelters, public.catalog_items, public.app_settings TO anon, authenticated;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT SELECT, INSERT ON public.donation_tickets TO authenticated;
GRANT UPDATE ON public.donation_tickets TO authenticated;
GRANT SELECT ON public.point_ledger TO authenticated;
GRANT SELECT, UPDATE ON public.warehouses TO authenticated;
GRANT SELECT, UPDATE ON public.app_settings TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
