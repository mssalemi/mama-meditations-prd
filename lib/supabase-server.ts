import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Session-bound server client — use in server components & route handlers */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can throw in Server Components (read-only cookies).
            // Safe to ignore — middleware handles token refresh.
          }
        },
      },
    },
  );
}
