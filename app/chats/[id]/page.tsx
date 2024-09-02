import db from "@/lib/db";
import getSession from "@/lib/session";
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

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  return <h1>chat!!!!!</h1>;
}
