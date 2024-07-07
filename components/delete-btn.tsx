"use client";

import { useCallback, useState } from "react";
import CustomAlert from "./custom-alert";

interface DeleteButtonProps {
  productId: number;
  deleteFunction: Function;
}

export default function DeleteBtn({
  productId,
  deleteFunction,
}: Readonly<DeleteButtonProps>) {
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
          onConfirm={() => deleteFunction(productId)}
        />
      ) : null}
      <button
        className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold disabled:bg-neutral-500"
        onClick={() => setIsDelete(true)}
      >
        삭제하기
      </button>
    </>
  );
}
