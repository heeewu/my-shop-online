"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("📁");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      const id = parseInt(params.id);
      setCategoryId(id);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Categoría no encontrada");
        router.push("/admin/categories");
        return;
      }

      setName(data.name);
      setSlug(data.slug);
      setIcon(data.icon || "📁");
      setDescription(data.description || "");
      setSortOrder(data.sort_order?.toString() || "1");
      setLoading(false);
    }
    fetchCategory();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    setSaving(true);

    const { error } = await supabase
      .from("categories")
      .update({
        name,
        slug,
        icon,
        description,
        sort_order: parseInt(sortOrder) || 1,
      })
      .eq("id", categoryId);

    if (error) {
      alert("❌ Error al actualizar: " + error.message);
      setSaving(false);
    } else {
      router.push("/admin/categories");
      router.refresh();
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
        <h1 className="text-2xl font-bold text-gray-900">✏️ Editar Categoría</h1>
        <Link href="/admin/categories" className="text-blue-600 hover:underline text-sm">
          ← Volver
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
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
              Slug (URL amigable) *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icono
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden de visualización
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="1"
              className="w-full max-w-[120px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              {saving ? "Actualizando..." : "💾 Actualizar Categoría"}
            </button>
            <Link
              href="/admin/categories"
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