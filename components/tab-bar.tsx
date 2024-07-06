import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function TabBar() {
  return (
    <div>
      <Link href="/products" className="">
        <HomeIcon className="w-7 h-7" />
        <span>홈</span>
      </Link>
      <Link href="/life" className="">
        <HomeIcon className="w-7 h-7" />
        <span>동네생활</span>
      </Link>
      <Link href="/chat" className="">
        <HomeIcon className="w-7 h-7" />
        <span>채팅</span>
      </Link>
      <Link href="/live" className="">
        <HomeIcon className="w-7 h-7" />
        <span>쇼핑</span>
      </Link>
      <Link href="/profile" className="">
        <HomeIcon className="w-7 h-7" />
        <span>나의 당근</span>
      </Link>
    </div>
  );
}
