"use server";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { LogIn } from "@/lib/login";

function checkUsername(username: string) {
  return !username.includes("potato");
}

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

// Zod
const formSchema = z
  .object({
    username: z
      .string({
        // username으로 string이 아닌 다른 타입을 보내는 경우 발생
        invalid_type_error: "Username must be a string!",
        // required_error는 검증데이터에 username 자체가 없을 때 발생
        required_error: "Where is my username?",
      })
      .toLowerCase()
      .trim()
      // .transform((username) => `🔥 ${username} 🔥`)
      .refine(
        // (username) => (username.includes("potato") ? false : true),
        // (username) => !username.includes("potato"),
        // zod이 알아서 checkUsername함수의 인자로 username을 보냄
        checkUsername,
        "No potato allowed!"
      ),
    // checkUniqueUsername함수는 async-await 사용
    email: z
      .string({
        invalid_type_error: "Please enter a valid email address.",
        required_error: "Email address is required.",
      })
      .email()
      // .trim() // email()은 자동으로 trim()해주는 기능이 있음
      .toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters long.")
      .max(
        PASSWORD_MAX_LENGTH,
        "Password must be no more than 24 characters long."
      ),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH),
  })
  // data는 object(username, email, password, confirm_password)임
  // {}을 이용해 꺼내올 수 있음
  // .superRefine((data, ctx) => {});
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken.",
        path: ["username"],
        fatal: true, // fatal issue 생성
      });
      return z.NEVER; // NEVER를 반환
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken.",
        path: ["email"],
        fatal: true, // fatal issue 생성
      });
      return z.NEVER; // NEVER를 반환
    }
  })
  // fatal issue로 NEVER를 반환하면 .superRefine 이후의 다른 .refine은 실행하지 않음
  .refine(checkPasswords, {
    message: "Both password should be the same!",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
  // formSchema는 Zod을 사용, 내부에 async-await을 사용하고 있기 때문에 formScema를 호출할 때도 safeParseAsync를 사용해야 함
  // saveParseAsync는 이름이 길기 때문에 spa로 줄여서 사용 가능
  // spa: alias of safeParseAsync
  const result = await formSchema.spa(data);
  if (!result.success) {
    // console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    /* hash password */
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    console.log(hashedPassword);
    /* save the user to db */
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    await LogIn(user.id);
    redirect("/profile");
  }
}
