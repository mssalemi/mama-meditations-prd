"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setSuccess(true);
      setFileName("");
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-12 flex flex-col gap-4 rounded-xl bg-white p-6 shadow dark:bg-zinc-900"
    >
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Upload Meditation
      </h2>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">Meditation uploaded successfully!</p>
      )}

      <input
        name="title"
        type="text"
        placeholder="Title"
        required
        className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <textarea
        name="quote"
        placeholder="Quote (optional)"
        rows={2}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <input
        name="tags"
        type="text"
        placeholder="Tags (comma-separated, e.g. morning, gratitude)"
        className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-dashed border-zinc-400 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-600 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Choose Audio File
          <input
            name="file"
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.caf,.mp4"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        {fileName && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selected: {fileName}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="self-start rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
