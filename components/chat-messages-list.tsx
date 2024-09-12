"use client";

// initial messages를 가져와 실시간 서버에 연결
// 새 message가 들어오면 state에 추가

import { InitialChatMessages } from "@/app/chats/[id]/page";
import { formatToTimeAgo } from "@/lib/utils";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useState } from "react";

// Step 1. Supabase url & public key
const SUPABASE_URL = "https://ludtcgrfltawhjqshotg.supabase.co";
const SUPABASE_PUBLIC_KEY = process.env.SUPABASE_PUBLIC_KEY;

interface IChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  chatRoomId: string;
}

export default function ChatMessagesList({
  initialMessages,
  userId,
  chatRoomId,
}: IChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        // DB로부터 id를 받은 것이 아니기 때문에 fake id를 만들어 사용
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username: "string",
          avatar: "xxx",
        },
      },
    ]);
    setMessage("");
  };

  // 시작할 때만 useEffect가 작동하도록 함
  useEffect(() => {
    // Step 2. create supabase client
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY!);
    // 채팅방은 아무나 접근할 수 없어야 하기 때문에 고유하면서 아무도 추측할 수 없는 랜덤string으로 해야함
    const channel = client.channel(`room-${chatRoomId}`);
    channel.on("broadcast", { event: "message" }, (payload) => {
      console.log(payload);
    });
  }, []);

  return (
    // 메시지를 아래서부터 채워지게 하기 위해서 스크린 최소 사이즈를 정해주고 아래쪽부터 채워주게 함
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.user.avatar === null ? (
            <div className="size-8 rounded-full bg-neutral-400 flex items-center justify-center">
              {message.user.username.slice(0, 1)}
            </div>
          ) : message.userId === userId ? null : (
            <Image
              src={message.user.avatar!}
              alt="{message.user.username}"
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <span
              className={`${
                message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
              } p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span className="text-xs">
              {formatToTimeAgo(message.created_at.toString())}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
