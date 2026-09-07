"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CartBadge() {
  const { totalItems } = useCart();
  const [animate, setAnimate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();
  }, []);

  // 跳动动画
  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // 加载中
  if (isLoggedIn === null) {
    return <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>;
  }

  return (
    // ✅ 无论是否登录，都跳转到 /cart（购物车页面负责处理登录检查）
    <Link
      href="/cart"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity relative"
    >
      <span className="text-sm text-gray-600">🛒 Carrito</span>

      {/* ✅ 只有已登录用户才显示蓝色圈 */}
      {isLoggedIn && (
        <span
          className={`bg-blue-600 text-white text-sm font-bold rounded-full px-3 py-1 min-w-[24px] text-center transition-all ${
            animate ? "animate-bounce" : ""
          }`}
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}