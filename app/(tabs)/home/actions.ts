"use server";

import db from "@/lib/db";

export async function getMoreProducts(page: number) {
  // console.log("getMoreProducts server action", page);
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    // /home 경로의 page.tsx에서 getInitialProducts()로 불러올 개수를 바꾸면 여기서도 바꿔줘야 함
    skip: page * 2,
    take: 2,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}
