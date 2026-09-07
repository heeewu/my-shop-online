"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "pago_movil" | "binance">("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const safeCart = Array.isArray(cart) ? cart : [];

  // ✅ 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();
  }, []);

  // ✅ 未登录：显示“请登录”提示页面（不自动跳转）
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tu carrito</h2>
          <p className="text-gray-500 mb-6">Necesitas tener una cuenta para agregar productos al carrito y realizar compras.</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline"
            >
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 加载中
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // 空购物车状态（已登录）
  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">Tu carrito está vacío</h2>
        <p className="text-gray-500 mt-2">¡Agrega algunos productos!</p>
        <Link
          href="/"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Ir a comprar
        </Link>
      </div>
    );
  }

  // --- 支付逻辑 ---
  const handleCheckout = async () => {
    setIsLoading(true);

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
          alert("Error al crear el enlace de pago");
          setIsLoading(false);
        }
      } catch (err) {
        alert("Error de red");
        setIsLoading(false);
      }
      return;
    }

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
          alert("Error al crear el pedido");
          setIsLoading(false);
        }
      } catch (err) {
        alert("Error de red");
        setIsLoading(false);
      }
      return;
    }

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
          alert("Error al crear el pedido");
          setIsLoading(false);
        }
      } catch (err) {
        alert("Error de red");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 Carrito</h1>

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
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 支付方式选择区域 */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            {/* 客户信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Nombre</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📱 Teléfono</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0412-XXX-XXXX"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-3">💳 Selecciona el método de pago:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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

            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">{totalItems} productos</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
            >
              {isLoading
                ? "Procesando..."
                : `Pagar (${
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
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}