"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-2 text-sm hover:text-blue-600 transition">
          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </span>
          <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 hidden group-hover:block">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            👤 Mi perfil
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            📋 Mis pedidos
          </Link>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="text-sm text-gray-600 hover:text-blue-600 transition"
      >
        Iniciar sesión
      </Link>
      <span className="text-gray-300">|</span>
      <Link
        href="/auth/register"
        className="text-sm text-blue-600 hover:text-blue-700 transition font-medium"
      >
        Registrarse
      </Link>
    </div>
  );
}