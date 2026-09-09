"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ✅ 委内瑞拉银行列表
const VENEZUELA_BANKS = [
  "Banco de Venezuela",
  "Banesco",
  "Mercantil",
  "Banco Provincial",
  "Banco Nacional de Crédito",
  "Banco del Tesoro",
  "Banco Exterior",
  "Banco Occidental de Descuento (BOD)",
  "Banco de Caroní",
  "Banco Fondo Común",
  "Banco Sofitasa",
  "Banco Plaza",
  "Banco de las Fuerzas Armadas (BANFA)",
  "Banco Agrícola de Venezuela",
  "Banco de Comercio Exterior (BANCOEX)",
  "Banco de Desarrollo de la Mujer (BANMUJER)",
  "Banco del Pueblo Soberano (BPS)",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalItems, totalPrice } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<"pago_movil" | "binance" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ✅ 客户信息
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdNumber, setCustomerIdNumber] = useState("");
  const [customerBank, setCustomerBank] = useState("");

  // ✅ 参考号
  const [referenceNumber, setReferenceNumber] = useState("");

  const safeCart = Array.isArray(cart) ? cart : [];

  // 检查登录状态 + 获取用户资料
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      setIsLoggedIn(true);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", session.user.id)
        .single();

      if (profile && !error) {
        setCustomerName(profile.name || "");
        setCustomerPhone(profile.phone || "");
      }
    }

    loadUserData();
  }, [router]);

  // 如果购物车为空，跳转回首页
  useEffect(() => {
    if (safeCart.length === 0 && isLoggedIn !== null) {
      router.push("/");
    }
  }, [safeCart, isLoggedIn, router]);

  // 加载中
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // 空购物车
  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">Tu carrito está vacío</h2>
        <Link href="/" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
          Ir a comprar
        </Link>
      </div>
    );
  }

  // --- 创建订单 ---
  const handleCreateOrder = async () => {
    if (!customerName.trim()) {
      alert("Por favor, ingresa tu nombre completo");
      return;
    }
    if (!customerPhone.trim()) {
      alert("Por favor, ingresa tu número de teléfono");
      return;
    }
    if (!customerIdNumber.trim()) {
      alert("Por favor, ingresa tu número de cédula");
      return;
    }
    if (!customerBank) {
      alert("Por favor, selecciona tu banco");
      return;
    }
    if (!selectedMethod) {
      alert("Por favor, selecciona un método de pago");
      return;
    }
    if (!referenceNumber.trim()) {
      alert("Por favor, ingresa el Número de Referencia / TxID");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: safeCart,
          total: totalPrice,
          name: customerName,
          phone: customerPhone,
          idNumber: customerIdNumber,
          bank: customerBank,
          method: selectedMethod,
          reference: referenceNumber,
        }),
      });
      const data = await res.json();

      if (data.orderId) {
        router.push(`/order/${data.orderId}`);
      } else {
        alert("Error al crear el pedido");
        setIsLoading(false);
      }
    } catch (err) {
      alert("Error de red");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/cart" className="text-blue-600 hover:underline text-sm inline-block mb-6">
          ← Volver al carrito
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">📝 Confirmar Pedido</h1>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* 1️⃣ 客户信息 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">1</span>
              Datos del Cliente
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Nombre completo *
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
                  📱 Teléfono *
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🆔 Cédula *
                </label>
                <input
                  type="text"
                  value={customerIdNumber}
                  onChange={(e) => setCustomerIdNumber(e.target.value)}
                  placeholder="V-12345678"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏦 Banco *
                </label>
                <select
                  value={customerBank}
                  onChange={(e) => setCustomerBank(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Selecciona tu banco...</option>
                  {VENEZUELA_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Los datos se usarán para la verificación del pago.
            </p>
          </div>

          {/* 2️⃣ 商品明细 */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">2</span>
              Resumen del Pedido
            </h2>

            <div className="space-y-2">
              {safeCart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 text-xs ml-2">x{item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">${item.price.toFixed(2)}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-bold text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 3️⃣ 支付方式 + 转账信息 */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">3</span>
              Método de Pago
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedMethod("pago_movil")}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedMethod === "pago_movil"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  <div>
                    <p className="font-bold text-gray-800">Pago Móvil</p>
                    <p className="text-xs text-gray-500">Transferencia bancaria</p>
                  </div>
                  {selectedMethod === "pago_movil" && (
                    <span className="ml-auto text-blue-600 text-xl">✓</span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("binance")}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedMethod === "binance"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🟡</span>
                  <div>
                    <p className="font-bold text-gray-800">Binance (USDT)</p>
                    <p className="text-xs text-gray-500">Transferencia manual</p>
                  </div>
                  {selectedMethod === "binance" && (
                    <span className="ml-auto text-blue-600 text-xl">✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ 转账信息 - 选择后展开 */}
            {selectedMethod && (
              <div className="mt-4 border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 animate-fadeIn">
                <p className="font-bold text-red-600 text-center text-lg mb-3">
                  ⚠️ INSTRUCCIONES DE TRANSFERENCIA
                </p>

                {selectedMethod === "pago_movil" && (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between py-1 border-b border-yellow-200">
                      <span className="font-semibold text-gray-700">📞 Teléfono</span>
                      <span className="font-mono">0412-8888-117</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-yellow-200">
                      <span className="font-semibold text-gray-700">🆔 Cédula</span>
                      <span className="font-mono">V-29778258</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-gray-700">🏦 Banco</span>
                      <span className="font-mono">Banco de Venezuela</span>
                    </div>
                  </div>
                )}

                {selectedMethod === "binance" && (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between py-1 border-b border-yellow-200">
                      <span className="font-semibold text-gray-700">📧 Correo</span>
                      <span className="font-mono">tu_correo@binance.com</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-yellow-200">
                      <span className="font-semibold text-gray-700">🆔 UID</span>
                      <span className="font-mono">123456789</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-yellow-200">
                      <span className="font-semibold text-gray-700">💰 Red</span>
                      <span className="font-mono">BEP-20 (BSC)</span>
                    </div>
                    <div className="py-1">
                      <span className="font-semibold text-gray-700 block mb-1">🔗 Dirección</span>
                      <span className="font-mono text-xs break-all bg-white/50 p-2 rounded block">
                        0x1234567890ABCDEF1234567890ABCDEF12345678
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-center text-gray-400 mt-3">
                  ⏳ Realiza la transferencia y luego ingresa el número de referencia abajo.
                </p>
              </div>
            )}

            {!selectedMethod && (
              <div className="mt-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-300 rounded-xl py-4">
                👆 Selecciona un método de pago para ver las instrucciones
              </div>
            )}
          </div>

          {/* 4️⃣ Número de Referencia */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">4</span>
              {selectedMethod === "binance" ? "TxID (Hash de transacción)" : "Número de Referencia"}
            </h2>

            <div>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={
                  selectedMethod === "binance"
                    ? "Ej: 0xabcd1234..."
                    : "Ej: 0001234567"
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {selectedMethod === "binance"
                  ? "Ingresa el TxID de la transacción en Binance"
                  : "Ingresa el número de referencia de tu transferencia bancaria"}
              </p>
            </div>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={handleCreateOrder}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
          >
            {isLoading ? "Procesando..." : "✅ Confirmar Pedido"}
          </button>
        </div>
      </div>
    </main>
  );
}