import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "mechtrak_session";
const PUBLIC_PATHS = ["/login", "/signup", "/", "/api/auth"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await hasValidSession(token);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
