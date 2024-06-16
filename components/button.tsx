"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
  text: string;
}

export default function Button({ text }: ButtonProps) {
  // 부모 Form의 속성을 가져올 수 있음(action, data, method, pending)
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="primary-btn h-10 disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed"
    >
      {pending ? "로딩 중" : text}
    </button>
  );
}
