import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // 验证登录状态（异步）
  const cookieStore = await cookies(); // ✅ 加上 await
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "true";

  if (!isLoggedIn) {
    return NextResponse.json(
      { error: "未授权" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const orderId = formData.get("orderId");
    const status = formData.get("status");

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "缺少参数" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: status })
      .eq("id", Number(orderId));

    if (error) {
      console.error("更新订单失败:", error);
      return NextResponse.json(
        { error: "更新失败" },
        { status: 500 }
      );
    }

    // 重定向回管理页面
    return NextResponse.redirect(new URL("/admin", req.url));
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}