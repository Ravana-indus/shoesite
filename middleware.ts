import { createClient } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = createClient(request);

  // Refresh auth session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Guard /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow /admin/login without auth
    if (request.nextUrl.pathname === "/admin/login") {
      // If already logged in, redirect to /admin
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Require authentication
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check admin role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      // Not admin — redirect to storefront home
      return NextResponse.redirect(new URL("/", request.url));
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