import { supabaseServer } from "@/lib/supabase-server";
import LogoutButton from "../logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Hello, <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</span>
          </p>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <p className="text-center text-xs text-zinc-400">
            Mama Meditations Admin
          </p>
        </div>
      </footer>
    </div>
  );
}
