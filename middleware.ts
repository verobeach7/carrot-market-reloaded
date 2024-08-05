import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

/* interface Routes {
  [key: string]: boolean;
}

// Array에서 존재 여부를 확인하는 것보다 Object에서 확인하는 것이 성능이 더 좋음
const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    return NextResponse.redirect(new URL("/products", request.url));
  }
} */

const publicUrls = new Set([
  "/",
  "/login",
  "/sms",
  "/create-account",
  "/github/start",
  "/github/complete",
]);

export async function middleware(request: NextRequest) {
  const isPublicPath = publicUrls.has(request.nextUrl.pathname);
  const isLoggedIn = Boolean((await getSession()).id);

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
