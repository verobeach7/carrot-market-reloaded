"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

export async function saveMessage(payload: string, chatRoomId: string) {
  const session = await getSession();
  const message = await db.message.create({
    data: {
      payload,
      chatRoomId,
      userId: session.id!,
    },
    select: {
      id: true,
    },
  });
}

export async function updateMessagesAsRead(chatRoomId: string, userId: number) {
  const unreadMessages = await db.message.findMany({
    where: {
      chatRoomId,
      userId: {
        not: userId,
      },
      isRead: false,
    },
  });

  // isRead가 false인 messages를 찾아서 isRead를 true로 수정
  if (unreadMessages.length > 0) {
    await db.message.updateMany({
      where: {
        chatRoomId,
        userId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
