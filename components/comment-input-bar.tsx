"use client";

import { createComment } from "@/app/posts/[id]/actions";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { FormEvent, useState } from "react";

export default function CommentInputBar({
  postId,
  handleSubmit,
}: {
  postId: number;
  handleSubmit: (payload: string, postId: number) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    setComment("");
    await handleSubmit(comment, postId);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-0 pb-5 w-full max-w-screen-md bg-neutral-900 border-neutral-600 border-t pr-8">
      <form
        onSubmit={onSubmit}
        className="*:text-white flex items-center gap-3"
      >
        <textarea
          name="comment"
          placeholder="댓글을 입력해주세요."
          required
          value={comment}
          onChange={handleCommentChange}
          maxLength={200}
          className="w-full rounded-lg bg-neutral-800 mt-3 ring-0 focus:ring-0 border-none placeholder:text-neutral-500 resize-none"
        />
        <button type="submit" disabled={loading}>
          <PaperAirplaneIcon
            className={`mt-2 size-6 cursor-pointer ${
              comment == "" ? "" : "text-orange-500"
            } `}
          />
        </button>
      </form>
    </div>
  );
}
