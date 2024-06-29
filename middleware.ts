import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

export async function middleware(request: NextRequest) {
  // console.log(request.cookies.getAll());
  console.log(cookies());
  const session = await getSession();
  console.log(session);
  if (request.nextUrl.pathname === "/profile") {
    /* return Response.json({
      error: "you are not allowed here!",
    }); */
    // return Response.redirect(new URL("/", request.url));
    // NextResponse는 Response의 확장형
    return NextResponse.redirect(new URL("/", request.url));
  }
}
