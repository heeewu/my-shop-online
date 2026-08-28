"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { showToast } from "@/app/components/Toast";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  created_at?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  const productId = params.id;

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        showToast("Producto no encontrado", "error");
        router.push("/");
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* 面包屑导航 */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* 图片区域 */}
            <div className="relative">
              <div
                className="relative h-80 md:h-96 w-full bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
                onClick={() => setShowFullImage(true)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  🔍 Click para ampliar
                </div>
              </div>
            </div>

            {/* 信息区域 */}
            <div className="flex flex-col justify-between">
              <div>
                {/* 商品名称 */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                {/* 价格 */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">
                    ${(product.price * 1.2).toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">-20%</span>
                </div>

                {/* 商品描述 */}
                <div className="border-t border-gray-100 py-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📝 Descripción</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description || "Producto de alta calidad. Ideal para uso diario. Material resistente y duradero."}
                  </p>
                </div>

                {/* 规格信息 */}
                <div className="border-t border-gray-100 py-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📋 Especificaciones</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Categoría: General</li>
                    <li>• Disponibilidad: ✅ En stock</li>
                    <li>• Garantía: 30 días</li>
                  </ul>
                </div>
              </div>

              {/* 加入购物车按钮 */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  productImage={product.image}
                />
                <Link
                  href="/"
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  ← Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 商品推荐 */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛍️ Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RelatedProducts currentId={product.id} />
          </div>
        </div>
      </div>

      {/* 全屏图片预览 Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
              onClick={() => setShowFullImage(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// 🔹 相关商品组件（显示同分类或其他商品）
function RelatedProducts({ currentId }: { currentId: number }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentId)
        .limit(4);

      setProducts(data || []);
    }
    fetchRelated();
  }, [currentId]);

  if (products.length === 0) return null;

  return (
    <>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
        >
          <div className="relative h-40 w-full bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <h4 className="font-medium text-sm text-gray-800 truncate">{product.name}</h4>
            <p className="text-blue-600 font-bold text-sm">${product.price.toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </>
  );
}