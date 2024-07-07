"use client";

import { InitialProducts } from "@/app/(tabs)/products/page";
import ListProduct from "./list-product";
import { useState } from "react";
import { getMoreProducts } from "@/app/(tabs)/products/actions";

/* interface ProductListProps {
  initialProducts: {
    id: number;
    title: string;
    price: number;
    photo: string;
    created_at: Date;
  }[];
} */

interface ProductListProps {
  // Prisma가 리턴 타입을 정리해서 보내주기 때문에 db에 항목을 추가하거나 삭제하는 경우에 알아서 타입을 정리해줌. 즉, 개발자가 수정작업 없이 사용 가능함
  initialProducts: InitialProducts;
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const onLoadMoreProductsClick = async () => {
    setIsLoading(true);
    // getMoreProducts: Server Action을 이용한 pagenation
    const newProducts = await getMoreProducts(1);
    // ...spread operation을 사용하면 array의 elements만 풀어서 가져옴
    setProducts((prev) => [...prev, ...newProducts]);
    setIsLoading(false);
  };
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        // <ListProduct id={product.id} title={product.title} />
        // 하나하나 개별적으로 하지 않고 스프레드를 사용하여 한번에 props로 보낼 수 있음
        <ListProduct key={product.id} {...product} />
      ))}
      <button
        onClick={onLoadMoreProductsClick}
        // 로딩 중일 때 true가 되어 disabled됨
        disabled={isLoading}
        className="text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
      >
        {isLoading ? "로딩 중" : "Load more"}
      </button>
    </div>
  );
}
