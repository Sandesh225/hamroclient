import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Redirect authenticated users from login page
    if (path.startsWith("/login") && token) {
      const redirectUrl = token.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/staff";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // 2. Protect Admin views
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/staff", req.url));
    }

    // 3. Protect Staff views (Admins generally have access too)
    if (path.startsWith("/dashboard/staff") && token?.role !== "STAFF" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 4. Onboarding redirection
    if (token?.role === "STAFF") {
      const isProfileComplete = token.isProfileComplete;

      if (!isProfileComplete && !path.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      if (isProfileComplete && path.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/dashboard/staff", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Require authentication for dashboard and onboarding
        if (path.startsWith("/dashboard") || path.startsWith("/onboarding")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/onboarding"],
};
