import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/api/visitors",
  "/api/payment-info",
]);

export default clerkMiddleware((auth, req) => {
  // 🔒 هذا هو الشكل الصحيح للحماية
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/api/(.*)",
  ],
};