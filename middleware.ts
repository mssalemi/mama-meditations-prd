import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always refresh the session so tokens stay valid
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Let login and not-authorized pages through without checks
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/not-authorized"
  ) {
    return response;
  }

  // No session → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Session exists → check allowlist
  const { data: allowed } = await supabase
    .from("admin_allowlist")
    .select("email")
    .eq("email", user.email!)
    .maybeSingle();

  if (!allowed) {
    return NextResponse.redirect(
      new URL("/admin/not-authorized", request.url),
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
