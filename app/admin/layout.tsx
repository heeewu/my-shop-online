"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Verificar si es la página de login
  const isLoginPage = pathname === "/admin/login";

  // La página de login no necesita autenticación
  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check-auth");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [router, isLoginPage]);

  // ✅ Login: mostrar solo el contenido (sin sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // ✅ Admin: mostrar sidebar + contenido
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">🛍️ Panel Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            📊 Resumen
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            📋 Pedidos
          </Link>
          <Link href="/admin/products" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            📦 Productos
          </Link>
          {/* ✅ 新增分类管理链接 */}
          <Link href="/admin/categories" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            📂 Categorías
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}