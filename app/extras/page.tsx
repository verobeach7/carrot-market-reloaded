import { revalidatePath } from "next/cache";

async function getData() {
  fetch("https://nomad-movies.nomadcoders.workers.dev/movies");
}

export default async function Extras() {
  await getData();

  const action = async () => {
    "use server";
    console.log("hit");
    revalidatePath("/extras");
  };

  // tailwind.config.ts에서 만든 className을 활용하여 폰트 적용
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-rubik">Extras!</h1>
      <h1 className="text-6xl font-metallica">Extras!</h1>
      <h2 className="font-roboto">So much more to learn!</h2>
      <form action={action}>
        <button>revalidate</button>
      </form>
    </div>
  );
}
