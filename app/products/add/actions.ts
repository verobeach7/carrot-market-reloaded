"use server";

import { File } from "buffer";
import { z } from "zod";
import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const productSchema = z.object({
  photo: z.string({
    required_error: "Photo is required.",
  }),
  title: z
    .string({
      required_error: "Title is required.",
    })
    .max(50),
  description: z.string({
    required_error: "Description is required.",
  }),
  price: z.coerce.number({
    required_error: "Price is required.",
  }),
});

// 첫번째 argument는 formState임
export async function uploadProduct(_: any, formData: FormData) {
  const data = {
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };
  // 실제로 파일을 어딘가에 업로드하기 전에 테스트하기 위해 public폴더에 저장해보는 과정
  // 실제 production에서는 이같은 방법을 사용하지 않음
  if (data.photo instanceof File) {
    const photoData = await data.photo.arrayBuffer();
    // console.log(photoData); // 알아볼 수 없는 bytes값을 가짐
    await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
    data.photo = `/${data.photo.name}`;
  }
  // 실제로 form에서 받아온 photo는 string이 아닌 파일이기 때문에 에러가 발생함.
  // 파일은 다른 곳에 저장하고 photo URL만 stirng으로 가져와서 저장해야 함.
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          price: result.data.price,
          photo: result.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      console.log(product);
      redirect(`/products/${product.id}`);
      //   redirect("/products");
    }
  }
  // console.log(data);
}
