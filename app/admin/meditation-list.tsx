"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Meditation {
  id: string;
  title: string;
  quote: string | null;
  audio_url: string;
  created_at: string;
}

export default function MeditationList({
  meditations,
}: {
  meditations: Meditation[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function startEdit(m: Meditation) {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditQuote(m.quote ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/meditations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, quote: editQuote }),
      });
      if (!res.ok) throw new Error("Save failed");
      setEditingId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/meditations/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeletingId(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (!meditations.length) {
    return <p className="text-zinc-500">No meditations yet.</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {meditations.map((m) => (
          <li
            key={m.id}
            className="rounded-xl bg-white p-4 shadow dark:bg-zinc-900"
          >
            {editingId === m.id ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  placeholder="Quote (optional)"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(m.id)}
                    disabled={saving}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {saving ? "Saving\u2026" : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {m.title}
                </p>
                {m.quote && (
                  <p className="mt-1 text-sm italic text-zinc-500">
                    &ldquo;{m.quote}&rdquo;
                  </p>
                )}
                <audio
                  controls
                  src={m.audio_url}
                  className="mt-3 w-full"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-zinc-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(m.id)}
                      className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Are you sure you want to delete this meditation?
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              This will also remove the audio file. This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting\u2026" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
