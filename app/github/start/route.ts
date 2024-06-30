import { NextResponse } from "next/server";

// 어차피 사용자는 url을 다 볼 수 있으니 여기서 하는 작업은 비밀이 아님
// 별도의 파일로 분리해 놓음으로써 components/social-login.tsx의 Link href를 깨끗하게 유지할 수 있음
export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user,user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return NextResponse.redirect(finalUrl);
}
