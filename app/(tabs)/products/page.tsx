import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import Link from "next/link";

/* // loading.tsx 확인을 위한 작업
async function getInitialProducts() {
  await new Promise((resolve) => {
    setTimeout(resolve, 10000);
  });
} */
async function getInitialProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    // take: 몇 개의 데이터를 가져올지 지정할 수 있음
    take: 1,
    orderBy: {
      // asc: 오름차순 - 오래된 것부터 보임, desc: 내림차순 - 최근 것부터 보임
      created_at: "desc",
    },
  });
  return products;
}

// Prisma가 db의 리턴 타입을 알아서 정리해주게 하는 방법. export하여 다른 곳에서 TypeScript를 위해 사용할 수 있음
export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export default async function Products() {
  const initialProducts = await getInitialProducts();
  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      <Link
        href="/products/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
