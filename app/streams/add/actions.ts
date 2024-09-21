"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

// validation을 원하는 경우 zod을 이용하여 검증할 수 있음
const title = z.string();

// form으로부터 formData를 받아옴
export async function startStream(_: any, formData: FormData) {
  // formData에서 name이 title인 tag의 value를 가져옴
  const results = title.safeParse(formData.get("title"));
  // validation에 실패하는 경우 error를 return함
  if (!results.success) {
    return results.error.flatten();
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      // body의 내용은 json형태로 보내야 함
      body: JSON.stringify({
        meta: {
          name: results.data,
        },
        recording: {
          mode: "automatic",
        },
      }),
    }
  );
  const data = await response.json();
  const session = await getSession();
  const stream = await db.liveSteam.create({
    data: {
      title: results.data,
      stream_id: data.result.uid,
      stream_key: data.result.rtmps.streamKey,
      userId: session.id!,
    },
    select: {
      id: true,
    },
  });
  redirect(`/streams/${stream.id}`);
}
