export default function Home() {
  return (
    <main className="bg-gray-100 sm:bg-red-100 md:bg-green-100 lg:bg-cyan-100 xl:bg-orange-100 2xl:bg-purple-100 h-screen flex items-center justify-center p-5 ">
      <div className="bg-white shadow-lg p-5 rounded-3xl w-full max-w-screen-sm flex flex-col gap-3">
        {["Vero", "Nico", "Lynn", "You"].map((person, index) => (
          /* <div
               key={index}
               className="flex items-center gap-5 odd:bg-gray-100 even:bg-cyan-100 p-2.5 rounded-xl"
          >*/
          <div
            key={index}
            className="flex items-center gap-5 border-b-2 pb-5 last:pb-0 last:border-0"
          >
            <div className="size-10 bg-blue-400 rounded-full" />
            <span className="text-lg font-medium">{person}</span>
            <div className="size-6 bg-red-500 text-white flex items-center justify-center rounded-full">
              <span>{index}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
