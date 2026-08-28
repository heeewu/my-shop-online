"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "pago_movil" | "binance">("stripe");
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 客户信息 state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // 🛡️ 防御性判断：确保 cart 是数组
  const safeCart = Array.isArray(cart) ? cart : [];

  // 空购物车状态
  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">购物车是空的</h2>
        <p className="text-gray-500 mt-2">快去添加一些商品吧！</p>
        <Link
          href="/"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  // --- 支付逻辑 ---
  const handleCheckout = async () => {
    setIsLoading(true);

    // 1. Stripe (外币卡)
    if (selectedMethod === "stripe") {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("创建支付链接失败");
          setIsLoading(false);
        }
      } catch (err) {
        alert("网络错误");
        setIsLoading(false);
      }
      return;
    }

    // 2. Pago Móvil (委内瑞拉本地转账)
    if (selectedMethod === "pago_movil") {
      try {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: safeCart,
            total: totalPrice,
            name: customerName || "Cliente",
            phone: customerPhone || "No especificado",
            method: "pago_movil",
          }),
        });
        const data = await res.json();
        if (data.orderId) {
          window.location.href = `/order/${data.orderId}`;
        } else {
          alert("创建订单失败");
          setIsLoading(false);
        }
      } catch (err) {
        alert("网络错误");
        setIsLoading(false);
      }
      return;
    }

    // 3. Binance (手动转账 USDT)
    if (selectedMethod === "binance") {
      try {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: safeCart,
            total: totalPrice,
            name: customerName || "Cliente",
            phone: customerPhone || "No especificado",
            method: "binance",
          }),
        });
        const data = await res.json();
        if (data.orderId) {
          window.location.href = `/order/${data.orderId}`;
        } else {
          alert("创建订单失败");
          setIsLoading(false);
        }
      } catch (err) {
        alert("网络错误");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 购物车</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* 商品列表 */}
          <div className="divide-y divide-gray-200">
            {safeCart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 支付方式选择区域 */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            {/* 🆕 客户信息输入区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 姓名
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📱 电话号码
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0412-XXX-XXXX"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-3">💳 选择支付方式：</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {/* Stripe */}
              <div
                onClick={() => setSelectedMethod("stripe")}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2 ${
                  selectedMethod === "stripe"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-bold text-sm">Tarjeta (USD)</p>
                  <p className="text-xs text-gray-500">Visa / Mastercard</p>
                </div>
              </div>

              {/* Pago Móvil */}
              <div
                onClick={() => setSelectedMethod("pago_movil")}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2 ${
                  selectedMethod === "pago_movil"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold text-sm">Pago Móvil</p>
                  <p className="text-xs text-gray-500">Bs. (Transferencia)</p>
                </div>
              </div>

              {/* Binance */}
              <div
                onClick={() => setSelectedMethod("binance")}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2 ${
                  selectedMethod === "binance"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">🟡</span>
                <div>
                  <p className="font-bold text-sm">Binance (USDT)</p>
                  <p className="text-xs text-gray-500">Transferencia manual</p>
                </div>
              </div>
            </div>

            {/* 底部结算 */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">共 {totalItems} 件商品</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
            >
              {isLoading
                ? "处理中..."
                : `结算 (${
                    selectedMethod === "stripe"
                      ? "💳 Tarjeta"
                      : selectedMethod === "pago_movil"
                      ? "📱 Pago Móvil"
                      : "🟡 Binance"
                  })`}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 继续购物
          </Link>
        </div>
      </div>
    </main>
  );
}