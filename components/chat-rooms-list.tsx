"use client";

import { InitialChatRooms } from "@/app/(tabs)/chat/page";
import { formatToTimeAgo } from "@/lib/utils";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SUPABASE_URL = "https://ludtcgrfltawhjqshotg.supabase.co";
const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZHRjZ3JmbHRhd2hqcXNob3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzE3NDQsImV4cCI6MjA0MTcwNzc0NH0.FIDrFUsVDwvpp4eIKFCUDoIpgvE9wJyWo14ihZ9NovY";

const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY!);

interface IChatRoomsListProps {
  initialChatRooms: InitialChatRooms;
  user: {
    username: string;
    avatar: string | null;
  };
}

// interface 내부 요소를 들여다보기 위해 {}를 이용해 객체로 넣기
export default function ChatRoomsList({
  initialChatRooms,
  user,
}: IChatRoomsListProps) {
  const [chatRooms, setChatRooms] = useState(initialChatRooms);

  // Ref로 실시간 채널을 관리하기 위한 배열 선언
  const channels = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    // 각 ChatRoom의 id를 이용해 채널을 생성
    chatRooms.forEach((chatRoom) => {
      const channel = client
        .channel(`room-${chatRoom.id}`)
        .on(
          "broadcast",
          {
            event: "message",
          },
          (payload) => {
            const newMessage = payload.payload as {
              id: number;
              payload: string;
              isRead: boolean;
              created_at: Date;
              updated_at: Date;
              chatRoomId: string;
              userId: number;
            };
            console.log(payload.payload);

            if (newMessage) {
              // 새 메시지가 삽입된 경우 채팅방 목록 업데이트
              setChatRooms((prevChatRooms) => {
                const newChatRooms = prevChatRooms.map((room) =>
                  room.id === chatRoom.id
                    ? {
                        ...room,
                        Messages: [newMessage],
                        _count: { Messages: room._count.Messages + 1 },
                      }
                    : room
                );

                // 새로운 채팅방 목록을 메시지의 created_at 시간 순으로 정렬
                newChatRooms.sort((a, b) => {
                  const createdAtA =
                    a.Messages.length > 0
                      ? new Date(a.Messages[0].created_at).getTime()
                      : new Date(0).getTime(); // Messages가 없으면 기본값
                  const createdAtB =
                    b.Messages.length > 0
                      ? new Date(b.Messages[0].created_at).getTime()
                      : new Date(0).getTime(); // Messages가 없으면 기본값
                  return createdAtB - createdAtA; // 최신 메시지가 먼저 오도록 정렬
                });

                return newChatRooms;
              });
            }
          }
        )
        .subscribe();

      // Ref에 생성한 채널 저장
      channels.current.push(channel);
    });

    // 컴포넌트 언마운트 시 모든 채널 구독 해제
    return () => {
      channels.current.forEach((channel) => {
        client.removeChannel(channel);
      });
    };
  }, [chatRooms]);
  return (
    <div className="p-10 pb-20 flex flex-col gap-5">
      {chatRooms.map((chatRoom) => (
        <Link
          href={`/chats/${chatRoom.id}`}
          key={chatRoom.id}
          className="flex justify-between mb-10 gap-20 *:text-white"
        >
          <div className="flex gap-20">
            <div className="relative z-0">
              <div className="absolute z-10 -top-3 -left-3 size-12 rounded-full bg-neutral-700">
                {chatRoom.users[0] === undefined ? (
                  <div className="size-12 rounded-full bg-neutral-400 flex items-center justify-center">
                    <Image
                      src={user.avatar!}
                      alt={user.username.slice(0, 1)}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                ) : chatRoom.users[0].avatar === null ? (
                  <div className="size-12 rounded-full bg-neutral-400 flex items-center justify-center">
                    {chatRoom.users[0].username.slice(0, 1)}
                  </div>
                ) : (
                  <Image
                    src={chatRoom.users[0].avatar!}
                    alt={chatRoom.users[0].username}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                )}
              </div>
              <div className="absolute z-20 top-4 left-4 size-12 rounded-md  border-2 border-neutral-900 overflow-hidden">
                <Image
                  src={`${chatRoom.product.photo}/smaller`}
                  alt="No photo"
                  fill
                  className="object-cover z-30"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 *:rounded-md">
              <div className="flex items-end gap-2">
                <span>
                  {chatRoom.users[0] === undefined
                    ? "나와의 채팅"
                    : chatRoom.users[0].username}
                </span>
                <span className="text-neutral-500 text-sm">
                  {chatRoom.Messages[0] === undefined
                    ? null
                    : formatToTimeAgo(
                        chatRoom.Messages[0].created_at.toString()
                      )}
                </span>
              </div>
              <div>
                <span>
                  {chatRoom.Messages[0] === undefined
                    ? "메시지가 없습니다."
                    : chatRoom.Messages[0].payload}
                </span>
              </div>
            </div>
          </div>
          {chatRoom.Messages[0] === undefined ||
          chatRoom.Messages[0].isRead ? null : (
            <div className="flex items-center justify-center">
              {chatRoom._count.Messages === 0 ? null : (
                <span className="px-2.5 pt-1 pb-1 text-xs bg-orange-500 rounded-xl">
                  {chatRoom._count.Messages}
                </span>
              )}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
