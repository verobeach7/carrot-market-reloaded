import { getChatRooms, getUser } from "./actions";
import Image from "next/image";
import { formatToTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { unstable_cache as nextCache } from "next/cache";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import ChatRoomsList from "@/components/chat-rooms-list";
import { notFound } from "next/navigation";

export type InitialChatRooms = Prisma.PromiseReturnType<typeof getChatRooms>;

export default async function Chat() {
  /* await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
 */

  const session = await getSession();

  const getCachedChatRooms = nextCache(getChatRooms, ["chatroom-list"], {
    tags: ["chatroom-list"],
  });

  const initialChatRooms = await getChatRooms(session.id!);

  const user = await getUser();
  if (!user) {
    return notFound();
  }

  // console.log(chatRooms[0].users[0].avatar);

  return <ChatRoomsList initialChatRooms={initialChatRooms} user={user} />;
}
