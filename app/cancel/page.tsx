import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">↩️</div>
      <h1 className="text-3xl font-bold text-gray-800">支付未完成</h1>
      <p className="text-gray-500 mt-2">您的购物车商品已保留，可以稍后重新结算。</p>
      <div className="flex gap-4 mt-6">
        <Link
          href="/cart"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          返回购物车
        </Link>
        <Link
          href="/"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          继续购物
        </Link>
      </div>
    </div>
  );
}
