import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import getProduct from "@/lib/get-product";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

async function getIsOwner(userId: number) {
  // cookies를 사용하면 이 페이지를 미리 render할 수 없음
  const session = await getSession();
  // 로그인되어 있다면 로그인id와 product의 userId가 같은지 확인(소유자 확인)
  if (session.id) {
    // 소유자이면 true, 소유자가 아니면 false 반환
    return session.id === userId;
  }

  // 로그인되어 있지 않다면 false 반환
  return false;
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail"],
});

async function getProductTitle(id: number) {
  console.log("title");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title", "product-detail"],
});

// 반드시 이름이 generateMetadata여야 함. 예약어
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  // id에 문자열 string이 들어오는 경우 오류처리
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  // db에 없는 product id이면 notFound 페이지 보여주기
  if (!product) {
    return notFound();
  }
  // 소유자인지 확인
  const isOwner = await getIsOwner(product.userId);

  const createChatRoom = async () => {
    "use server";
    let room;
    const session = await getSession();
    // 이미 chatroom이 존재하는지 확인
    const roomsAlreadyExist = await db.chatRoom.findMany({
      where: {
        productId: product.id,
        users: {
          some: {
            id: session.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
    if (roomsAlreadyExist) {
      room = roomsAlreadyExist[0];
      console.log("AlreadyExistRoom", room);
    }
    if (!room) {
      // chatroom 생성
      room = await db.chatRoom.create({
        data: {
          users: {
            // users relationship 연결
            connect: [
              {
                // 판매자 id
                id: product.userId,
              },
              {
                // 로그인 유저 id
                id: session.id,
              },
            ],
          },
          product: {
            connect: {
              id: product.id,
            },
          },
        },
        // 반환할 값 선택
        select: {
          id: true,
        },
      });
    }
    redirect(`/chats/${room.id}`);
  };

  return (
    <>
      <div className="mb-24">
        <div className="relative aspect-square">
          <Image
            fill
            className="object-cover"
            src={`${product.photo}/public`}
            alt={product.title}
          />
        </div>
        <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
          <div className="size-10 overflow-hidden rounded-full">
            {product.user.avatar !== null ? (
              <Image
                src={product.user.avatar}
                width={40}
                height={40}
                alt={product.user.username}
              />
            ) : (
              <UserIcon className="size-10" />
            )}
          </div>
          <div>
            <h3>{product.user.username}</h3>
          </div>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p>{product.description}</p>
        </div>
      </div>
      <div className="fixed w-full bottom-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center max-w-screen-md mx-auto">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner ? (
          <Link
            href={`/products/${id}/edit`}
            className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold"
          >
            편집
          </Link>
        ) : null}
        {/* {isOwner ? (
          <form action="">
            <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
              채팅보기
            </button>
          </form>
        ) : ( */}
        <form action={createChatRoom}>
          <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
            채팅하기
          </button>
        </form>
        {/* )} */}
      </div>
    </>
  );
}

// // 반드시 dynamicParams 이름을 사용해야 함. 예약어.
// export const dynamicParams = false;

// /* 신중하게 사용해야 함. 너무 많은 자료가 있는 경우 이를 미리 다 렌더링하는 것은 앱을 느려지게 하거나 멈추게 할 수 있음. 그러므로 소수의 페이지를 미리 렌더링 하면 좋은 경우에 사용 추천 */
// // 반드시 이름이 generateStaticParams여야 함
// // ProductDetail함수의 params로 받을 가능성이 있는 parameter objects 리스트를 return해야 함
// export async function generateStaticParams() {
//   const products = await db.product.findMany({
//     select: {
//       id: true,
//     },
//   });
//   // 괄호를 사용하는 이유: javascript가 object를 return하려는 것을 알 수 있게 해줘야함
//   // 괄호가 없다면 아무 것도 반환하지 않고 연산만 하는 것
//   return products.map(
//     (product) => ({ id: product.id + "" })
//     /* {
//       return {
//         id: product.id + "",
//       };
//     } */
//   );
// }
