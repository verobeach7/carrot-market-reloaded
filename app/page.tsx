export default function Home() {
  return (
    <main className="bg-gray-100 h-screen flex items-center justify-center p-5 ">
      <div className="bg-white shadow-lg p-5 rounded-3xl w-full max-w-screen-sm flex flex-col gap-2">
        <input
          // input의 높이를 조정하기 위해서 두가지 방식 사용 가능
          // h-10을 이용 또는 py-3을 이용(높이 또는 패딩을 이용하여 조정)
          /* className="w-full rounded-full h-12 bg-gray-200 pl-5 outline-none ring ring-orange-500 ring-offset-2 ring-offset-blue-600" */
          className="w-full rounded-full h-12 bg-gray-200 pl-5 outline-none ring ring-transparent focus:ring-orange-500 focus: ring-offset-2 transition-shadow placeholder:drop-shadow"
          // ring은 outline과 비슷하지만 ring은 커스텀이 가능함!!!
          type="text"
          placeholder="Search here..."
        />
        {/* bg-black은 --tw-bg-opacity를 변수로 가지고 있어 bg-opacity를 설정하는 경우 이 값을 이용하여 bg-black을 계산함 */}
        <button className="bg-black bg-opacity-50 text-white py-2 rounded-full active:scale-90 transition-transform font-medium outline-none">
          Search
        </button>
      </div>
    </main>
  );
}
