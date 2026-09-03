"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

// ✅ 分类映射（用于显示标签）
const CATEGORY_LABELS: Record<string, string> = {
  FIESTA: "🎉 Fiesta",
  COMESTICOS: "💄 Cosméticos",
  ESCOLARES: "📚 Escolares",
  QUINCALLERIA: "🔧 Quincallería",
  JUGUETES: "🧸 Juguetes",
  ACCESORIOS: "👗 Accesorios",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar productos:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}"?`)) return;

    const res = await fetch("/api/admin/products/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setProducts(products.filter((p) => p.id !== id));
      alert("✅ Producto eliminado");
    } else {
      alert("❌ Error al eliminar");
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from("products")
      .update({ is_active: newStatus })
      .eq("id", id);

    if (error) {
      alert("❌ Error al actualizar estado");
      console.error(error);
    } else {
      setProducts(products.map((p) =>
        p.id === id ? { ...p, is_active: newStatus } : p
      ));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部标题栏 */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Gestión de Productos</h1>
          <p className="text-gray-500 mt-1">{filteredProducts.length} productos</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            ➕ Agregar Producto
          </Link>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">
            ← Volver al Panel
          </Link>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
        {searchTerm && (
          <span className="text-xs text-gray-400 ml-3">
            {filteredProducts.length} producto(s) encontrado(s)
          </span>
        )}
      </div>

      {/* 商品列表 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">ID</th>
                <th className="p-4 text-left font-semibold text-gray-700">Imagen</th>
                <th className="p-4 text-left font-semibold text-gray-700">Nombre</th>
                <th className="p-4 text-left font-semibold text-gray-700">Categoría</th>
                <th className="p-4 text-left font-semibold text-gray-700">Precio</th>
                <th className="p-4 text-left font-semibold text-gray-700">Inventario</th>
                <th className="p-4 text-center font-semibold text-gray-700">Estado</th>
                <th className="p-4 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">#{product.id}</td>
                    <td className="p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {CATEGORY_LABELS[product.category] || product.category || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0 ? "bg-red-100 text-red-700" :
                        product.stock <= 5 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleActive(product.id, product.is_active ?? true)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition min-w-[80px] ${
                          product.is_active !== false
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {product.is_active !== false ? "🟢 Activo" : "🔴 Inactivo"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 flex-wrap items-center justify-center">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    {searchTerm ? (
                      <>
                        <p>🔍 No se encontraron productos para "<strong>{searchTerm}</strong>"</p>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-2 text-blue-600 hover:underline text-sm"
                        >
                          Limpiar búsqueda
                        </button>
                      </>
                    ) : (
                      <>
                        No hay productos 📭
                        <div className="mt-2">
                          <Link
                            href="/admin/products/new"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Agregar el primer producto
                          </Link>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 flex gap-4 flex-wrap">
        <span>📌 Inventario:</span>
        <span className="text-green-700">🟢 Normal (&gt;5)</span>
        <span className="text-yellow-700">🟡 Bajo (1-5)</span>
        <span className="text-red-700">🔴 Agotado (0)</span>
        <span className="ml-4">📌 Estado:</span>
        <span className="text-green-700">🟢 Activo (visible en tienda)</span>
        <span className="text-gray-500">🔴 Inactivo (oculto)</span>
      </div>
    </div>
  );
}