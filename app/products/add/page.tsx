"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    // TypeScript Error: files가 null일 수도 있어서 발생
    // null일 경우 아무 것도 하지 않는 것을 return하여 에러 해결
    if (!files) {
      return;
    }
    const file = files[0];
  };
  return (
    <div>
      {/* flex, flex-col, gap-5를 이용하여 예쁘게 정렬 */}
      <form className="p-5 flex flex-col gap-5">
        {/* htmlFor로 input과 연결 */}
        {/* input의 classname에 hidden을 부여하여 숨기기 */}
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 rounded-md border-dashed cursor-pointer"
        >
          <PhotoIcon className="w-20" />
          <div className="text-neutral-400 text-sm">사진을 추가해주세요.</div>
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          className="hidden"
        />
        <Input name="title" required placeholder="제목" type="text" />
        <Input name="price" required placeholder="가격" type="number" />
        <Input
          name="description"
          required
          placeholder="자세한 설명"
          type="text"
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
