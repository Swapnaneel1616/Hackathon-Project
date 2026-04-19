Relief Hub — Supabase Postgres

1. Copy ../.env.example to .env.local and set DIRECT_URL (5432) and/or DATABASE_URL (pooler 6543), plus Supabase URL and keys. The project ref in NEXT_PUBLIC_SUPABASE_URL must match the ref inside your anon JWT (subdomain).

2. Apply migrations once:
   npm run db:migrate
   Uses DIRECT_URL if set, else DATABASE_URL. If db.<ref>.supabase.co does not resolve on your network, use the pooler URL only.

3. Sanity check:
   npm run db:verify

4. Re-running db:migrate after success will fail (types/tables exist). To reset, use Supabase SQL editor to drop public tables/types/policies or create a fresh project.

5. New Supabase Auth users get a profiles row via trigger on_auth_user_created. Promote an admin in SQL:
   update public.profiles set role = 'admin' where email = 'you@example.com';
