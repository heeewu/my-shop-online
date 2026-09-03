"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { id: "FIESTA", label: "🎉 Fiesta" },
  { id: "COMESTICOS", label: "💄 Cosméticos" },
  { id: "ESCOLARES", label: "📚 Escolares" },
  { id: "QUINCALLERIA", label: "🔧 Quincallería" },
  { id: "JUGUETES", label: "🧸 Juguetes" },
  { id: "ACCESORIOS", label: "👗 Accesorios" },
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(""); // ✅ 分类
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [productId, setProductId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const id = parseInt(params.id);
      setProductId(id);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Producto no encontrado");
        router.push("/admin/products");
        return;
      }

      setName(data.name);
      setPrice(data.price.toString());
      setStock(data.stock?.toString() || "100");
      setCategory(data.category || ""); // ✅ 加载分类
      setImage(data.image);
      setPreview(data.image);
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setImage(data.url);
        alert("✅ Imagen actualizada");
      } else {
        alert("❌ Error al subir: " + data.error);
        setPreview(image);
      }
    } catch (err) {
      alert("❌ Error al subir la imagen");
      setPreview(image);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);

    const res = await fetch("/api/admin/products/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productId,
        name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category, // ✅ 提交分类
        image,
      }),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("Error al actualizar");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✏️ Editar Producto</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline text-sm">
          ← Volver a Productos
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (USD) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ 分类 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccionar categoría...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventario (cantidad) *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="0"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Producto (JPG / PNG / WEBP, máx 2MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition text-sm font-medium border-2 border-dashed border-gray-300 hover:border-blue-400">
                {uploading ? "Subiendo..." : "📁 Cambiar Imagen"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && <span className="text-sm text-blue-500">Subiendo, espera...</span>}
            </div>

            {preview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                <img
                  src={preview}
                  alt={name}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              {saving ? "Actualizando..." : "💾 Actualizar Producto"}
            </button>
            <Link
              href="/admin/products"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}