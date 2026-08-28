"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">📋 Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">{orders?.length || 0} pedidos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">Pedido</th>
                <th className="p-4 text-left font-semibold text-gray-700">Cliente</th>
                <th className="p-4 text-left font-semibold text-gray-700">Total</th>
                <th className="p-4 text-left font-semibold text-gray-700">Método</th>
                <th className="p-4 text-left font-semibold text-gray-700">Referencia</th>
                <th className="p-4 text-left font-semibold text-gray-700">Estado</th>
                <th className="p-4 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">{order.order_number || `#${order.id}`}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{order.customer_name || "—"}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone || "—"}</div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-blue-600">
                      ${order.total_amount?.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment_method === "stripe" ? "bg-purple-100 text-purple-700" :
                        order.payment_method === "pago_movil" ? "bg-green-100 text-green-700" :
                        order.payment_method === "binance" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.payment_method || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs">
                        {order.reference_number || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap items-center">
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