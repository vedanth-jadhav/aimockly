import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/scan(.*)",
  "/results(.*)",
  "/tutor(.*)",
]);

// Auth routes - redirect authenticated users away
const isAuthRoute = createRouteMatcher([
  "/auth/signin",
  "/auth/signup",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Redirect unauthenticated users from protected routes to sign in
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/auth/signin");
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthRoute(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
