import { NextRequest, NextResponse } from "next/server";
import { addMeditation } from "@/lib/store";

// iPhone voice memos arrive with a surprising spread of types, so this stays
// permissive — the auth gate is the middleware, not the MIME list.
const ALLOWED_MIME = [
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg",
  "audio/aac", "audio/x-m4a", "audio/mp4a-latm", "audio/x-caf", "audio/m4a",
  "audio/x-aac", "audio/webm",
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const quote = (formData.get("quote") as string) || null;
  const tags = ((formData.get("tags") as string) || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!file || !title) {
    return NextResponse.json(
      { error: "Title and audio file are required" },
      { status: 400 },
    );
  }

  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `That file type isn't supported (${file.type}).` },
      { status: 400 },
    );
  }

  try {
    await addMeditation({ title, quote, tags, file });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
