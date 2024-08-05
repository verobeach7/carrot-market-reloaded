"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { getUploadUrl, uploadProduct } from "./actions";
import { z } from "zod";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType, productSchema } from "./schema";

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
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // react-hook-form을 이용하여 zod validation
  // <ProductType>을 이용하여 TypeScript에게 Form에서 사용되어지는 Type을 줄 수 있음. 즉, 자동완성 기능이 활성화됨
  // setValue는 수동으로 form의 값을 설정할 수 있게 해줌
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = async (
    _: any,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    const fileSchemaResult = fileSchema.safeParse(file);
    if (!fileSchemaResult.success) {
      return fileSchemaResult.error.flatten();
    }

    // URL생성, 브라우저에서만 볼 수 있고 다른 사람은 볼 수 없는 url을 생성함
    // 이 URL은 파일이 업로드된 메모리를 참조함
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);

    // getUploadUrl(): one-time upload url을 받아옴
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setValue(
        "photo",
        `https://imagedelivery.net/92PVTtiVyG2e5LoQeQDf_w/${id}`
      );
    }
  };

  // RHF의 handleSubmit을 사용하기 때문에 더이상 state와 formData를 받지 않음. 즉, Zod Validation이 끝난 ProductType을 가지는 data를 받게 됨
  // 즉, Validation을 통과하지 못하면 호출되지 않음
  const onSubmit = handleSubmit(async (data: ProductType) => {
    // data는 더이상 file을 가지고 있지 않기 때문에 별도로 file을 저장해주는 방식을 사용해야 함
    if (!file) {
      return; // 오류메시지를 보여주거나 Alert를 띄울 수도 있음
    }

    /* upload image to cloudflare */
    // 클라우드플레어에는 Form 형식으로 이미지를 업로드해야 함
    const cloudflareForm = new FormData(); // Form 생성
    cloudflareForm.append("file", file); // Form에 파일 탑재
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudflareForm,
    });
    if (response.status !== 200) {
      return; // 오류메시지를 보여주거나 Alert를 띄울 수도 있음
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    formData.append("photo", data.photo);

    /* call uploadProduct() */
    // return을 이용하는 이유: uploadProduct Method가 보내온 return을 interceptAction Method가 다시 return함
    // 즉, uploadProduct Method가 Error를 반환하는 경우 이를 전달할 수 있음
    /* const errors = uploadProduct(formData);
    if(errors){
        // setError("")
    } */
    return uploadProduct(formData);
  });

  const onValid = async () => {
    await onSubmit();
  };
  const [imageChangeState, imageChangeAction] = useFormState(
    onImageChange,
    null
  );
  // console.log(register("title")); // RHF의 ref를 가지고 있는 object임
  return (
    <div>
      {/* flex, flex-col, gap-5를 이용하여 예쁘게 정렬 */}
      <form action={onValid} className="p-5 flex flex-col gap-5">
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
              </div>
              <div className="text-red-500">{errors.photo?.message}</div>
            </>
          ) : null}
        </label>
        {/* photo는 zod validation에서는 string이므로 지금 validation을 하면 안되기 때문에 register하지 않음, React Hook Form의 도움 없이 Custom으로 처리 */}
        <Input
          onChange={imageChangeAction}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
          errors={
            imageChangeState?.fieldErrors.size ||
            imageChangeState?.fieldErrors.type
          }
        />
        <Input
          required
          placeholder="제목"
          type="text"
          // register가 name을 주기 때문에 별도로 name을 지정할 필요 없음
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />
        <Input
          required
          placeholder="가격"
          type="number"
          {...register("price")}
          errors={[errors.price?.message ?? ""]}
        />
        <Input
          required
          placeholder="자세한 설명"
          type="text"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
