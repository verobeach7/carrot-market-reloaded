import { useRouter } from "next/navigation";
import { useState } from "react";

interface CustomAlertProps {
  text: string; // 내용
  type: "D" | "M"; // 삭제, 수정
  onClose: Function; // 닫기
  onConfirm: Function; // 삭제, 수정 메소드
}

export default function CustomAlert({
  text,
  type,
  onClose,
  onConfirm,
}: Readonly<CustomAlertProps>) {
  const [content, setContent] = useState(text);
  // api(여기선 db)통신 완료 플래그
  const [isFinished, setIsFinished] = useState(false);
  // use client에서는 router 사용
  const router = useRouter();

  // 수정, 삭제 메소드 실행
  const handleConfirm = async () => {
    const result = await onConfirm();
    if (result === 1) {
      // 삭제, 수정 성공
      setContent(`${type === "D" ? "삭제" : "수정"}되었습니다.`);
      setIsFinished(true);
    } else if (result === 0) {
      // 삭제, 수정 실패
      setContent(
        `${
          type === "D" ? "삭제" : "수정"
        }에 실패하였습니다. 잠시후 이용해주세요.`
      );
      setIsFinished(true);
    }
  };

  // 수정, 삭제 후 products 페이지로 이동
  const handleMoveProducts = () => {
    router.push("/products");
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center ">
      <div className="flex flex-col justify-center items-center w-96 h-32 bg-white shadow-lg rounded-xl gap-5">
        <div className="text-black font-semibold">{content}</div>
        <div className="flex gap-3">
          {isFinished ? (
            <button
              className="bg-blue-500 px-3 py-1.5 rounded-md text-white font-semibold disabled:bg-neutral-500"
              onClick={handleMoveProducts}
            >
              확인
            </button>
          ) : (
            <>
              <button
                className="bg-blue-500 px-3 py-1.5 rounded-md text-white font-semibold disabled:bg-neutral-500"
                onClick={() => onClose()}
              >
                취소
              </button>
              <button
                className={`${
                  type === "D" ? "bg-red-500" : "bg-orange-500"
                } px-3 py-1.5 rounded-md text-white font-semibold disabled:bg-neutral-500`}
                onClick={handleConfirm}
              >
                {type === "D" ? "삭제" : "수정"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
