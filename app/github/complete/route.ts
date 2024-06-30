import db from "@/lib/db";
import getAccessToken from "@/lib/github/get-access-token";
import getUserEmail from "@/lib/github/get-user-email";
import getUserProfile from "@/lib/github/get-user-profile";
import { LogIn } from "@/lib/login";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// url에서 code를 받기 위해 request를 받아와야 함
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code)
    return new Response(null, {
      status: 400,
    });
  const { error, access_token } = await getAccessToken(code);
  if (error) {
    // 에러가 발생했음을 알리고 새로운 페이지로 redirect 할 수 있도록 하는 등 더 세밀한 처리 필요, 우선은 지금처럼 처리, 사용자 경험을 좋게 만들어 줄 필요 있음
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
  } = await getUserProfile(access_token);
  // 사용자가 있는지 검색
  const email = await getUserEmail(access_token);
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
    await LogIn(user.id);
    return redirect("/profile");
  } else {
    const existUsername = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    // 사용자가 없다면 사용자를 db에 추가하고 로그인
    const newUser = await db.user.create({
      data: {
        username: existUsername ? `${username}#gh${id}` : username,
        email,
        github_id: id + "", // Integer가 String으로 바뀜
        avatar: avatar_url,
      },
      select: {
        id: true,
      },
    });
    await LogIn(newUser.id);
  }
  return redirect("/profile");
}
