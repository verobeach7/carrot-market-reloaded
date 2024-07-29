"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { uploadProduct } from "./actions";
import { z } from "zod";
import { useFormState } from "react-dom";
import { stat } from "fs";

const MAX_SIZE = 2 * 1024 * 1024;

const fileSchema = z.object({
  type: z.string().refine((value) => value.includes("image"), {
    message: "이미지 파일만 업로드 가능합니다.",
  }),
  size: z.number().max(MAX_SIZE, {
    message: "2MB 이하의 파일만 업로드 가능합니다.",
  }),
});

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    // TypeScript Error: files가 null일 수도 있어서 발생
    // null일 경우 아무 것도 하지 않는 것을 return하여 에러 해결
    // files.length == 0: 파일을 한번 열은 후에 다시 사진 첨부를 하고 이미지를 선택하지 않고 취소하는 경우 에러 발생 -> 이를 막기 위해 파일 사이즈가 0일 때도 return하여 해결
    if (!files || files.length == 0) {
      setPreview("");
      return;
    }
    const file = files[0];

    const result = fileSchema.safeParse(file);
    if (!result.success) {
      alert(
        result.error.flatten().fieldErrors.size ||
          result.error.flatten().fieldErrors.type
      );
      return result.error.flatten();
    }

    // URL생성, 브라우저에서만 볼 수 있고 다른 사람은 볼 수 없는 url을 생성함
    // 이 URL은 파일이 업로드된 메모리를 참조함
    const url = URL.createObjectURL(file);
    setPreview(url);
  };
  // useFormState(react/dom)를 사용하여 server aciton(actions.ts)에서 success, error 정보를 받아와 state에 저장, 이를 활용하여 에러 발생 시 폼에 어디서 어떤 에러가 발생했는지 알려줄 수 있음
  const [state, action] = useFormState(uploadProduct, null);
  return (
    <div>
      {/* action을 이용하여 server action과 연결 */}
      {/* flex, flex-col, gap-5를 이용하여 예쁘게 정렬 */}
      <form action={action} className="p-5 flex flex-col gap-5">
        {/* htmlFor로 input과 연결 */}
        {/* input의 classname에 hidden을 부여하여 숨기기 */}
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          // style에 backgroundImage를 직접 지정 가능
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {state?.fieldErrors.photo}
              </div>
            </>
          ) : null}
        </label>
        <Input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
          //   errors={}
        />
        <Input
          name="title"
          required
          placeholder="제목"
          type="text"
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          required
          placeholder="가격"
          type="number"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          required
          placeholder="자세한 설명"
          type="text"
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
