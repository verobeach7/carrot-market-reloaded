"use client";

import { useRouter } from "next/navigation";
import deleteProduct from "../app/products/[id]/action";
import { useCallback, useState } from "react";
import CustomAlert from "./custom-alert";

type DeleteBtnProps = {
  productId: number;
  deleteFunction: Function;
};

export default function DeleteBtn({ productId }: DeleteBtnProps) {
  // "use client"에서는 useRouter 사용
  const router = useRouter();

  const [isDelete, setIsDelete] = useState(false);

  const handleClose = useCallback(() => {
    setIsDelete(false);
  }, []);

  return (
    <>
      {isDelete ? (
        <CustomAlert
          text="삭제하시겠습니까?"
          type="D"
          onClose={handleClose}
          onConfirm={() => deleteProduct(productId)}
        />
      ) : null}
      <button
        className="rounded-md bg-red-500 px-5 py-2.5 font-semibold text-white"
        onClick={() => setIsDelete(true)}
      >
        삭제하기
      </button>
    </>
  );
}
