import CloseButton from "@/components/close-btn";
import { getProduct } from "@/lib/get-product";
import { formatToWon } from "@/lib/utils";
import { PhotoIcon, UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function Modal({ params }: { params: { id: string } }) {
  // id에 문자열 string이 들어오는 경우 오류처리
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProduct(id);
  // db에 없는 product id이면 notFound 페이지 보여주기
  if (!product) {
    return notFound();
  }
  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-neutral-800 rounded-lg bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-sm h-3/5 flex justify-center w-full bg-neutral-800 rounded-lg shadow-2xl">
        <div className="aspect-square h-full w-3/5">
          <div className="bg-neutral-900 text-neutral-200 relative flex justify-center items-center overflow-hidden h-full">
            <Image
              src={`${product.photo}/public`}
              alt={product.title}
              fill
              className="object-cover rounded overflow-hidden"
            />
          </div>
        </div>
        <div className="w-2/5 h-full flex flex-col items-center justify-center px-4">
          <h1 className="text-xl font-bold">{product.title}</h1>
          <span className="text-lg">{formatToWon(product.price)}원</span>
          <p className="mt-4 font-light text-neutral-200 text-sm">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
