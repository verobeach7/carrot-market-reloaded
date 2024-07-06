"use server";

import twilio from "twilio";
import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { LogIn } from "@/lib/login";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format."
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return Boolean(exists);
}

// coerce를 이용해 입력받은 값을 원하는 type으로 바꿔줄 수 있음
const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "This token does not exist.");

interface ActionState {
  token: boolean;
  phone?: string;
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
  const phone = formData.get("phone") as string | undefined;
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
      // save the token on db.sMSToken
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              // db에 이미 전화번호가 같은 사용자가 있으면 token과 user 연결
              where: {
                phone: result.data,
              },
              // db에 이 전화번호를 사용하는 사용자가 없으면 새로운 user 생성
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });
      // send the token using twilio(SMS)
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        body: `Your Carrot Market verification code is ${token}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        // to: result.data // 누구의 번호든 가능해야 하지만 체험판이어서 내가 가입한 번호로만 문자전송 가능
        to: process.env.TWILIO_MY_PHONE_NUMBER!,
      });
      return {
        token: true,
        phone,
      };
    }
  } else {
    /* Token이 있으면 */
    const result = await tokenSchema.spa(token);
    if (!result.success) {
      // console.log(result.error.flatten());
      return {
        ...prevState,
        error: result.error.flatten(),
      };
    } else {
      /* After verifying Token */
      // get the userId of the token
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
          user: true,
        },
      });
      if (prevState.phone !== token?.user.phone)
        return { ...prevState, error: { formErrors: ["Invalid token."] } };
      // token이 있다는 것이 위에서 검증됐으므로 ! 이용하여 TypeScript에게 확실히 있음을 알리기
      await LogIn(token!.userId);
      // 사용 완료한 token db에서 지우기
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });
      // log the user in
      redirect("/profile");
    }
  }
};
