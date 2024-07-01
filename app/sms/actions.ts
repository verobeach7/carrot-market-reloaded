"use server";

import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format."
  );

// coerce를 이용해 입력받은 값을 원하는 type으로 바꿔줄 수 있음
const tokenSchema = z.coerce.number().min(100000).max(999999);

interface ActionState {
  token: boolean;
}

async function getToken() {
  // 임의의 수 생성
  const token = crypto.randomInt(100000, 999999).toString();
  // 이미 존재하는 token인지 확인
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  // 이미 존재하는 token이라면
  if (exists) {
    return getToken();
  } else {
    // 존재하지 않는 token이라면
    return token;
  }
}

export const smsLogin = async (prevState: ActionState, formData: FormData) => {
  const phone = formData.get("phone");
  const token = formData.get("token");
  if (!prevState.token) {
    /* Token을 보내기 전 상태: Token이 없으면 */
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      /* 전화번호 검증이 끝난 후 */
      // delete previous token
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      // create token
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });
      // send the token using twilio(SMS)
      return {
        token: true,
      };
    }
  } else {
    /* Token이 있으면 */
    const result = tokenSchema.safeParse(token);
    if (!result.success) {
      // console.log(result.error.flatten());
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      /* After verifying Token */
      redirect("/");
    }
  }
};
