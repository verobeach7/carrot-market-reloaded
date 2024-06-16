"use server";

import { z } from "zod";

// At least one uppercase letter, one lowercase letter, one number and one special character
const passwordRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);

/* function checkUsername(username: string) {
  return !username.includes("potato");
} */
const checkUsername = (username: string) => !username.includes("potato");

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        // username으로 string이 아닌 다른 타입을 보내는 경우 발생
        invalid_type_error: "Username must be a string!",
        // required_error는 검증데이터에 username 자체가 없을 때 발생
        required_error: "Where is my username?",
      })
      .min(3, "Way too short!!!")
      .max(10, "That is too long!!!")
      .toLowerCase()
      .trim()
      .transform((username) => `🔥 ${username} 🔥`)
      .refine(
        // (username) => (username.includes("potato") ? false : true),
        // (username) => !username.includes("potato"),
        // zod이 알아서 checkUsername함수의 인자로 username을 보냄
        checkUsername,
        "No potato allowed!"
      ),
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
      .min(8, "Password must be at least 8 characters long.")
      .max(24, "Password must be no more than 24 characters long.")
      .regex(
        passwordRegex,
        "A password must have lowercase, UPPERCASE, a number and special characters."
      ),
    confirm_password: z.string().min(8).max(24),
  })
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
  const result = formSchema.safeParse(data);
  if (!result.success) {
    // console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
