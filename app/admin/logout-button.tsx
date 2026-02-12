"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Logout
    </button>
  );
}
