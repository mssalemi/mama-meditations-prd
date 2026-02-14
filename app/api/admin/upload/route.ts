import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-check";

const ALLOWED_MIME = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/aac", "audio/x-m4a", "audio/mp4a-latm", "audio/x-caf", "audio/m4a", "audio/x-aac", "audio/webm"];

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const auth = await requireAdmin(supabase);
  if (!auth.allowed) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const quote = (formData.get("quote") as string) || null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!file || !title) {
    return NextResponse.json({ error: "Title and audio file are required" }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid audio type: ${file.type}. Allowed: ${ALLOWED_MIME.join(", ")}` },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "mp3";
  const storagePath = `audio/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("meditations")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Store the path-based URL as a reference (bucket is private, so use signed URLs for playback)
  const { data: urlData } = supabase.storage
    .from("meditations")
    .getPublicUrl(storagePath);

  const { error: dbError } = await supabase.from("meditations").insert({
    title,
    quote,
    tags,
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    mime_type: file.type,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
