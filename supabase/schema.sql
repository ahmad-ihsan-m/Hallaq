-- =============================================================
-- HALLAQ — Barbershop Booking Platform
-- Full Database Schema + Seed Data
-- Run this in Supabase SQL Editor (https://app.supabase.com)
-- =============================================================

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- users: extends Supabase Auth. Created via trigger on signup.
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'customer'
               CHECK (role IN ('customer', 'barber', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- barbershops
CREATE TABLE IF NOT EXISTS public.barbershops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  description TEXT,
  phone       TEXT,
  image_url   TEXT,
  owner_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- barbers
CREATE TABLE IF NOT EXISTS public.barbers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  barbershop_id   UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  specialization  TEXT,
  image_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- services
CREATE TABLE IF NOT EXISTS public.services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  duration      INTEGER NOT NULL, -- in minutes
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  barber_id    UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id   UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'done', 'cancelled')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  barber_id  UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_barbershops_owner  ON public.barbershops(owner_id);
CREATE INDEX IF NOT EXISTS idx_barbers_shop       ON public.barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_shop      ON public.services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user      ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_barber    ON public.bookings(barber_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date      ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_barber     ON public.reviews(barber_id);


-- ------------------------------------------------------------
-- 3. AUTO-INSERT USER ON AUTH SIGNUP (Trigger)
-- This trigger creates a row in public.users whenever
-- someone registers via Supabase Auth.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------

ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews     ENABLE ROW LEVEL SECURITY;

-- users: anyone can read, only own row can update
CREATE POLICY "users_select_all"   ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own"   ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own"   ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- barbershops: public read, owner manages own
CREATE POLICY "shops_select_all"   ON public.barbershops FOR SELECT USING (true);
CREATE POLICY "shops_insert_owner" ON public.barbershops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shops_update_owner" ON public.barbershops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "shops_delete_owner" ON public.barbershops FOR DELETE USING (auth.uid() = owner_id);

-- barbers: public read, shop owner manages
CREATE POLICY "barbers_select_all"   ON public.barbers FOR SELECT USING (true);
CREATE POLICY "barbers_insert_owner" ON public.barbers FOR INSERT WITH CHECK (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);
CREATE POLICY "barbers_update_owner" ON public.barbers FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);
CREATE POLICY "barbers_delete_owner" ON public.barbers FOR DELETE USING (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);

-- services: public read, shop owner manages
CREATE POLICY "services_select_all"   ON public.services FOR SELECT USING (true);
CREATE POLICY "services_insert_owner" ON public.services FOR INSERT WITH CHECK (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);
CREATE POLICY "services_update_owner" ON public.services FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);
CREATE POLICY "services_delete_owner" ON public.services FOR DELETE USING (
  auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = barbershop_id)
);

-- bookings: user sees own, shop owner sees bookings for their shop
CREATE POLICY "bookings_select_own"   ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT owner_id FROM public.barbershops b
                JOIN public.barbers br ON br.barbershop_id = b.id
                WHERE br.id = barber_id LIMIT 1)
);
CREATE POLICY "bookings_insert_auth"  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_owner" ON public.bookings FOR UPDATE USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT owner_id FROM public.barbershops b
                JOIN public.barbers br ON br.barbershop_id = b.id
                WHERE br.id = barber_id LIMIT 1)
);

-- reviews: public read, authenticated user creates own
CREATE POLICY "reviews_select_all"  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 5. SEED DATA
-- ============================================================
-- IMPORTANT: These UUIDs are placeholders.
-- Before running these INSERT statements you must:
--   1. Sign up two users via the app (one owner, one customer)
--   2. Go to Supabase → Authentication → Users and copy their UUIDs
--   3. Replace OWNER_UUID and CUSTOMER_UUID below
--
-- Example UUIDs for reference (replace these):
--   OWNER_UUID    = 'aaaaaaaa-0000-0000-0000-000000000001'
--   CUSTOMER_UUID = 'bbbbbbbb-0000-0000-0000-000000000002'
-- ------------------------------------------------------------

-- Uncomment and replace UUIDs to run seed data:

/*

-- Seed: barbershops
INSERT INTO public.barbershops (id, name, location, description, phone, owner_id)
VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Hallaq Classic',
   'Jl. Sudirman No. 10, Jakarta Pusat',
   'Barbershop klasik dengan layanan premium untuk pria modern.',
   '021-5551234',
   'OWNER_UUID'),

  ('22222222-2222-2222-2222-222222222222',
   'Razor & Style',
   'Jl. Gatot Subroto No. 45, Jakarta Selatan',
   'Spesialis potong rambut modern dan cukur jenggot.',
   '021-5555678',
   'OWNER_UUID');

-- Seed: barbers for Hallaq Classic
INSERT INTO public.barbers (id, name, barbershop_id, specialization)
VALUES
  ('33333333-3333-3333-3333-333333333331',
   'Ahmad Rizky',
   '11111111-1111-1111-1111-111111111111',
   'Fade & Undercut'),

  ('33333333-3333-3333-3333-333333333332',
   'Budi Santoso',
   '11111111-1111-1111-1111-111111111111',
   'Classic Cut & Shave');

-- Seed: barbers for Razor & Style
INSERT INTO public.barbers (id, name, barbershop_id, specialization)
VALUES
  ('44444444-4444-4444-4444-444444444441',
   'Dani Pratama',
   '22222222-2222-2222-2222-222222222222',
   'Modern Textured Cut'),

  ('44444444-4444-4444-4444-444444444442',
   'Eko Wahyudi',
   '22222222-2222-2222-2222-222222222222',
   'Pompadour & Quiff');

-- Seed: services for Hallaq Classic
INSERT INTO public.services (name, price, duration, barbershop_id)
VALUES
  ('Potong Rambut',     35000,  30, '11111111-1111-1111-1111-111111111111'),
  ('Cukur Jenggot',     25000,  20, '11111111-1111-1111-1111-111111111111'),
  ('Potong + Cukur',    55000,  45, '11111111-1111-1111-1111-111111111111');

-- Seed: services for Razor & Style
INSERT INTO public.services (name, price, duration, barbershop_id)
VALUES
  ('Potong Rambut',     40000,  30, '22222222-2222-2222-2222-222222222222'),
  ('Hair Coloring',    100000,  60, '22222222-2222-2222-2222-222222222222'),
  ('Premium Package',  150000,  90, '22222222-2222-2222-2222-222222222222');

*/
