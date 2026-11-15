/*
# Create initial SaaS schema (users, templates, documents, batches, subscriptions)

## Purpose
Sets up the core data model for a multi-user business-card / document app.
Each user owns their own documents and batches; templates are shared reference
data readable by all authenticated users.

## 1. New Tables

### users
- `id` (uuid, PK, references auth.users ON DELETE CASCADE) — one row per account
- `email` (text, unique, not null) — denormalized for convenience
- `plan` (text, default 'free') — subscription tier (free / pro / etc.)
- `date_fin_essai` (timestamptz, nullable) — trial end date

### templates
- `id` (uuid, PK)
- `type` (text, not null) — document kind (e.g. 'business_card')
- `nom` (text, not null) — display name
- `apercu_url` (text, nullable) — thumbnail/preview image URL
- `champs_defaut` (jsonb, default '{}') — default field values
- `style_defaut` (jsonb, default '{}') — default style values

### documents
- `id` (uuid, PK)
- `owner_id` (uuid, not null, DEFAULT auth.uid(), references auth.users) — owner
- `template_id` (uuid, nullable, references templates) — which template was used
- `type` (text, not null) — document kind
- `champs` (jsonb, default '{}') — user-entered field values
- `style` (jsonb, default '{}') — user-chosen style values
- `cree_le` (timestamptz, default now()) — creation timestamp

### batches
- `id` (uuid, PK)
- `owner_id` (uuid, not null, DEFAULT auth.uid(), references auth.users) — owner
- `source` (text, not null) — import source (e.g. 'csv_upload')
- `statut` (text, not null, default 'pending') — processing status
- `cree_le` (timestamptz, default now()) — creation timestamp

### subscriptions
- `id` (uuid, PK)
- `user_id` (uuid, not null, DEFAULT auth.uid(), references auth.users) — owner
- `statut` (text, not null, default 'active') — subscription status
- `date_renouvellement` (timestamptz, nullable) — next renewal date
- `fournisseur_paiement` (text, not null, default 'stripe') — payment provider

## 2. Indexes
- `documents.owner_id` — per-owner document listings
- `batches.owner_id` — per-owner batch listings
- `subscriptions.user_id` — per-user subscription lookups

## 3. Security (Row Level Security)
All tables have RLS ENABLED.

- **users**: owner-scoped CRUD (id = auth.uid()).
- **templates**: SELECT-only for authenticated (intentionally shared reference
  data, USING (true)). No INSERT/UPDATE/DELETE policies — only the service role
  can manage templates.
- **documents**: owner-scoped CRUD (owner_id = auth.uid()).
- **batches**: owner-scoped CRUD (owner_id = auth.uid()).
- **subscriptions**: owner-scoped CRUD (user_id = auth.uid()).

Owner columns (`owner_id`, `user_id`) default to `auth.uid()` so client inserts
that omit the owner still satisfy the WITH CHECK policy.

## 4. Important Notes
1. This migration is idempotent (IF NOT EXISTS on tables, DROP POLICY IF EXISTS
   before each CREATE POLICY).
2. No destructive operations — safe to re-run.
3. Templates are global reference data; users can read but not modify them.
*/

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  date_fin_essai timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON users;
CREATE POLICY "select_own_profile" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON users;
CREATE POLICY "insert_own_profile" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON users;
CREATE POLICY "update_own_profile" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON users;
CREATE POLICY "delete_own_profile" ON users FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- templates ----------
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  nom text NOT NULL,
  apercu_url text,
  champs_defaut jsonb NOT NULL DEFAULT '{}',
  style_defaut jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Shared reference data: any authenticated user can read all templates.
-- No INSERT/UPDATE/DELETE policies => only the service role can manage them.
DROP POLICY IF EXISTS "select_templates" ON templates;
CREATE POLICY "select_templates" ON templates FOR SELECT
  TO authenticated USING (true);

-- ---------- documents ----------
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  type text NOT NULL,
  champs jsonb NOT NULL DEFAULT '{}',
  style jsonb NOT NULL DEFAULT '{}',
  cree_le timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents (owner_id);

-- ---------- batches ----------
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL,
  statut text NOT NULL DEFAULT 'pending',
  cree_le timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_batches" ON batches;
CREATE POLICY "select_own_batches" ON batches FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_batches" ON batches;
CREATE POLICY "insert_own_batches" ON batches FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_batches" ON batches;
CREATE POLICY "update_own_batches" ON batches FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_batches" ON batches;
CREATE POLICY "delete_own_batches" ON batches FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_batches_owner_id ON batches (owner_id);

-- ---------- subscriptions ----------
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'active',
  date_renouvellement timestamptz,
  fournisseur_paiement text NOT NULL DEFAULT 'stripe'
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
