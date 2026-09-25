import { NextRequest, NextResponse } from "next/server";
import { deleteMeditation, updateMeditation } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const updates: Parameters<typeof updateMeditation>[1] = {};

  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.quote === "string") updates.quote = body.quote;
  if (Array.isArray(body.tags)) updates.tags = body.tags;
  if (typeof body.published === "boolean") updates.published = body.published;
  // null clears the pin; a YYYY-MM-DD string makes this today's meditation.
  if (body.featuredOn === null || typeof body.featuredOn === "string") {
    updates.featuredOn = body.featuredOn;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updated = await updateMeditation(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[meditations] update failed:", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const removed = await deleteMeditation(id);
    if (!removed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[meditations] delete failed:", err);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
