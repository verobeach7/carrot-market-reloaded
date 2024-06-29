import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  // Only the user logged in has a id
  id?: number;
}

export default function getSession() {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-carrot",
    // GitHub에 password가 올라가면 안되므로 .env에 password 저장
    // TypeScript에게 .env 안에 COOKIE_PASSWORD가 무조건 존재한다는 것 알려주기
    password: process.env.COOKIE_PASSWORD!,
  });
}
