import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import CartBadge from "@/components/CartBadge";
import UserMenu from "@/components/UserMenu"; // ✅ 导入用户菜单

// 分类配置
const CATEGORIES = [
  { id: "FIESTA", label: "🎉 Fiesta", icon: "🎉", color: "bg-pink-100 border-pink-300" },
  { id: "COMESTICOS", label: "💄 Cosméticos", icon: "💄", color: "bg-rose-100 border-rose-300" },
  { id: "ESCOLARES", label: "📚 Escolares", icon: "📚", color: "bg-blue-100 border-blue-300" },
  { id: "QUINCALLERIA", label: "🔧 Quincallería", icon: "🔧", color: "bg-orange-100 border-orange-300" },
  { id: "JUGUETES", label: "🧸 Juguetes", icon: "🧸", color: "bg-purple-100 border-purple-300" },
  { id: "ACCESORIOS", label: "👗 Accesorios", icon: "👗", color: "bg-teal-100 border-teal-300" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const categoriaFiltro = searchParams?.categoria || null;

  // 查询商品
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });

  // 如果有分类筛选
  if (categoriaFiltro) {
    query = query.eq("category", categoriaFiltro);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error al cargar productos:", error);
    return <div className="p-10 text-red-500">Error al cargar productos</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
                  🛒 Mi Tienda
                </h1>
              </Link>
              <p className="text-sm text-gray-500 hidden sm:block">Envíos a todo el país</p>
            </div>
            {/* ✅ 用户菜单 + 购物车 */}
            <div className="flex items-center gap-4">
              <UserMenu />
              <CartBadge />
            </div>
          </div>
        </div>
      </div>

      {/* 分类导航 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            📌 Categorías
          </h2>
          {categoriaFiltro && (
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              ✕ Limpiar filtro
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = categoriaFiltro === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/?categoria=${cat.id}`}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? `${cat.color} border-blue-500 shadow-md scale-105`
                    : `${cat.color} border-transparent hover:shadow-md hover:scale-105`
                }`}
              >
                <span className="text-3xl mb-1">{cat.icon}</span>
                <span className={`text-xs font-medium text-center ${
                  isActive ? "text-blue-700" : "text-gray-700"
                }`}>
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 商品列表 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {categoriaFiltro
              ? `🛍️ ${CATEGORIES.find((c) => c.id === categoriaFiltro)?.label || "Productos"}`
              : "🛍️ Todos los productos"}
          </h2>
          <span className="text-sm text-gray-400">
            {products?.length || 0} productos
          </span>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative h-48 sm:h-56 w-full bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* 分类标签 */}
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>

                <div className="px-3 pb-3 mt-auto">
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay productos en esta categoría</p>
            <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Ver todos los productos →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2024 Mi Tienda. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}