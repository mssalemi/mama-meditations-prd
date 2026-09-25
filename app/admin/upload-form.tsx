"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setProgress(0);

    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || "";

    if (!file || !title) {
      setError("A title and an audio file are required.");
      return;
    }

    setUploading(true);
    try {
      // Straight from the browser to Blob storage. Routing the file through the
      // server would cap it at 4.5MB, which no real recording fits under.
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      const res = await fetch("/api/admin/meditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          quote: (form.get("quote") as string) || null,
          tags: ((form.get("tags") as string) || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          audioUrl: blob.url,
          mimeType: file.type,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Saved the audio but couldn't save the details.");
        return;
      }

      setSuccess(true);
      setFileName("");
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
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
        <p className="text-sm text-green-600">
          Uploaded — it&apos;s live on the site now.
        </p>
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
        placeholder="A few words about it (optional)"
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
        <label className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-dashed border-zinc-400 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-600 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400">
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

      {uploading && (
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">Uploading… {progress}%</p>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
