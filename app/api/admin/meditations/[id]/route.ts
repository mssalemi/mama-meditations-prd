import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-check";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await supabaseServer();
  const auth = await requireAdmin(supabase);
  if (!auth.allowed) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, string> = {};

  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.quote === "string") updates.quote = body.quote;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("meditations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await supabaseServer();
  const auth = await requireAdmin(supabase);
  if (!auth.allowed) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  // Fetch the row to get storage_path
  const { data: meditation, error: fetchError } = await supabase
    .from("meditations")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !meditation) {
    return NextResponse.json(
      { error: "Meditation not found" },
      { status: 404 },
    );
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("meditations")
    .remove([meditation.storage_path]);

  if (storageError) {
    return NextResponse.json(
      { error: storageError.message },
      { status: 500 },
    );
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("meditations")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
