## Supabase migration for Hersheild

This folder contains a **single SQL migration** to create all Supabase tables and storage resources
needed to replace MongoDB for users, contacts, and evidence.

### How to apply

1. Open the **Supabase SQL editor** for your project (or any Postgres client connected to Supabase).
2. Copy the contents of `0001_hersheild_init.sql`.
3. Run it once against your Supabase database.

After this migration:

- The API routes in this repo will use:
  - `public.users` for user accounts
  - `public.contacts` for contacts
  - `public.evidence` for evidence metadata
  - `storage` bucket `evidence` for files (images + audio)


