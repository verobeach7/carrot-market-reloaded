import { notFound } from "next/navigation";
import { NextRequest } from "next/server";

// url에서 code를 받기 위해 request를 받아와야 함
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) notFound();
  // console.log(code);
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenUrl = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenData = await (
    await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("error" in accessTokenData) {
    return new Response(null, {
      status: 400,
    });
  }
  return Response.json({ accessTokenData });
}
