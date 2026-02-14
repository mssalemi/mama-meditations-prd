"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

interface Meditation {
  id: string;
  title: string;
  quote: string | null;
  tags: string[];
  audio_url: string;
  created_at: string;
}

export default function MeditationList({
  meditations,
}: {
  meditations: Meditation[];
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const allTags = useMemo(
    () =>
      [...new Set(meditations.flatMap((m) => m.tags))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [meditations]
  );

  const filteredMeditations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return meditations
      .filter((m) => m.title.toLowerCase().includes(query))
      .filter((m) =>
        selectedTags.size === 0
          ? true
          : [...selectedTags].every((tag) => m.tags.includes(tag))
      )
      .sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return sortOrder === "newest" ? db - da : da - db;
      });
  }, [meditations, searchQuery, selectedTags, sortOrder]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function togglePlay(m: Meditation) {
    // If already playing this meditation, stop it
    if (playingId === m.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Play the new meditation
    const audio = new Audio(m.audio_url);
    audio.addEventListener("ended", () => {
      setPlayingId(null);
      audioRef.current = null;
    });
    audio.play();
    audioRef.current = audio;
    setPlayingId(m.id);
  }

  if (!meditations.length) {
    return <p className="text-zinc-500">No meditations yet.</p>;
  }

  return (
    <>
      {/* Search input */}
      <div className="relative mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
        />
      </div>

      {/* Tag chips + Sort */}
      <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))
            }
            className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-3.5 w-3.5 transition-transform ${
                sortOrder === "oldest" ? "rotate-180" : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.513a.75.75 0 0 1-1.08 0l-5.25-5.512a.75.75 0 0 1 1.08-1.04l3.96 4.157V3.75A.75.75 0 0 1 10 3Z"
                clipRule="evenodd"
              />
            </svg>
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
      </div>

      {/* Count */}
      <p className="mb-2 text-xs text-zinc-400">
        {searchQuery || selectedTags.size > 0
          ? `${filteredMeditations.length} of ${meditations.length} meditations`
          : `${meditations.length} meditations`}
      </p>

      {filteredMeditations.length === 0 ? (
        <p className="text-zinc-500">No meditations match your filters.</p>
      ) : (
      <ul className="flex flex-col gap-2">
        {filteredMeditations.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow dark:bg-zinc-900"
          >
            {/* Play/Stop button */}
            <button
              onClick={() => togglePlay(m)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label={playingId === m.id ? "Stop" : "Play"}
            >
              {playingId === m.id ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <rect x="5" y="4" width="4" height="12" rx="1" />
                  <rect x="11" y="4" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
              )}
            </button>

            {/* Title + Tags */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/meditations/${m.id}`}
                className="truncate font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              >
                {m.title}
              </Link>
              {m.tags.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <span className="flex-shrink-0 text-xs text-zinc-400">
              {m.created_at.slice(0, 10)}
            </span>

            {/* Actions */}
            <div className="flex flex-shrink-0 gap-2">
              <a
                href={m.audio_url}
                download={`${m.title}.m4a`}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Download
              </a>
              <Link
                href={`/admin/meditations/${m.id}`}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
      )}

    </>
  );
}
