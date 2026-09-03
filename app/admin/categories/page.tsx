"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert("❌ Error al eliminar");
      console.error(error);
    } else {
      fetchCategories();
      alert("✅ Categoría eliminada");
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("❌ Error al actualizar");
      console.error(error);
    } else {
      fetchCategories();
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📂 Categorías</h1>
          <p className="text-gray-500 mt-1">{categories.length} categorías</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          ➕ Nueva Categoría
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">Icono</th>
                <th className="p-4 text-left font-semibold text-gray-700">Nombre</th>
                <th className="p-4 text-left font-semibold text-gray-700">Slug</th>
                <th className="p-4 text-center font-semibold text-gray-700">Orden</th>
                <th className="p-4 text-center font-semibold text-gray-700">Estado</th>
                <th className="p-4 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 text-2xl">{cat.icon || "📁"}</td>
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 text-gray-500">{cat.slug}</td>
                    <td className="p-4 text-center">{cat.sort_order}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleActive(cat.id, cat.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          cat.is_active !== false
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {cat.is_active !== false ? "🟢 Activo" : "🔴 Inactivo"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 flex-wrap items-center justify-center">
                        <Link
                          href={`/admin/categories/edit/${cat.id}`}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hay categorías 📭
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}