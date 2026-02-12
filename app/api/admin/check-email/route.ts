import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!allowed.includes(email.toLowerCase())) {
    return NextResponse.json({ allowed: false });
  }

  return NextResponse.json({ allowed: true });
}
