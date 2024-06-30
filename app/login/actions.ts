"use server";

import bcrypt from "bcrypt";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { LogIn } from "@/lib/login";

const checkEmailExist = async (email: string) => {
  /* find a user with the email */
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  /* if (user) {
    return true;
  } else {
    return false;
  } */
  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string({ required_error: "E-mail is required." })
    .email()
    .toLowerCase()
    .refine(checkEmailExist, "An account with this email does not exist."),
  password: z
    .string({
      required_error: "Password is required.",
    })
    // .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH),
  // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

/* Server Actions */
export const login = async (prevState: any, formData: FormData) => {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = await formSchema.spa(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    /* if the user is found, check password hash */
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true, // 로그인 성공 시 session에 유저의 id 저장
        password: true, // 암호를 비교하기 위해 db의 해시된 비밀번호를 가져옴
      },
    });
    // github 로그인, 전화번호 가입한 경우 암호가 없을 수도 있음
    // !를 붙여줘도 에러가 발생하는 이유 -> prisma의 schema에 User model을 보면 password가 string? 으로 되어있어 string | null 일 수 있기 때문
    //  ?? "": 암호가 없는 경우 임시로 ""로 공백 처리함. 나중에 해결책 제시할 것임
    // 즉, 현재 상태는 다른 방식으로 가입한 경우 메일,비번 로그인 시 공백과 비교하게 되므로 false를 반환하게 됨 -> 로그인 실패
    const ok = await bcrypt.compare(result.data.password, user!.password ?? "");
    // console.log(ok);
    /* log the user in and redirect "/profile"*/
    if (ok) {
      await LogIn(user!.id);
      redirect("/profile");
    } else {
      // zod인척 zod이 return하는 형태로 return을 해주면 에러를 보여줄 수 있음
      return {
        fieldErrors: {
          password: ["Wrong password."],
          email: [],
        },
      };
    }
  }
};
