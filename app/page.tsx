import { pickForToday, readAll } from "@/lib/store";
import AudioPlayer from "./audio-player";

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex max-w-sm flex-col items-center gap-3 text-center">
        <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-400">
          Daily Meditations
        </h1>
        {children}
      </main>
    </div>
  );
}

export default async function Home() {
  let meditation = null;
  let failed = false;

  try {
    const all = await readAll();
    meditation = pickForToday(all.filter((m) => m.published));
  } catch (err) {
    // Never let a storage failure render as "no meditations yet" — an outage
    // and an empty library are different problems and must look different.
    console.error("[meditations] could not load library:", err);
    failed = true;
  }

  if (failed) {
    return (
      <Shell>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          Today&apos;s meditation is taking a breath.
        </p>
        <p className="text-sm text-zinc-400">
          Something went wrong on our end. Please try again shortly.
        </p>
      </Shell>
    );
  }

  if (!meditation) {
    return (
      <Shell>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          The first meditation is on its way.
        </p>
        <p className="text-sm text-zinc-400">
          Check back soon — a new one plays here every day.
        </p>
      </Shell>
    );
  }

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

        <AudioPlayer src={meditation.audioUrl} />

        <a
          href={meditation.audioUrl}
          download={`${meditation.title}.m4a`}
          className="text-sm font-medium text-zinc-400 underline hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Download
        </a>
      </main>
    </div>
  );
}
