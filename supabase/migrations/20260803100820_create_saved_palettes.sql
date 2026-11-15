/*
# Create saved_palettes table

## Purpose
Allows users to save custom color palettes for reuse across multiple cards.

## 1. New Table
### saved_palettes
- `id` (uuid, PK)
- `owner_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users) — owner
- `name` (text, NOT NULL) — palette name
- `bg1` (text) — primary background color
- `bg2` (text) — secondary background color
- `text` (text) — text color
- `accent` (text) — accent color
- `muted` (text) — muted text color
- `border` (text) — border color
- `dark` (boolean, default false) — is it a dark palette?
- `cree_le` (timestamptz, default now())

## 2. Security (RLS)
- Enabled on saved_palettes
- Owner-scoped CRUD: each authenticated user can only access their own palettes

## 3. Index
- `saved_palettes.owner_id` for per-owner listings
*/

CREATE TABLE IF NOT EXISTS saved_palettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  bg1 text NOT NULL DEFAULT '#ffffff',
  bg2 text NOT NULL DEFAULT '#f1f5f9',
  text text NOT NULL DEFAULT '#0f172a',
  accent text NOT NULL DEFAULT '#0ea5e9',
  muted text NOT NULL DEFAULT '#64748b',
  border text NOT NULL DEFAULT '#e2e8f0',
  dark boolean NOT NULL DEFAULT false,
  cree_le timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_palettes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_palettes" ON saved_palettes;
CREATE POLICY "select_own_palettes" ON saved_palettes FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_palettes" ON saved_palettes;
CREATE POLICY "insert_own_palettes" ON saved_palettes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_palettes" ON saved_palettes;
CREATE POLICY "update_own_palettes" ON saved_palettes FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_palettes" ON saved_palettes;
CREATE POLICY "delete_own_palettes" ON saved_palettes FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_saved_palettes_owner_id ON saved_palettes (owner_id);
