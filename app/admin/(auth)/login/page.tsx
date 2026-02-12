"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotAllowed(false);
    setLoading(true);

    try {
      const check = await fetch("/api/admin/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { allowed } = await check.json();

      if (!allowed) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            We sent a magic link to <strong>{email}</strong>. Click it to sign
            in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Admin Login
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {notAllowed && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            User accounts coming soon, listen to the meditations for now.
          </p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
    </div>
  );
}
