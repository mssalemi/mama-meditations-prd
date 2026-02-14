"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Meditation {
  id: string;
  title: string;
  quote: string | null;
  tags: string[];
  transcription: string | null;
  audio_url: string;
  created_at: string;
}

export default function MeditationDetail({
  meditation,
}: {
  meditation: Meditation;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(meditation.title);
  const [editQuote, setEditQuote] = useState(meditation.quote ?? "");
  const [editTags, setEditTags] = useState(meditation.tags.join(", "));
  const [editTranscription, setEditTranscription] = useState(meditation.transcription ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/meditations/${meditation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          quote: editQuote,
          tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
          transcription: editTranscription,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/meditations/${meditation.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/meditations");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/meditations"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        &larr; Back to meditations
      </Link>

      <div className="rounded-xl bg-white p-6 shadow dark:bg-zinc-900">
        {editing ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-zinc-500">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <label className="text-xs font-medium text-zinc-500">Quote</label>
            <input
              type="text"
              value={editQuote}
              onChange={(e) => setEditQuote(e.target.value)}
              placeholder="Quote (optional)"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <label className="text-xs font-medium text-zinc-500">Tags (comma-separated)</label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="e.g. morning, gratitude, breathing"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <label className="text-xs font-medium text-zinc-500">Transcription</label>
            <textarea
              value={editTranscription}
              onChange={(e) => setEditTranscription(e.target.value)}
              placeholder="Transcription (optional)"
              rows={5}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving ? "Saving\u2026" : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditTitle(meditation.title);
                  setEditQuote(meditation.quote ?? "");
                  setEditTags(meditation.tags.join(", "));
                  setEditTranscription(meditation.transcription ?? "");
                }}
                disabled={saving}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {meditation.title}
            </h1>
            {meditation.quote && (
              <p className="mt-2 text-sm italic text-zinc-500">
                &ldquo;{meditation.quote}&rdquo;
              </p>
            )}
            {meditation.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {meditation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-zinc-400">
              {new Date(meditation.created_at).toLocaleDateString()}
            </p>
            {meditation.transcription && (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-500">Transcription</p>
                <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {meditation.transcription}
                </p>
              </div>
            )}

            <audio
              controls
              src={meditation.audio_url}
              className="mt-4 w-full"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
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
                onClick={() => setShowDeleteConfirm(false)}
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
    </div>
  );
}
