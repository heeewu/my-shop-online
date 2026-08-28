"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    confirmedOrders: 0,
    totalProducts: 0,
    recentOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: orders } = await supabase.from("orders").select("*");
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        const pending = orders?.filter((o) => o.status === "pending") || [];
        const paid = orders?.filter((o) => o.status === "paid") || [];
        const confirmed = orders?.filter((o) => o.status === "confirmed") || [];

        const recent = orders
          ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) || [];

        setStats({
          totalOrders: orders?.length || 0,
          pendingOrders: pending.length,
          paidOrders: paid.length,
          confirmedOrders: confirmed.length,
          totalProducts: productCount || 0,
          recentOrders: recent,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 Resumen</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Pedidos</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">⏳ Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">📩 Por Revisar</p>
          <p className="text-3xl font-bold text-blue-600">{stats.paidOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">✅ Confirmados</p>
          <p className="text-3xl font-bold text-green-600">{stats.confirmedOrders}</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500">Gestionar Pedidos</p>
            <p className="text-lg font-bold text-gray-900">📋 Ver todos</p>
          </div>
          <span className="text-2xl">→</span>
        </Link>
        <Link
          href="/admin/products"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500">Gestionar Productos</p>
            <p className="text-lg font-bold text-gray-900">📦 {stats.totalProducts} productos</p>
          </div>
          <span className="text-2xl">→</span>
        </Link>
      </div>

      {/* Últimos pedidos */}
      {stats.recentOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">🕐 Últimos Pedidos</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-gray-600">Pedido</th>
                  <th className="p-3 text-left text-gray-600">Cliente</th>
                  <th className="p-3 text-left text-gray-600">Total</th>
                  <th className="p-3 text-left text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">#{order.id}</td>
                    <td className="p-3">{order.customer_name || "—"}</td>
                    <td className="p-3 font-bold text-blue-600">
                      ${order.total_amount?.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "paid" ? "bg-blue-100 text-blue-700" :
                        order.status === "confirmed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status === "pending" && "⏳ Pendiente"}
                        {order.status === "paid" && "📩 Por Revisar"}
                        {order.status === "confirmed" && "✅ Confirmado"}
                        {order.status === "cancelled" && "❌ Cancelado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}