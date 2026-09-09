"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    }
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        {/* 用户头像按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm hover:text-blue-600 transition"
        >
          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </span>
          <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
          {/* 下拉箭头 */}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* ✅ 下拉菜单 - 带平滑动画 */}
        <div
          className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50 origin-top-right transition-all duration-200 ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            👤 Mi perfil
          </Link>
          <Link
            href="/orders"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            📋 Mis pedidos
          </Link>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
        Iniciar sesión
      </Link>
      <span className="text-gray-300">|</span>
      <Link href="/auth/register" className="text-sm text-blue-600 hover:text-blue-700 transition font-medium">
        Registrarse
      </Link>
    </div>
  );
}