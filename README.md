# LifeQuest RPG — Supabase Edition

A full-stack-feeling React Life RPG using **Supabase Auth + Supabase PostgreSQL**.

## Stack

- React + Vite
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security (RLS)
- Supabase RPC / PostgreSQL functions for atomic game actions
- Lucide React
- Responsive CSS

## Why Supabase?

Authentication is handled by Supabase Auth instead of custom JWT code. User/game data is stored in PostgreSQL, and RLS ensures users can only access their own profile, quests and inventory.

## Setup

### 1. Create a Supabase project

Create a project in Supabase.

### 2. Run the database schema

Open:

```text
supabase_schema.sql
```

Copy the entire file into **Supabase Dashboard → SQL Editor → New query**, then Run.

The schema creates:
- profiles
- tasks
- shop_items
- inventory
- signup profile trigger
- Row Level Security policies
- secure `complete_quest()` RPC
- secure `buy_shop_item()` RPC

### 3. Get Supabase keys

In your Supabase project, open the API/project settings and copy the project URL and client/publishable (or anon) key.

Create:

```text
frontend/.env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

### 4. Install and run

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, normally:

```text
http://localhost:5173
```

## Authentication flow

```text
React
  ↓
Supabase Auth
  ↓
Authenticated session
  ↓
PostgreSQL profiles/tasks/inventory
  ↓
RLS policies
```

Signup:

```js
supabase.auth.signUp(...)
```

Login:

```js
supabase.auth.signInWithPassword(...)
```

Logout:

```js
supabase.auth.signOut()
```

Current user:

```js
supabase.auth.getUser()
```

## Security

Do not put a Supabase service-role key in the React frontend.

Only use the public client/publishable/anon key in `VITE_*`.

All user-owned tables use RLS.

Quest completion and shop purchases use PostgreSQL RPC functions so XP/gold/attributes and inventory changes are performed atomically on the database.

## Important

If email confirmation is enabled in Supabase Auth, signup will show a confirmation message until the user verifies the email.

For a hackathon demo, you can configure the Supabase Auth email-confirmation setting according to your demo needs.

## Troubleshooting (fixed in this pass)

If you're re-testing after these fixes, check these in order:

1. **`frontend/.env` must have the base project URL, not the REST endpoint.**
   ```
   ✅ VITE_SUPABASE_URL=https://abcxyz.supabase.co
   ❌ VITE_SUPABASE_URL=https://abcxyz.supabase.co/rest/v1/
   ```
   A wrong URL here shows up as `401 Invalid API key` on login/signup even
   with a correct anon key, because the request never reaches Supabase Auth
   at the right path.

2. **`supabase_schema.sql` must be run in full, in the actual project your
   `.env` points at.** If you see errors like `Could not find the
   'attribute_gain' column of 'tasks'` or `relation "public.shop_items"
   does not exist` in the browser console, the schema hasn't been applied
   (or was applied to a different project than the one in `.env`).

3. **A signed-up user with no profile row no longer gets stuck at the
   login screen.** `api.js`'s `me()` now creates the missing row on the
   fly if the `handle_new_user` trigger didn't fire for some reason — you
   shouldn't ever see this manually, but it's there as a safety net.

4. **Shop and Profile pages now show the actual error** instead of hanging
   on a blank grid or an infinite "Loading…" — if either page shows a red
   error banner, that message is the real Postgres/PGRST error and tells
   you exactly what's missing (usually schema not applied, or RLS blocking
   a query it shouldn't).

5. **Fast Refresh (instant updates while editing) needs `vite.config.js`**,
   which now exists and registers `@vitejs/plugin-react` — if edits were
   causing full page reloads before, they shouldn't now.

## Deployment


Deploy the `frontend` folder to Vercel or Netlify.

Add these environment variables to the hosting platform:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

No Node/MySQL backend is required for this Supabase edition.
