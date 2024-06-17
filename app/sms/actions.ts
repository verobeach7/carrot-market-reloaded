"use server";

import { z } from "zod";
import validator from "validator";

const phoneSchema = z.string().trim().refine(validator.isMobilePhone);

// coerce를 이용해 입력받은 값을 원하는 type으로 바꿔줄 수 있음
const tokenSchema = z.coerce.number().min(100000).max(999999);

export const smsLogin = async (prevState: any, formData: FormData) => {
  console.log(typeof formData.get("token"));
  console.log(typeof tokenSchema.parse(formData.get("token")));
};
