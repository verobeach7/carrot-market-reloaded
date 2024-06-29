import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 단순 url string
  console.log(request.url);
  // Next에서 생성해 놓은 Object로 여러가지 properies를 이미 가지고 있음
  console.log(request.nextUrl);
}
