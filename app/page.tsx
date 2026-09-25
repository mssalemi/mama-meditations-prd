import { supabaseAdmin } from "@/lib/supabase";
import AudioPlayer from "./audio-player";

export const dynamic = "force-dynamic";

function daysSinceEpochUTC() {
  const now = new Date();
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      (1000 * 60 * 60 * 24),
  );
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Home() {
  const supabase = supabaseAdmin();
  const { data: meditations, error } = await supabase
    .from("meditations")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });

  // Discarding this error once cost real debugging time: when the Supabase
  // project was deleted, every query failed and the page rendered the friendly
  // "no meditations yet" state, so the site looked merely empty rather than
  // disconnected. Backend down and library empty are different problems.
  if (error) {
    console.error("[meditations] query failed:", error.message);
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <main className="flex max-w-sm flex-col items-center gap-3 text-center">
          <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-400">
            Daily Meditations
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Today&apos;s meditation is taking a breath.
          </p>
          <p className="text-sm text-zinc-400">
            Something went wrong on our end. Please try again shortly.
          </p>
        </main>
      </div>
    );
  }

  if (!meditations?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <main className="flex max-w-sm flex-col items-center gap-3 text-center">
          <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-400">
            Daily Meditations
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            The first meditation is on its way.
          </p>
          <p className="text-sm text-zinc-400">
            Check back soon — a new one plays here every day.
          </p>
        </main>
      </div>
    );
  }

  // A meditation pinned to today wins; otherwise everything rotates so each day
  // lands on a different one. `featured_on` may not exist yet on older
  // databases, hence the optional read rather than a filtered query.
  const pinned = meditations.find(
    (m) => (m as { featured_on?: string | null }).featured_on === todayUTC(),
  );
  const todayIndex = daysSinceEpochUTC() % meditations.length;
  const meditation = pinned ?? meditations[todayIndex];

  // Generate a signed URL for private-bucket audio playback
  const { data: signedUrlData } = await supabase.storage
    .from("meditations")
    .createSignedUrl(meditation.storage_path, 3600);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-400">
          Today&apos;s Meditation
        </h1>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {meditation.title}
        </h2>

        {meditation.quote && (
          <p className="text-lg italic text-zinc-500">
            &ldquo;{meditation.quote}&rdquo;
          </p>
        )}

        <AudioPlayer src={signedUrlData?.signedUrl ?? ""} />

        {signedUrlData?.signedUrl && (
          <a
            href={signedUrlData.signedUrl}
            download={`${meditation.title}.m4a`}
            className="text-sm font-medium text-zinc-400 underline hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Download
          </a>
        )}

      </main>
    </div>
  );
}
