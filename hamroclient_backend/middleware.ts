import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Redirect logged-in users away from the login page
    if (path.startsWith("/login") && token) {
      const redirectUrl = token.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/staff";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // 2. Protect Admin strictly
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      // Send Staff trying to view Admin back to Staff dashboard
      return NextResponse.redirect(new URL("/dashboard/staff", req.url));
    }

    // 3. Protect Staff views (Admins generally have access too)
    if (path.startsWith("/dashboard/staff") && token?.role !== "STAFF" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url)); 
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Require authentication for all dashboard routes
        if (path.startsWith("/dashboard")) {
          return !!token;
        }

        // Allow public pages (like /login)
        return true;
      },
    },
  }
);

export const config = {
  // Apply middleware only to specific paths
  matcher: ["/dashboard/:path*", "/login"],
};
