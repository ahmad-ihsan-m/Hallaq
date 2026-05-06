-- =============================================================
-- MIGRATION: Cinema-style time slot booking
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =============================================================

-- Step 1: Add booking_time column
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_time TIME;

-- Step 2: Back-fill booking_time from existing TIMESTAMPTZ data (if any rows exist)
UPDATE public.bookings
SET booking_time = booking_date::TIME
WHERE booking_time IS NULL;

-- Step 3: Change booking_date from TIMESTAMPTZ → DATE
ALTER TABLE public.bookings
  ALTER COLUMN booking_date TYPE DATE USING booking_date::DATE;

-- Step 4: Make booking_time NOT NULL now that it is populated
ALTER TABLE public.bookings
  ALTER COLUMN booking_time SET NOT NULL;

-- Step 5: Partial unique index — prevents double-booking the same
--         barber/date/time, but still allows cancellations to free the slot.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_double_booking
  ON public.bookings(barber_id, booking_date, booking_time)
  WHERE status <> 'cancelled';

-- Step 6: Fast availability lookup index
CREATE INDEX IF NOT EXISTS idx_bookings_availability
  ON public.bookings(barber_id, booking_date)
  WHERE status <> 'cancelled';
