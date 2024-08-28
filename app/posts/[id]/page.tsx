import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import { EyeIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getPost(id: number) {
  try {
    const post = await db.post.update({
      where: {
        id,
      },
      data: {
        views: {
          increment: 1, // 현재 조회수가 몇인지 모르더라도 1 증가시키는 역할을 함
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          // 자신(Post)을 가리키고 있는 reverse relationship 개수를 알 수 있음. 즉, 좋아요와 댓글의 개수를 알 수 있음
          select: {
            comments: true,
            // likes count는 별도로 분리하여 다른 곳에서 작업해야하기 때문에 삭제
            // likes: true,
          },
        },
      },
    });
    return post;
  } catch (e) {
    return null;
  }
}

async function getCachedPost(postId: number) {
  const cachedOperation = nextCache(getPost, ["post-detail"], {
    tags: [`post-detail-${postId}`],
    revalidate: 60, // 조회수가 실시간은 아니지만 계속해서 반영되는 것처럼 보이게 만들 수 있음
  });
  return cachedOperation(postId);
}

// isLiked뿐만 아니라 likes count도 필요하므로 함수명 변경
async function getLikeStatus(postId: number, userId: number) {
  // nextCache 내부에서 getSession을 이용할 때 cookies를 사용하는데 둘이 함께 사용 불가능함
  // const session = await getSession();
  const isLiked = await db.like.findUnique({
    where: {
      id: {
        postId,
        userId,
      },
    },
  });
  // db의 like collection에서 해당글의 postId에 해당하는 데이터가 몇 개 있는지를 카운트해줌
  const likeCount = await db.like.count({
    where: {
      postId,
    },
  });
  return { likeCount, isLiked: Boolean(isLiked) };
}

/* const getCachedLikeStatus = nextCache(getLikeStatus, ["post-like-status"], {
  tags: ["like-status"],
}); */

// 별도의 함수로 포장하여 포장한 함수에서 getSession()을 미리 이용
// cachedOperation에 postId와 userId를 전달하여 nextCache에서 활용할 수 있도록 함
async function getCachedLikeStatus(postId: number) {
  const session = await getSession();
  const userId = session.id;
  const cachedOperation = nextCache(getLikeStatus, ["post-like-status"], {
    tags: [`like-status-${postId}`],
  });
  return cachedOperation(postId, userId!); // 반드시 nextCache 함수인 cachedOperation 호출을 return해줘야 함
}

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const post = await getCachedPost(id);
  if (!post) {
    return notFound();
  }
  // console.log(post);

  const likePost = async () => {
    "use server";
    // await new Promise((r) => setTimeout(r, 5000));
    const session = await getSession();
    try {
      await db.like.create({
        data: {
          postId: id,
          userId: session.id!,
        },
      });
      // 아래와 같이 tag를 사용하면 Cache된 모든 글의 like-status가 한번에 갱신됨.
      // revalidateTag("like-status");
      revalidateTag(`like-status-${id}`);
    } catch (e) {}
  };
  const dislikePost = async () => {
    "use server";
    const session = await getSession();
    try {
      await db.like.delete({
        where: {
          id: {
            postId: id,
            // TypeScript Error: session.id는 로그인 한 경우에만 존재하기 때문에 TypeScript가 session.id가 없을 수도 있음을 인식하는 것
            // 우리는 로그인하지 않은 경우 이 페이지에 올 수 없음을 알고 있기 때문에 !를 붙여 에러를 없앨 수 있음
            userId: session.id!,
          },
        },
      });
      revalidateTag(`like-status-${id}`);
    } catch (e) {}
  };

  const { likeCount, isLiked } = await getCachedLikeStatus(id);
  return (
    <div className="p-5 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Image
          width={28}
          height={28}
          className="size-7 rounded-full"
          src={post.user.avatar!}
          alt={post.user.username}
        />
        <div>
          <span className="text-sm font-semibold">{post.user.username}</span>
          <div className="text-xs">
            <span>{formatToTimeAgo(post.created_at.toString())}</span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mb-5">{post.description}</p>
      <div className="flex flex-col gap-5 items-start">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <EyeIcon className="size-5" />
          <span>조회 {post.views}</span>
        </div>
        <form action={isLiked ? dislikePost : likePost}>
          <button
            className={`flex items-center gap-2 text-neutral-400 text-sm border border-neutral-400 rounded-full p-2 transition-colors ${
              isLiked
                ? "bg-orange-500 text-white border-orange-500"
                : "hover:bg-neutral-800"
            }`}
          >
            {isLiked ? (
              <HandThumbUpIcon className="size-5" />
            ) : (
              <OutlineHandThumbUpIcon className="size-5" />
            )}
            {isLiked ? (
              <span>{likeCount}</span>
            ) : (
              <span>공감하기 ({likeCount})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
