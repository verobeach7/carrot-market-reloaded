import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

async function getUser() {
  const session = await getSession(); // 브라우저의 cookie를 가져옴
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) return user;
  }
  // nextJS의 기능
  // session에 id가 없거나 user를 찾을 수 없는 경우 not found를 trigger 함
  notFound();
}

async function Username() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const user = await getUser();
  return <h1>Welcome! {user?.username}</h1>;
}

// getUser는 Promise이기 때문에 async-await 반드시 필요
export default async function Profile() {
  // inline server action
  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div>
      <Suspense fallback={"Welcome!"}>
        <Username />
      </Suspense>
      {/* <button onClick={function}>Log out</button> */}
      {/* onClick을 이용하기 위해서는 client component로 만들어야 함 */}
      {/* client component는 최대한 피하는 방향으로 개발해야 함 */}
      {/* inline server action을 사용하는 방향으로 개발 */}
      <form action={logOut}>
        {/* <input type="submit" value="Log out" /> */}
        <button>Log out</button>
      </form>
    </div>
  );
}
