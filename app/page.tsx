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

export default async function Home() {
  const supabase = supabaseAdmin();
  const { data: meditations } = await supabase
    .from("meditations")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });

  if (!meditations?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">No meditations available yet.</p>
      </div>
    );
  }

  const todayIndex = daysSinceEpochUTC() % meditations.length;
  const meditation = meditations[todayIndex];

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
