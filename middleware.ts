import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute: (req: NextRequest) => boolean = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth: ClerkMiddlewareAuth, request: NextRequest): NextResponse | void => {
  const url: NextURL = request.nextUrl.clone();

  if (url.pathname === "/") {
    if (auth().userId) {
      url.pathname = "/create";
      return NextResponse.redirect(url);
    } else {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};