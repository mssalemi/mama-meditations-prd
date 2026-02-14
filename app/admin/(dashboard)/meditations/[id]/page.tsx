import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import MeditationDetail from "./meditation-detail";

export const dynamic = "force-dynamic";

export default async function MeditationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: meditation, error } = await supabase
    .from("meditations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !meditation) {
    notFound();
  }

  const { data: signedUrlData } = await supabase.storage
    .from("meditations")
    .createSignedUrl(meditation.storage_path, 3600);

  return (
    <MeditationDetail
      meditation={{
        id: meditation.id,
        title: meditation.title,
        quote: meditation.quote,
        tags: meditation.tags ?? [],
        transcription: meditation.transcription ?? null,
        audio_url: signedUrlData?.signedUrl ?? "",
        created_at: meditation.created_at,
      }}
    />
  );
}
