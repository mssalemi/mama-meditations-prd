import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { addMeditationFromUrl } from "@/lib/store";

/** Saves metadata for an audio file the browser uploaded directly to Blob. */
export async function POST(req: NextRequest) {
  if (!(await requireSession(req.cookies))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.audioUrl) {
    return NextResponse.json(
      { error: "Title and audio are required" },
      { status: 400 },
    );
  }

  try {
    await addMeditationFromUrl({
      title: String(body.title),
      quote: body.quote ? String(body.quote) : null,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      audioUrl: String(body.audioUrl),
      mimeType: String(body.mimeType ?? "audio/mpeg"),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[meditations] save failed:", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
