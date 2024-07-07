"use client";

import { useRouter } from "next/navigation";
import deleteProduct from "../app/products/[id]/action";

type DeleteBtnProps = {
  productId: number;
};

export default function DeleteBtn({ productId }: DeleteBtnProps) {
  const router = useRouter();
  async function handleDelete() {
    const res = await deleteProduct(productId);
    console.log("response: ", res);
    if (res) {
      alert("삭제되었습니다");
      router.replace("/products");
    } else {
      alert("실패했습니다");
    }
  }

  return (
    <button
      className="rounded-md bg-red-500 px-5 py-2.5 font-semibold text-white"
      onClick={handleDelete}
    >
      삭제하기
    </button>
  );
}
