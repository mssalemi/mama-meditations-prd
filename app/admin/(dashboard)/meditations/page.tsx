import Link from "next/link";
import { readAll } from "@/lib/store";
import MeditationList from "../../meditation-list";

export const dynamic = "force-dynamic";

export default async function MeditationsPage() {
  const all = await readAll();
  const meditationsWithUrls = [...all]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((m) => ({
      id: m.id,
      title: m.title,
      quote: m.quote,
      tags: m.tags,
      audio_url: m.audioUrl,
      created_at: m.createdAt,
      featured_on: m.featuredOn,
    }));

  return (
    <>
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Meditations</span>
      </nav>

      <MeditationList meditations={meditationsWithUrls} />
    </>
  );
}
