import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import MeditationList from "../../meditation-list";

export const dynamic = "force-dynamic";

export default async function MeditationsPage() {
  const supabase = await supabaseServer();
  const { data: meditations } = await supabase
    .from("meditations")
    .select("*")
    .order("created_at", { ascending: false });

  // Generate signed URLs for private-bucket audio playback
  const paths = (meditations ?? []).map((m) => m.storage_path);
  const { data: signedUrls } = await supabase.storage
    .from("meditations")
    .createSignedUrls(paths, 3600);

  const meditationsWithUrls = (meditations ?? []).map((m, i) => ({
    ...m,
    audio_url: signedUrls?.[i]?.signedUrl ?? "",
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
