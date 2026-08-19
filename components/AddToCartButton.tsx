"use client";

import { useCart } from "@/context/CartContext";

type Props = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
};

export default function AddToCartButton({ productId, productName, productPrice, productImage }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart({ id: productId, name: productName, price: productPrice, image: productImage })}
      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      加入购物车
    </button>
  );
}
