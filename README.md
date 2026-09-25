# Mama Meditations

A daily meditation app built with Next.js and Supabase. Each day, visitors see a rotating meditation with an audio player. Admins can upload, edit, and delete meditations through a protected dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Storage:** Supabase (Postgres + Storage buckets)
- **Auth:** Supabase Auth (magic link OTP)
- **Styling:** Tailwind CSS

## Project Structure

```
app/
  page.tsx                              # Public: daily meditation player
  layout.tsx                            # Root layout
  auth/callback/route.ts                # Magic link callback handler
  admin/
    (auth)/
      login/page.tsx                    # Admin login (magic link)
      not-authorized/page.tsx           # Unauthorized user message
    (dashboard)/
      layout.tsx                        # Dashboard shell (header + footer)
      page.tsx                          # Home: upload form
      meditations/page.tsx              # Meditation list (edit/delete)
    logout-button.tsx                   # Client component
    upload-form.tsx                     # Client component
    meditation-list.tsx                 # Client component
  api/admin/
    upload/route.ts                     # POST: upload meditation audio
    meditations/[id]/route.ts           # PATCH/DELETE: edit/delete meditation
    check-email/route.ts                # POST: validate email before login
lib/
  supabase.ts                           # Browser + admin Supabase clients
  supabase-server.ts                    # Server component Supabase client
  admin-check.ts                        # Admin allowlist helper
middleware.ts                           # Auth guard for /admin/* routes
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ALLOWED_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public meditation player.

Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Auth Flow

1. User visits `/admin` and is redirected to `/admin/login` by middleware
2. Email is checked against `ALLOWED_ADMIN_EMAILS` before sending the magic link
3. Magic link callback at `/auth/callback` sets the session
4. Middleware checks the `admin_allowlist` table in Supabase on every `/admin/*` request
5. Unauthorized users are redirected to `/admin/not-authorized`

## Supabase Setup

**Setting up a fresh project:** run `supabase/000_bootstrap.sql` in the SQL editor.
It creates both tables, the indexes, RLS, and the private storage bucket in one
paste, then add admin emails to `admin_allowlist`.

⚠️ **Free-tier projects pause when idle and are eventually deleted.** That is how
the original project disappeared — the app kept deploying fine and simply showed
an empty state, because the backend was gone rather than empty. If sign-in fails
with `DNS_PROBE_FINISHED_NXDOMAIN`, the project no longer exists: create a new
one, run the bootstrap, and update `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` locally and in
Vercel. Audio files in the old bucket are gone with it.

### Reference

- **Database table:** `meditations` (id, title, quote, storage_path, published, created_at)
- **Database table:** `admin_allowlist` (email)
- **Storage bucket:** `meditations` (private, for audio files)
- **SMTP:** Configure custom SMTP in Supabase Auth settings (e.g. Resend) to avoid the default 2 emails/hr limit
