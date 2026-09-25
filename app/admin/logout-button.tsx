"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
    >
      Sign out
    </button>
  );
}
