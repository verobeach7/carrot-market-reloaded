"use client";

import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { handleForm } from "./actions";

export default function LogIn() {
  // useFormState는 결과를 알고싶은 action을 인자로 넘겨줘야 함
  // initialValue를 보통 null로 설정함
  const [state, action] = useFormState(handleForm, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          errors={[]}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          // state가 초기에 null로 되어있기 때문에 없을 수도 있음 -> Optional로 설정
          // state에 error가 없다면 빈 배열로 대체
          errors={state?.errors ?? []}
        />
        <FormButton text="Login" />
      </form>
      <SocialLogin />
    </div>
  );
}
