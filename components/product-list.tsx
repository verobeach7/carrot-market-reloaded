"use client";

import { InitialProducts } from "@/app/(tabs)/products/page";
import ListProduct from "./list-product";
import { useEffect, useRef, useState } from "react";
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
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  // <HTMLSpanElement>: reference를 span에 저장하겠다고 TypeScript에 알려주는 것
  const trigger = useRef<HTMLSpanElement>(null);
  // page value가 변경되면 내부 function이 실행됨
  useEffect(() => {
    // Creating the Observer: trigger를 obsever함
    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) =>
        // console.log(entries[0].isIntersecting)
        {
          const element = entries[0];
          // 아래 TypeScript Error를 없애기 위해 trigger.current가 존재하는지 확인
          if (element.isIntersecting && trigger.current) {
            // trigger.current가 null일 수도 있어서 TypeScript Error 발생
            observer.unobserve(trigger.current);
            setIsLoading(true);
            // getMoreProducts: Server Action을 이용한 pagenation
            const newProducts = await getMoreProducts(page + 1);
            if (newProducts.length !== 0) {
              // ...spread operation을 사용하면 array의 elements만 풀어서 가져옴
              setProducts((prev) => [...prev, ...newProducts]);
              setPage((prev) => prev + 1);
            } else {
              setIsLastPage(true);
            }
            setIsLoading(false);
          }
        },
      {
        // threshold: 1.0: trigger가 100% 표시될 때까지 기다린다는 뜻
        threshold: 1.0,
        rootMargin: "0px 0px -100px 0px",
      }
    );
    if (trigger.current) {
      observer.observe(trigger.current);
    }
    // Cleanup Function: user가 page를 떠날 때 호출됨, Component가 사라질 때(Unmount될 때)
    return () => {
      observer.disconnect();
    };
  }, [page]);
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        // <ListProduct id={product.id} title={product.title} />
        // 하나하나 개별적으로 하지 않고 스프레드를 사용하여 한번에 props로 보낼 수 있음
        <ListProduct key={product.id} {...product} />
      ))}
      {/* ref={trigger}: VanillaJS에서 id를 주고 span을 가져오는 코드와 유사하게 사용됨 */}
      {!isLastPage ? (
        <span
          ref={trigger}
          className="text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
        >
          {isLoading ? "로딩 중" : "Load more"}
        </span>
      ) : null}
    </div>
  );
}
