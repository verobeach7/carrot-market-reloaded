"use client";

import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import { Suspense, useEffect, useOptimistic, useRef } from "react";
import CommentInputBar from "./comment-input-bar";
import { createComment } from "@/app/posts/[id]/actions";

interface ICommentListProps {
  comments:
    | {
        user: {
          avatar: string | null;
          username: string;
        };
        id: number;
        payload: string;
        created_at: Date;
        updated_at: Date;
        userId: number;
        postId: number;
      }[]
    | null;
  postId: number;
  me: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

interface ICommentProps {
  user: {
    avatar: string | null;
    username: string;
  };
  id: number;
  payload: string;
  created_at: Date;
  updated_at: Date;
  userId: number;
  postId: number;
}

export function CommentsList({ comments, postId, me }: ICommentListProps) {
  const endOfCommentsRef = useRef<HTMLDivElement>(null);
  const [optimisticComments, reducerFn] = useOptimistic(
    comments!,
    (prevComments, newComment: ICommentProps) => {
      return [...prevComments, newComment];
    }
  );
  const handleSubmit = async (payload: string, postId: number) => {
    const newComment = {
      id: optimisticComments.length + 1,
      payload,
      postId,
      userId: me.id,
      created_at: new Date(),
      updated_at: new Date(),
      user: {
        username: me.username,
        avatar: me.avatar,
      },
    };
    reducerFn(newComment);
    await createComment(payload, postId);
  };

  useEffect(() => {
    if (endOfCommentsRef.current) {
      endOfCommentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [optimisticComments]);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <p className="mb-3 text-sm">댓글 {comments?.length}</p>
        <div className="flex flex-col items-start">
          {optimisticComments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 mb-3">
              <Image
                width={28}
                height={28}
                className="size-7 rounded-full mt-2.5"
                src={comment.user.avatar!}
                alt={comment.user.username}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">
                  {comment.user.username}
                </span>
                <div className="text-xs">
                  <span className="text-neutral-500">
                    {formatToTimeAgo(comment.created_at.toString())}
                  </span>
                </div>
                <div className="whitespace-pre-line">{comment.payload}</div>
              </div>
            </div>
          ))}
          <div ref={endOfCommentsRef} />
        </div>
      </Suspense>
      <CommentInputBar postId={postId} handleSubmit={handleSubmit} />
    </>
  );
}
