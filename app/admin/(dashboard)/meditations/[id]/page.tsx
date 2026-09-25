import { notFound } from "next/navigation";
import { readAll } from "@/lib/store";
import MeditationDetail from "./meditation-detail";

export const dynamic = "force-dynamic";

export default async function MeditationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meditation = (await readAll()).find((m) => m.id === id);

  if (!meditation) {
    notFound();
  }

  return (
    <MeditationDetail
      meditation={{
        id: meditation.id,
        title: meditation.title,
        quote: meditation.quote,
        tags: meditation.tags,
        transcription: null,
        audio_url: meditation.audioUrl,
        created_at: meditation.createdAt,
      }}
    />
  );
}
