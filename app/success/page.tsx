"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []); // ← 改成空数组

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-gray-800">支付成功！</h1>
      <p className="text-gray-500 mt-2">感谢您的购买，我们会尽快处理订单。</p>
      <p className="text-sm text-gray-400 mt-1">购物车已自动清空</p>
      <Link
        href="/"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}