import ChatMessagesList from "@/components/chat-messages-list";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

async function getRoom(id: string) {
  // db에서 chatroom을 검색
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    // chatroom의 users에 해당하는 것을 포함
    include: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });
  // 로그인한 유저가 이 방의 참여자가 아닌 경우 chatroom에 들어갈 수 없도록 함
  if (room) {
    const session = await getSession();
    // user는 room.users 안에 있는 object를 말함: { id: 1 }
    // find는 user를 주거나 undefined를 줌
    const canSee = Boolean(room.users.find((user) => user.id === session.id));
    if (!canSee) {
      return null;
    }
  }
  return room;
}

async function getMessages(chatRoomId: string) {
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

// Prisma 함수가 반환하는 데이터의 타입
export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  /* products의 무한스크롤 방식을 사용해 실시간 채팅 코딩 */
  // 초기 메시지는 새로고침하거나 채팅방에 처음 들어왔을 때 메시지를 가져와 보여주는 것
  // state에 저장하여 새로운 메시지가 발생했을 때 state를 갱신하여 보여줄 수 있어야 함
  const initialMessages = await getMessages(params.id);
  const session = await getSession();

  return (
    <ChatMessagesList userId={session.id!} initialMessages={initialMessages} />
  );
}
