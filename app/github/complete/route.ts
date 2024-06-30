import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
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
  // Post Request: header를 추가하여 response를 json으로 받을 수 있음
  const { error, access_token } = await (
    await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  // Get Request: user profile 가져오기
  // 서버에서 발생하는 작업으로 여러 사용자가 사용해야 하므로 cache해서는 안됨
  const {
    id,
    avatar_url,
    login: username,
  } = await (
    await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-cache",
    })
  ).json();
  // 사용자가 있는지 검색
  const user = await db.user.findUnique({
    where: {
      github_id: id + "", // Integer가 String으로 바뀜
    },
    select: {
      id: true,
    },
  });
  // 사용자가 이미 있다면 로그인
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }
  // 사용자가 없다면 사용자를 db에 추가하고 로그인
  const newUser = await db.user.create({
    data: {
      username,
      github_id: id + "", // Integer가 String으로 바뀜
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}
