import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

// Both the pages AND the admin API must be matched. A previous version matched
// only "/admin/:path*", which left every /api/admin/* route wide open — an
// unauthenticated POST to /api/admin/upload succeeded.
const PUBLIC_PATHS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  if (!(await isValidSession(request.cookies.get(SESSION_COOKIE)?.value))) {
    // APIs get a status; pages get sent to the login screen.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
