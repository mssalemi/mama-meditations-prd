"use client";

import { PRESET_TAGS } from "@/lib/tags";

/** Tap-to-toggle tag chooser. Deliberately not a text input: typing tags meant
 *  remembering last time's spelling, and "Morning" / "morning" / "mornings"
 *  each became a separate filter. A fixed list can't drift.
 *
 *  Styled to match the filter pills on the meditations list, so the thing you
 *  tap to tag and the thing you tap to filter look like the same thing. */
export default function TagPicker({
  selected,
  onChange,
  label = "Tags",
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}) {
  function toggle(tag: string) {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  }

  // A tag saved before this list existed (or since removed from it) still
  // belongs to the meditation — show it so editing can't silently drop it.
  const extras = selected.filter(
    (tag) => !PRESET_TAGS.some((preset) => preset === tag),
  );

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium text-zinc-500">
        {label} <span className="font-normal">(optional — tap any that fit)</span>
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {[...PRESET_TAGS, ...extras].map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={active}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
