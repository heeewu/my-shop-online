"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-sm text-gray-600">🛒 购物车</span>
      <span className="bg-blue-600 text-white text-sm font-bold rounded-full px-3 py-1">
        {totalItems}
      </span>
    </Link>
  );
}