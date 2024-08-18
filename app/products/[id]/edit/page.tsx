import { notFound } from "next/navigation";
import { unstable_cache as nextCahce } from "next/cache";
import getProduct from "@/lib/get-product";
import getSession from "@/lib/session";
import EditForm from "@/components/edit-form";

async function getIsOwner(userId: number) {
  // cookies를 사용하면 이 페이지를 미리 render할 수 없음
  const session = await getSession();
  // 로그인되어 있다면 로그인id와 product의 userId가 같은지 확인(소유자 확인)
  if (session.id) {
    // 소유자이면 true, 소유자가 아니면 false 반환
    return session.id === userId;
  }

  // 로그인되어 있지 않다면 false 반환
  return false;
}

const getCachedProduct = nextCahce(getProduct, ["product-detail"], {
  tags: ["product-detail"],
});

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();
  const product = await getCachedProduct(id);
  if (!product) return notFound();
  const session = await getSession();
  const isOwner = session.id === product.userId;
  return (
    <div>
      <EditForm id={id} product={product} isOwner={isOwner} />
    </div>
  );
}
