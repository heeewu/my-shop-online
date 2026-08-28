import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 使用 Service Role Key 初始化 Supabase（绕过 RLS，拥有全部权限）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 从请求体中获取订单信息（现在用 name 和 phone 代替 email）
    const { items, total, name, phone, method } = await req.json();

    // 插入订单到 Supabase 的 orders 表
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name || "Cliente",
          customer_phone: phone || "No especificado",
          items: items,
          total_amount: total,
          status: "pending",
          payment_method: method, // 'pago_movil' 或 'binance'
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("创建订单失败:", error);
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    // 返回订单 ID，前端跳转到订单详情页
    return NextResponse.json({ orderId: data.id });
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}