/*
# Create service_pricing table

1. New Tables
- `service_pricing`
  - `id` (uuid, primary key)
  - `service_slug` (text) — e.g. 'web-development', 'branding'
  - `service_name` (text) — display name of the service category
  - `item_name` (text) — the specific service item row
  - `market_price` (text) — market/competitor price string e.g. '₹15,000'
  - `our_price` (text) — Digi8 Solutions price string
  - `savings` (text) — how much customer saves
  - `sort_order` (int) — display ordering within a service
  - `is_active` (boolean) — hide/show row
  - `created_at` / `updated_at` (timestamps)

2. Security
  - RLS enabled; anon + authenticated can SELECT (public pricing page)
  - Only authenticated can INSERT/UPDATE/DELETE (admin only)

3. Notes
  - prices are stored as text to support flexible formats like 'Quote Based', '₹499+' etc
  - savings can be 'Up to 40% Discount' or a numeric value
  - sort_order controls row order within each service
*/

CREATE TABLE IF NOT EXISTS service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug text NOT NULL,
  service_name text NOT NULL,
  item_name text NOT NULL,
  market_price text NOT NULL,
  our_price text NOT NULL,
  savings text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_pricing_slug ON service_pricing(service_slug);
CREATE INDEX IF NOT EXISTS idx_service_pricing_active ON service_pricing(is_active);

ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_pricing" ON service_pricing;
CREATE POLICY "public_select_pricing" ON service_pricing FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_pricing" ON service_pricing;
CREATE POLICY "auth_insert_pricing" ON service_pricing FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_pricing" ON service_pricing;
CREATE POLICY "auth_update_pricing" ON service_pricing FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_pricing" ON service_pricing;
CREATE POLICY "auth_delete_pricing" ON service_pricing FOR DELETE
  TO authenticated USING (true);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_service_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_pricing_updated_at ON service_pricing;
CREATE TRIGGER trg_service_pricing_updated_at
  BEFORE UPDATE ON service_pricing
  FOR EACH ROW EXECUTE FUNCTION update_service_pricing_updated_at();
