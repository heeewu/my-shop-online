import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import CartBadge from "@/components/CartBadge";
import UserMenu from "@/components/UserMenu";
import BackToTop from "@/components/BackToTop";

// 分类配置
const CATEGORIES = [
  { id: "FIESTA", label: "🎉 Fiesta", icon: "🎉", color: "bg-pink-50" },
  { id: "COMESTICOS", label: "💄 Cosméticos", icon: "💄", color: "bg-rose-50" },
  { id: "ESCOLARES", label: "📚 Escolares", icon: "📚", color: "bg-blue-50" },
  { id: "QUINCALLERIA", label: "🔧 Quincallería", icon: "🔧", color: "bg-orange-50" },
  { id: "JUGUETES", label: "🧸 Juguetes", icon: "🧸", color: "bg-purple-50" },
  { id: "ACCESORIOS", label: "👗 Accesorios", icon: "👗", color: "bg-teal-50" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: { categoria?: string; search?: string };
}) {
  const categoriaFiltro = searchParams?.categoria || null;
  const searchTerm = searchParams?.search || null;

  // 查询商品
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (categoriaFiltro) {
    query = query.eq("category", categoriaFiltro);
  }

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  query = query.order("id", { ascending: true });

  const { data: products, error } = await query;

  if (error) {
    console.error("Error al cargar productos:", error);
    return <div className="p-10 text-red-500">Error al cargar productos</div>;
  }

  const currentCategory = CATEGORIES.find((c) => c.id === categoriaFiltro);

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
            <div className="flex items-center gap-4">
              <UserMenu />
              <CartBadge />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <form action="/" method="GET" className="relative max-w-2xl mx-auto">
          <input
            type="text"
            name="search"
            defaultValue={searchTerm || ""}
            placeholder="Buscar productos..."
            className="w-full p-3 pl-12 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Buscar
          </button>
          {searchTerm && (
            <Link
              href="/"
              className="absolute right-20 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </Link>
          )}
        </form>
      </div>

      {/* 分类导航 */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">📌 Categorías</h2>
          <div className="flex items-center gap-3">
            {categoriaFiltro && (
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                ✕ Limpiar
              </Link>
            )}
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Ver todas →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/?categoria=${cat.id}`}
                className="flex-shrink-0 w-[130px] md:w-auto snap-start group"
              >
                <div
                  className={`flex flex-col items-center justify-center p-4 rounded-xl ${cat.color} shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300`}
                >
                  <span className="text-4xl mb-1 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-medium text-center text-gray-700 group-hover:text-blue-600 transition">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-1 md:hidden">
            <span className="text-xs text-gray-400 animate-pulse">
              ← Desliza para ver más →
            </span>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {searchTerm
              ? `🔍 Resultados para "${searchTerm}"`
              : categoriaFiltro && currentCategory
              ? `🛍️ ${currentCategory.label}`
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
            <p className="text-lg">
              {searchTerm
                ? `No se encontraron productos para "${searchTerm}"`
                : "No hay productos en esta categoría"}
            </p>
            {searchTerm && (
              <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                ← Ver todos los productos
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2024 Mi Tienda. Todos los derechos reservados.
        </div>
      </footer>

      {/* 回到顶部按钮 */}
      <BackToTop />
    </main>
  );
}