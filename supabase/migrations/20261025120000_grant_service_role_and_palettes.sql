/*
# Grant table privileges to service_role + saved_palettes

The previous GRANT migration only targeted `authenticated` (and SELECT on
templates for `anon`). Hosted PostgREST queries as `service_role` were
therefore denied (42501), which blocks admin inspection and tooling.

`saved_palettes` was created after that GRANT pass, so `authenticated` also
lacked table privileges on it.

This is additive (GRANT is idempotent). RLS still restricts which rows
`authenticated` can see.
*/

GRANT SELECT, INSERT, UPDATE, DELETE ON
  users,
  documents,
  batches,
  subscriptions,
  saved_palettes
TO authenticated, service_role;

GRANT SELECT ON templates TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON templates TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
