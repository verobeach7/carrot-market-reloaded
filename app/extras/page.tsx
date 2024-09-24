import HackedComponent from "@/components/hacked-component";
import { Message } from "firebase-functions/v1/pubsub";
import { revalidatePath } from "next/cache";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";

async function getData() {
  const keys = {
    apiKey: "119119119", // 공개되어도 되는 key
    secret: "top-secret", // 공개되어서는 안 되는 key
  };
  /* first argument: Error Message
  second argument: Secret object */
  // experimental_taintObjectReference("API keys were leaked!!!", keys);

  /*  */
  experimental_taintUniqueValue("Secret key was exposed.", keys, keys.secret);

  // 현재까지는 server 내에 있기 때문에 return해도 아무 상관없음
  return keys;
}

// Client Component로 data가 전달되면서 에러 발생
export default async function Extras() {
  const data = await getData();
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-rubik">Extras!</h1>
      <h1 className="text-6xl font-metallica">Extras!</h1>
      <h2 className="font-roboto">So much more to learn!</h2>
      <HackedComponent data={data} />
    </div>
  );
}
