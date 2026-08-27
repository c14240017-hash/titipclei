import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("Admin auth configuration error", { route: request.nextUrl.pathname, operation: "read-session", message: "AUTH_SECRET is not configured" });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  try {
    const token = await getToken({ req: request, secret });
    if (!token || token.role !== "ADMIN") return NextResponse.redirect(new URL("/admin/login", request.url));
  } catch (error) {
    console.error("Admin session validation failed", { route: request.nextUrl.pathname, operation: "read-session", name: error instanceof Error ? error.name : "UnknownError", message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
