"use server";

import db from "@/lib/db";

// 물건 삭제
// deleteMany를 사용해서 result가 0이면 삭제 실패
export const deleteProduct = async (id: number) => {
  const result = await db.product.deleteMany({
    where: {
      id: 2, // 일부러 실패하게 했음
    },
  });
  return result.count;
};
