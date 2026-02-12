import { SupabaseClient, User } from "@supabase/supabase-js";

type AdminCheckResult =
  | { allowed: true; user: User }
  | { allowed: false; status: 401 | 403; error: string };

export async function requireAdmin(
  supabase: SupabaseClient,
): Promise<AdminCheckResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { allowed: false, status: 401, error: "Not authenticated" };
  }

  const { data: allowlisted } = await supabase
    .from("admin_allowlist")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!allowlisted) {
    return { allowed: false, status: 403, error: "Not authorized" };
  }

  return { allowed: true, user };
}
