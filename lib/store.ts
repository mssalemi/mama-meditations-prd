// Meditation storage on Vercel Blob. No database: the audio files are blobs,
// and the metadata is one small JSON blob beside them.
//
// This is the same bet as a static site — for a library measured in dozens of
// entries written by one or two people, a JSON document is simpler, cheaper and
// far less to maintain than a Postgres instance. Read-modify-write could race
// under concurrent writers; with two admins uploading a meditation a week it
// cannot realistically happen.
import { del, list, put } from "@vercel/blob";

const INDEX_PATH = "meditations.json";

export interface Meditation {
  id: string;
  title: string;
  quote: string | null;
  tags: string[];
  /** Public Blob URL of the audio. Unguessable random pathname. */
  audioUrl: string;
  mimeType: string;
  published: boolean;
  /** YYYY-MM-DD when pinned as the day's meditation, else null. */
  featuredOn: string | null;
  createdAt: string;
}

async function indexUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: INDEX_PATH, limit: 1 });
  return blobs[0]?.url ?? null;
}

export async function readAll(): Promise<Meditation[]> {
  const url = await indexUrl();
  if (!url) return [];
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read library: ${res.status}`);
  const parsed = await res.json();
  return Array.isArray(parsed) ? (parsed as Meditation[]) : [];
}

async function writeAll(meditations: Meditation[]): Promise<void> {
  await put(INDEX_PATH, JSON.stringify(meditations, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function addMeditation(input: {
  title: string;
  quote: string | null;
  tags: string[];
  file: File;
}): Promise<Meditation> {
  const ext = input.file.name.split(".").pop() || "m4a";
  const blob = await put(`audio/${Date.now()}.${ext}`, input.file, {
    access: "public",
    contentType: input.file.type,
    addRandomSuffix: true,
  });

  const meditation: Meditation = {
    id: crypto.randomUUID(),
    title: input.title,
    quote: input.quote,
    tags: input.tags,
    audioUrl: blob.url,
    mimeType: input.file.type,
    published: true,
    featuredOn: null,
    createdAt: new Date().toISOString(),
  };

  await writeAll([...(await readAll()), meditation]);
  return meditation;
}

export async function updateMeditation(
  id: string,
  updates: Partial<Pick<Meditation, "title" | "quote" | "tags" | "published" | "featuredOn">>,
): Promise<Meditation | null> {
  const all = await readAll();
  const target = all.find((m) => m.id === id);
  if (!target) return null;

  // Only one meditation can hold a given day.
  if (typeof updates.featuredOn === "string") {
    for (const m of all) {
      if (m.featuredOn === updates.featuredOn) m.featuredOn = null;
    }
  }

  Object.assign(target, updates);
  await writeAll(all);
  return target;
}

export async function deleteMeditation(id: string): Promise<boolean> {
  const all = await readAll();
  const target = all.find((m) => m.id === id);
  if (!target) return false;
  // Remove the audio too, or the store fills with files nothing references.
  await del(target.audioUrl).catch(() => {});
  await writeAll(all.filter((m) => m.id !== id));
  return true;
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The pinned meditation for today, else a stable daily rotation. */
export function pickForToday(published: Meditation[]): Meditation | null {
  if (published.length === 0) return null;
  const pinned = published.find((m) => m.featuredOn === todayUTC());
  if (pinned) return pinned;
  const daysSinceEpoch = Math.floor(Date.parse(`${todayUTC()}T00:00:00Z`) / 86_400_000);
  return published[daysSinceEpoch % published.length];
}
