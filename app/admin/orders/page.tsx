"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

// ✅ 筛选选项
const STATUS_FILTERS = [
  { label: "Todos", value: "all" },
  { label: "⏳ Pendiente", value: "pending" },
  { label: "📩 Por Revisar", value: "paid" },
  { label: "✅ Confirmado", value: "confirmed" },
  { label: "❌ Cancelado", value: "cancelled" },
];

const PAGE_SIZE = 10; // ✅ 每页 10 条

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // ✅ 筛选
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // ✅ 分页
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await query.range(from, to);

    if (!error) {
      setOrders(data || []);
      setTotalOrders(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      alert("Error al actualizar, intenta de nuevo");
      console.error(error);
    } else {
      fetchOrders();
    }
  };

  // ✅ 导出 CSV
  const handleExport = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      alert("No hay pedidos para exportar");
      return;
    }

    const headers = ["ID", "Orden", "Cliente", "Telefono", "Total", "Metodo", "Estado", "Referencia", "Fecha"];
    const rows = data.map((o) => [
      o.id,
      o.order_number || `#${o.id}`,
      o.customer_name || "",
      o.customer_phone || "",
      o.total_amount?.toFixed(2) || "0.00",
      o.payment_method || "",
      o.status || "",
      o.reference_number || "",
      new Date(o.created_at).toLocaleString(),
    ]);

    let csv = headers.join(",") + "\n";
    csv += rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">{totalOrders} pedidos</p>
        </div>
        {/* ✅ 导出按钮 */}
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* ✅ Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === filter.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-center font-semibold text-gray-700">Pedido</th>
                <th className="p-4 text-left font-semibold text-gray-700">Cliente</th>
                <th className="p-4 text-center font-semibold text-gray-700">Total</th>
                <th className="p-4 text-center font-semibold text-gray-700">Método</th>
                <th className="p-4 text-center font-semibold text-gray-700">Referencia</th>
                <th className="p-4 text-center font-semibold text-gray-700">Estado</th>
                <th className="p-4 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 text-center font-medium">
                      {order.order_number || `#${order.id}`}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{order.customer_name || "—"}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone || "—"}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      ${order.total_amount?.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment_method === "stripe" ? "bg-purple-100 text-purple-700" :
                        order.payment_method === "pago_movil" ? "bg-green-100 text-green-700" :
                        order.payment_method === "binance" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.payment_method || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-xs">
                        {order.reference_number || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block min-w-[90px] ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "paid" ? "bg-blue-100 text-blue-700" :
                        order.status === "confirmed" ? "bg-green-100 text-green-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status === "pending" && "⏳ Pendiente"}
                        {order.status === "paid" && "📩 Por Revisar"}
                        {order.status === "confirmed" && "✅ Confirmado"}
                        {order.status === "cancelled" && "❌ Cancelado"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 flex-wrap items-center justify-center">
                        <Link
                          href={`/order/${order.id}`}
                          target="_blank"
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          📄 Ver Detalle
                        </Link>

                        {order.status === "paid" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            ✅ Confirmar
                          </button>
                        )}
                        {(order.status === "pending" || order.status === "paid") && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            ❌ Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No hay pedidos 📭
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 flex gap-4 flex-wrap">
        <span>📌 Estados:</span>
        <span>⏳ Pendiente = Cliente creó el pedido</span>
        <span>📩 Por Revisar = Cliente pagó, espera verificación</span>
        <span>✅ Confirmado = Pedido completado</span>
        <span>❌ Cancelado = Pedido cancelado</span>
      </div>
    </div>
  );
}