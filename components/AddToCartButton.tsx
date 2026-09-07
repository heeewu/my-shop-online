"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { showToast } from "../app/components/Toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
};

export default function AddToCartButton({ productId, productName, productPrice, productImage }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = async () => {
    // ✅ 检查用户是否登录
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      showToast("🔒 Inicia sesión para agregar al carrito", "warning", 3000);
      setTimeout(() => router.push("/auth/login"), 1500);
      return;
    }

    // 已登录，添加到购物车
    addToCart({ id: productId, name: productName, price: productPrice, image: productImage });

    // 触发动画
    setIsAdded(true);
    setIsAnimating(true);

    // 显示 Toast 提示
    showToast(`🛒 "${productName}" añadido al carrito`, "success", 2000);

    // 重置按钮状态
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`mt-3 w-full font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
        isAdded
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      } ${isAnimating ? "animate-bounce" : ""}`}
    >
      {isAdded ? "✅ Añadido" : "🛒 Añadir al carrito"}
    </button>
  );
}