import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import CartBadge from "@/components/CartBadge";

export default async function Home() {
  // 从 Supabase 获取商品数据
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error("加载商品失败:", error);
    return <div className="p-10 text-red-500">加载失败，请刷新重试</div>;
  }

  if (!products || products.length === 0) {
    return <div className="p-10 text-gray-500">暂无商品，请去后台添加</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部横幅 + 购物车入口 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛒 我的海外商店</h1>
              <p className="text-gray-600 mt-1">全球发货 · 正品保障</p>
            </div>
            <CartBadge />
          </div>
        </div>
      </div>

      {/* 商品网格 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative h-64 w-full bg-gray-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  ${product.price.toFixed(2)}
                </p>
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  productImage={product.image}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
