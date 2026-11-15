/*
# Grant table privileges to anon and authenticated roles

## Problem
The RLS policies were correctly defined, but no GRANT statements were issued.
RLS policies only filter *which rows* a role may access — the role still needs
table-level privileges (SELECT, INSERT, UPDATE, DELETE) to reach the table at
all. Without grants, every query from the Supabase JS client (which runs as
`authenticated` when signed in, `anon` when not) silently returned empty
results or a permission-denied error. This is why no data was ever persisted:
not in `documents`, not even in `users`.

## Changes
Grants the appropriate privileges on every table:

- **users**            — full CRUD to `authenticated` (owner-scoped profile)
- **templates**        — SELECT to `anon, authenticated` (shared reference data)
- **documents**        — full CRUD to `authenticated` (owner-scoped)
- **batches**          — full CRUD to `authenticated` (owner-scoped)
- **subscriptions**    — full CRUD to `authenticated` (owner-scoped)

`anon` gets SELECT on `templates` only (so the login page could theoretically
show template previews without signing in). All other access for `anon` is
denied — the app requires authentication.

## Idempotency
GRANT is naturally idempotent — re-granting the same privilege is a no-op.
*/

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;

GRANT SELECT ON templates TO anon, authenticated;
