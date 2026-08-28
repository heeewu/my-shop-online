import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 验证登录状态
async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

// GET：获取商品列表（其实在 page.tsx 里已经用了服务端查询，这个 API 可以不做）
// 但为了 RESTful 风格，我们还是加上

// POST：新增商品
export async function POST(req: Request) {
  const isLoggedIn = await checkAuth();
  if (!isLoggedIn) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image");

    if (!name || isNaN(price) || !image) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price, image }])
      .select()
      .single();

    if (error) {
      console.error("新增商品失败:", error);
      return NextResponse.json(
        { error: "新增商品失败" },
        { status: 500 }
      );
    }

    // 重定向到商品列表
    return NextResponse.redirect(new URL("/admin/products", req.url));
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}