"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

export default async function deleteProductAction(productId: number) {
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
  });

  if (!isDeleted) {
    return false;
  }

  return true;
}
