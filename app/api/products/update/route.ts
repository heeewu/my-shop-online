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
    const name = formData.get("name");
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image");

    if (!id || !name || isNaN(price) || !image) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .update({ name, price, image })
      .eq("id", id);

    if (error) {
      console.error("更新商品失败:", error);
      return NextResponse.json(
        { error: "更新商品失败" },
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