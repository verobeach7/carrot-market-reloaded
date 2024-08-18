"use server";

import { productSchema } from "@/app/add/schema";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function editProduct(formData: FormData) {
  const data = {
    id: formData.get("id"),
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.update({
        where: {
          id: result.data.id,
        },
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
      revalidatePath("/home");
      revalidateTag("product-detail");
      redirect(`/products/${product.id}`);
    }
  }
}

export default async function deleteProduct(productId: number) {
  const session = await getSession();
  const userId = session.id;

  if (!userId) {
    return false;
  }

  const isDeleted = await db.product.delete({
    where: {
      id: productId,
      userId,
    },
    select: {
      photo: true,
    },
  });
  const photoId = isDeleted.photo.split(
    "https://imagedelivery.net/92PVTtiVyG2e5LoQeQDf_w/"
  )[1];
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${photoId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  revalidatePath("/home");
  revalidateTag("product-detail");
  redirect(`/home`);
}
