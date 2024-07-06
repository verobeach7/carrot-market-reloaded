import ListProduct from "@/components/list-product";
import db from "@/lib/db";

/* // loading.tsx 확인을 위한 작업
async function getProducts() {
  await new Promise((resolve) => {
    setTimeout(resolve, 10000);
  });
} */
async function getProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
  });
  return products;
}

export default async function Products() {
  const products = await getProducts();
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        // <ListProduct id={product.id} title={product.title} />
        // 하나하나 개별적으로 하지 않고 스프레드를 사용하여 한번에 props로 보낼 수 있음
        <ListProduct key={product.id} {...product} />
      ))}
    </div>
  );
}
