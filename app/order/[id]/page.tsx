"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  customer_name?: string;   // ✅ 新增
  customer_phone?: string;  // ✅ 新增
};

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);

  const orderId = params.id;

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("加载订单失败", error);
        router.push("/cart");
        return;
      }
      setOrder(data);
      setLoading(false);
    }
    if (orderId) fetchOrder();
  }, [orderId, router]);

  const confirmPayment = async () => {
    if (!reference.trim()) {
      alert("请填写转账参考号 (Número de Referencia / TxID)");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        reference_number: reference,
      })
      .eq("id", orderId);

    if (error) {
      alert("确认失败，请重试");
      console.error("Supabase 更新失败:", error);
    } else {
      clearCart();
      alert("✅ 已收到您的确认！购物车已清空，管理员将尽快核实。");
      window.location.reload();
    }
  };

  if (loading) return <div className="p-10 text-center">加载中...</div>;
  if (!order) return <div className="p-10 text-center">订单不存在</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        {/* 🖨️ 打印按钮 - 位于页面右上角 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.print()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🖨️ 打印订单
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">🧾 订单 #{order.order_number}</h1>
        <p className="text-sm text-gray-500 mb-4">
          状态：{order.status === "pending" && "⏳ 待支付"}
          {order.status === "paid" && "📩 已确认，等待审核"}
          {order.status === "confirmed" && "✅ 已确认"}
        </p>

        {/* 🆕 客户信息 */}
        <div className="border-t py-4">
          <h2 className="font-bold">👤 客户信息</h2>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-gray-500">姓名：</span>
              <span className="font-medium">{order.customer_name || "—"}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">电话：</span>
              <span className="font-medium">{order.customer_phone || "—"}</span>
            </p>
          </div>
        </div>

        <div className="border-t py-4">
          <h2 className="font-bold">📦 商品明细</h2>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-2">
            总金额: ${order.total_amount.toFixed(2)}
          </div>
        </div>

        {order.status === "pending" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
            {order.payment_method === "pago_movil" && (
              <>
                <p className="font-bold text-red-600">⚠️ 转账信息 (Pago Móvil)</p>
                <p>📞 电话: <span className="font-mono">0412-8888-117</span></p>
                <p>🆔 身份证: <span className="font-mono">V-29778258</span></p>
                <p>🏦 银行: <span className="font-mono">Banco de Venezuela</span></p>
                <p className="text-sm text-gray-600 mt-2">
                  转账后请复制参考号（Número de Referencia）填到下方。
                </p>
              </>
            )}

            {order.payment_method === "binance" && (
              <>
                <p className="font-bold text-yellow-600">🟡 转账信息 (Binance USDT)</p>
                <p>📧 币安邮箱: <span className="font-mono">tu_correo@binance.com</span></p>
                <p>🆔 币安 UID: <span className="font-mono">123456789</span></p>
                <p>💰 网络: <span className="font-mono">BEP-20 (BSC)</span></p>
                <p>🔗 钱包地址: <span className="font-mono text-sm break-all">0x1234...ABCD</span></p>
                <p className="text-sm text-gray-600 mt-2">
                  请转账后，将 **TxID（交易哈希）** 复制粘贴到下方参考号框内。
                </p>
              </>
            )}
          </div>
        )}

        {order.status === "pending" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              {order.payment_method === "binance" ? "TxID (交易哈希)" : "参考号 (Número de Referencia)"}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2"
              placeholder={order.payment_method === "binance" ? "例如: 0xabcd1234..." : "例如: 0001234567"}
            />
            <button
              onClick={confirmPayment}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
            >
              我已转账，确认支付
            </button>
          </div>
        )}

        {order.status === "paid" && (
          <div className="bg-blue-50 p-4 rounded-lg">
            ✅ 您的确认已提交。请等待管理员审核（通常 24 小时内）。
          </div>
        )}

        <button onClick={() => router.push("/")} className="mt-6 text-blue-600 hover:underline">
          ← 返回首页
        </button>
      </div>
    </main>
  );
}
