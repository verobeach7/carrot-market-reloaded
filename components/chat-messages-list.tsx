"use client";

// initial messages를 가져와 실시간 서버에 연결
// 새 message가 들어오면 state에 추가

import { InitialChatMessages } from "@/app/chats/[id]/page";
import { saveMessage } from "@/app/chats/actions";
import { formatToTimeAgo } from "@/lib/utils";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* Step 1. Supabase url & public key */
const SUPABASE_URL = "https://ludtcgrfltawhjqshotg.supabase.co";
// use client 즉, client component에서는 .env파일을 사용할 수 없음
// const SUPABASE_PUBLIC_KEY = process.env.SUPABASE_PUBLIC_KEY;
const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZHRjZ3JmbHRhd2hqcXNob3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzE3NDQsImV4cCI6MjA0MTcwNzc0NH0.FIDrFUsVDwvpp4eIKFCUDoIpgvE9wJyWo14ihZ9NovY";

/* Step 2. create supabase client, 슈파베이스 초기화 및 채널 입장 */
const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY!);

interface IChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  chatRoomId: string;
  username: string;
  avatar: string;
}

export default function ChatMessagesList({
  initialMessages,
  userId,
  chatRoomId,
  username,
  avatar,
}: IChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");

  /* Step 4. useRef는 컴포넌트 내의 여러 함수 사이에서 데이터를 저장하고 공유하는 데에 굉장히 편리함 */
  // useRef()는 단순히 데이터를 넣을 상자를 제공해주는 역할을 함
  // useRef 안에는 수정 가능한 데이터가 들어가고 수정되어도 re-rendering이 발생하지 않게 됨
  // useRef는 단지 input 또는 form의 ref attribute로만 사용된다고 생각하지만 이는 잘못된 것
  // 즉, 컴포넌트가 어떠한 이유로 렌더링이 여러번 발생하더라도 데이터는 그대로 유지되며, useRef 자신의 데이터가 변경되더라도 랜더링을 다시 발생시키지 않음
  const channel = useRef<RealtimeChannel>();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
  const onSubmit = async (event: React.FormEvent) => {
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
    channel.current?.send({
      type: "broadcast",
      // event에 들어가는 것("message")과 채널을 만들 때 필터링 했던 event에 들어가는 것("message")이 일치해야 함
      event: "message",
      payload: {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username,
          avatar,
        },
      },
    });
    await saveMessage(message, chatRoomId);
    setMessage("");
  };

  /* useEffect내 코드는 판매자와 구매자 모두에게 적용됨, 즉 둘 다 동일한 채널에 있게됨 */
  // 시작할 때와 chatRoomId가 변경될 때만 useEffect가 작동하도록 함
  useEffect(() => {
    // 채팅방은 아무나 접근할 수 없어야 하기 때문에 고유하면서 아무도 추측할 수 없는 랜덤string으로 해야함
    // 채널에 참여
    // useRef를 사용하면서 const로 channel을 이미 생성하였으므로, 여기서는 const를 삭제하고 .current를 붙여줘야 함
    // TypeScript 에러가 발생하는 이유는 channel이 type이 지정되지 않은 ref라고 판단하기 때문임
    // useRef를 선언하는 곳에서 channel이 받을 type을 지정해주면 TypeScript 에러를 없앨 수 있음, 아래 channel의 return value의 type을 확인하여 useRef에 타입을 명시해 줄 것
    channel.current = client.channel(`room-${chatRoomId}`);
    // message라는 event가 우리에게 broadcast될 때 함수 실행
    // useRef를 사용하므로 여기서도 .current를 붙여줘야 함
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
      })
      .subscribe();
    /* Step 3. useEffect는 return 값을 주면 clean-up function으로 작동하게 할 수 있음 */
    // 해당 컴포넌트에서 나가면 더이상 subscribe를 해지하여 메모리 누수를 막아야 함
    return () => {
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);

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
