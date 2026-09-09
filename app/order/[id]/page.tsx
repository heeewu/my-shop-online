"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

type Order = {
  id: number;
  order_number?: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_method?: string;
  reference_number?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_id_number?: string;
  customer_bank?: string;
  created_at?: string;
};

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const orderId = params.id;

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        console.error("加载订单失败", error);
        router.push("/");
        return;
      }
      setOrder(data);
      setLoading(false);
    }
    if (orderId) fetchOrder();
  }, [orderId, router]);

  const confirmPayment = async () => {
    if (!reference.trim()) {
      alert("Por favor, ingresa el Número de Referencia / TxID");
      return;
    }

    setConfirming(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        reference_number: reference,
      })
      .eq("id", orderId);

    if (error) {
      alert("Error al confirmar el pago");
      console.error(error);
      setConfirming(false);
    } else {
      clearCart();
      alert("✅ Pago confirmado. Tu pedido está en revisión.");
      window.location.reload();
    }
  };

  // ✅ 格式化时间
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("es-VE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ 获取状态信息
  const getStatusInfo = () => {
    switch (order?.status) {
      case "pending":
        return { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: "⏳" };
      case "paid":
        return { label: "En revisión", color: "bg-blue-100 text-blue-700", icon: "📩" };
      case "confirmed":
        return { label: "Confirmado", color: "bg-green-100 text-green-700", icon: "✅" };
      case "cancelled":
        return { label: "Cancelado", color: "bg-red-100 text-red-700", icon: "❌" };
      default:
        return { label: order?.status || "Desconocido", color: "bg-gray-100 text-gray-700", icon: "📌" };
    }
  };

  // ✅ 订单跟踪步骤
  const getTrackingSteps = () => {
    const steps = [
      { key: "pending", label: "Pendiente", icon: "⏳" },
      { key: "paid", label: "En revisión", icon: "📩" },
      { key: "confirmed", label: "Confirmado", icon: "✅" },
      { key: "completed", label: "Completado", icon: "🎉" },
    ];

    let currentStep = 0;
    switch (order?.status) {
      case "pending":
        currentStep = 0;
        break;
      case "paid":
        currentStep = 1;
        break;
      case "confirmed":
        currentStep = 2;
        break;
      case "cancelled":
        currentStep = -1;
        break;
      default:
        currentStep = 0;
    }

    return { steps, currentStep, isCancelled: order?.status === "cancelled" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Pedido no encontrado</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const isPending = order.status === "pending";
  const { steps, currentStep, isCancelled } = getTrackingSteps();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 打印按钮 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.print()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🖨️ Imprimir
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* 1️⃣ 订单信息 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🧾 Pedido {order.order_number || `#${order.id}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  📅 {formatDate(order.created_at)}
                </p>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>
          </div>

          {/* 2️⃣ 订单跟踪 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">📌 Seguimiento del Pedido</h2>

            {isCancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
                ❌ Este pedido ha sido cancelado
              </div>
            ) : (
              <div className="relative">
                {/* 进度条背景 */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* 步骤点 */}
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const isActive = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                            isActive
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-400 border-gray-300"
                          } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-xs mt-2 text-center ${
                            isActive ? "text-blue-600 font-medium" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3️⃣ 商品详情 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">📦 Productos</h2>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs ml-2">x{item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs">${item.price.toFixed(2)}</span>
                    <span className="text-gray-300 mx-1">→</span>
                    <span className="font-bold text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 4️⃣ 支付方式与参考号 */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">💳 Pago</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Método de pago</span>
                <span className="font-medium">
                  {order.payment_method === "pago_movil" ? "📱 Pago Móvil" : "🟡 Binance (USDT)"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Referencia</span>
                <span className="font-mono text-sm">
                  {order.reference_number || "—"}
                </span>
              </div>
              {order.customer_bank && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Banco</span>
                  <span className="font-medium">{order.customer_bank}</span>
                </div>
              )}
            </div>

            {/* 参考号输入（仅待支付状态） */}
            {isPending && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {order.payment_method === "binance" ? "TxID (Hash de transacción)" : "Número de Referencia"}
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={
                    order.payment_method === "binance"
                      ? "Ej: 0xabcd1234..."
                      : "Ej: 0001234567"
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {order.payment_method === "binance"
                    ? "Ingresa el TxID de la transacción en Binance"
                    : "Ingresa el número de referencia de tu transferencia"}
                </p>
              </div>
            )}

            {/* 状态提示 */}
            {isPending && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                <p className="font-semibold">⏳ Pendiente de pago</p>
                <p className="text-xs mt-1">
                  Realiza la transferencia y confirma tu pago ingresando el número de referencia.
                  <br />
                  <span className="text-gray-500">Verificación manual en 24 horas.</span>
                </p>
              </div>
            )}

            {order.status === "paid" && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-semibold">📩 Pago en revisión</p>
                <p className="text-xs mt-1">Tu pago está siendo verificado. Te confirmaremos en 24 horas.</p>
              </div>
            )}

            {order.status === "confirmed" && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                <p className="font-semibold">✅ Pedido confirmado</p>
                <p className="text-xs mt-1">Tu pedido ha sido confirmado y está en proceso.</p>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-semibold">❌ Pedido cancelado</p>
                <p className="text-xs mt-1">Este pedido ha sido cancelado.</p>
              </div>
            )}

            {/* 确认支付按钮 */}
            {isPending && (
              <button
                onClick={confirmPayment}
                disabled={confirming}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
              >
                {confirming ? "Confirmando..." : "✅ Ya realicé el pago"}
              </button>
            )}
          </div>
        </div>

        {/* 返回链接 */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  );
}