"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const { totalItems } = useCart();
  const [animate, setAnimate] = useState(false);

  // 当数量变化时触发跳动动画
  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <Link href="/cart" className="flex items-center gap-2 hover:opacity-80 transition-opacity relative">
      <span className="text-sm text-gray-600">🛒 Carrito</span>
      <span
        className={`bg-blue-600 text-white text-sm font-bold rounded-full px-3 py-1 min-w-[24px] text-center transition-all ${
          animate ? "animate-bounce" : ""
        }`}
      >
        {totalItems}
      </span>
    </Link>
  );
}