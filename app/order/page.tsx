"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No tienes pedidos aún</p>
            <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Ir a comprar →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">
                      {order.order_number || `#${order.id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} productos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ${order.total_amount?.toFixed(2)}
                    </p>
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}