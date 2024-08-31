"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

// 옮기기 전에는 id를 url에서 받아왔으나 이제는 url에서 받을 수 없으므로 함수를 호출하는 곳에서 argument를 전달받아야 함.
export const likePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        postId,
        userId: session.id!,
      },
    });
    // 아래와 같이 tag를 사용하면 Cache된 모든 글의 like-status가 한번에 갱신됨.
    // revalidateTag("like-status");
    revalidateTag(`like-status-${postId}`);
  } catch (e) {}
};

export const dislikePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));
  const session = await getSession();
  try {
    await db.like.delete({
      where: {
        id: {
          postId,
          // TypeScript Error: session.id는 로그인 한 경우에만 존재하기 때문에 TypeScript가 session.id가 없을 수도 있음을 인식하는 것
          // 우리는 로그인하지 않은 경우 이 페이지에 올 수 없음을 알고 있기 때문에 !를 붙여 에러를 없앨 수 있음
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {}
};
