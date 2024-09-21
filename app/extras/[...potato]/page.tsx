export default function Extras({ params }: { params: { potato: string[] } }) {
  console.log(params);
  // tailwind.config.ts에서 만든 className을 활용하여 폰트 적용
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-rubik">Extras!</h1>
      <h1 className="text-6xl font-metallica">Extras!</h1>
      <h2 className="font-roboto">So much more to learn!</h2>
    </div>
  );
}
