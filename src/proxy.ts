import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isPublicPetPage = pathname.startsWith("/public/pet/");
  const isPublicRegistrationPage = pathname === "/tutores/new" || pathname === "/veterinarios/new";

  if (isPublicPetPage || isPublicRegistrationPage) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = `${pathname}${search}`;

    if (nextPath && nextPath !== "/") {
      loginUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
