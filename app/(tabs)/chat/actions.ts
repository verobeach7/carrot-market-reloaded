"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";

export async function getChatRooms(userId: number) {
  const chatRooms = await db.chatRoom.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      Messages: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
      },
      _count: {
        select: {
          Messages: {
            where: {
              isRead: false,
              userId: {
                not: userId, // 로그인 유저의 메시지가 아닌 경우
              },
            },
          },
        },
      },
      users: {
        where: {
          id: {
            not: userId,
          },
        },
        select: {
          avatar: true,
          username: true,
        },
      },
      product: {
        select: {
          photo: true,
        },
      },
    },
  });
  // console.log(chatRooms[0].Messages[0].created_at);

  // 최근 메시지(created_at)를 기준으로 정렬
  chatRooms.sort((a, b) => {
    const messageA = a.Messages[0]?.created_at || new Date(0); // 메시지가 없을 때 대비
    const messageB = b.Messages[0]?.created_at || new Date(0);
    return messageB.getTime() - messageA.getTime(); // 내림차순 정렬 (최신순)
  });

  return chatRooms;
}

export async function getUser() {
  const session = await getSession(); // 브라우저의 cookie를 가져옴
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        avatar: true,
        username: true,
      },
    });
    if (user) return user;
  }
  // nextJS의 기능
  // session에 id가 없거나 user를 찾을 수 없는 경우 not found를 trigger 함
  notFound();
}
