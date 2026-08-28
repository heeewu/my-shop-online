import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

export async function POST(req: Request) {
  const isLoggedIn = await checkAuth();
  if (!isLoggedIn) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const id = parseInt(formData.get("id") as string);

    if (!id) {
      return NextResponse.json(
        { error: "缺少商品 ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("删除商品失败:", error);
      return NextResponse.json(
        { error: "删除商品失败" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL("/admin/products", req.url));
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}