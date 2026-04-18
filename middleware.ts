import { createClient } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const supabase = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/logout") {
      if (session && !request.nextUrl.searchParams.has('redirect')) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!session) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};