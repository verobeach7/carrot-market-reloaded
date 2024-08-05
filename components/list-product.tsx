import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ListProductProps {
  title: string;
  price: number;
  created_at: Date;
  photo: string;
  id: number;
}

export default function ListProduct({
  title,
  price,
  created_at,
  photo,
  id,
}: ListProductProps) {
  return (
    <Link href={`/products/${id}`} className="flex gap-5">
      {/* 이미지 사이즈가 다양하거나 모를 때는 아래처럼 하여 일관되게 적용할 수 있음 */}
      <div className="relative size-28 rounded-md overflow-hidden">
        {/* object-cover: 이미지를 찌그러지지 않게 원본을 유지하면서 채울 수 있음 */}
        <Image
          fill
          src={`${photo}/smaller`}
          className="object-cover"
          alt={title}
        />
      </div>
      <div className="flex flex-col gap-1 *:text-white">
        <span className="text-lg">{title}</span>
        <span className="text-sm text-neutral-500">
          {formatToTimeAgo(created_at.toString())}
        </span>
        <span className="text-lg font-semibold">{formatToWon(price)}원</span>
      </div>
    </Link>
  );
}
