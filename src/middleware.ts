import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/(.*)"],
});

// Optionally, you can specify which routes this middleware applies to
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}