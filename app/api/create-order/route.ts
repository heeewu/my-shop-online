import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 使用 Service Role Key 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ 生成订单号：WEB-YYYYMMDD-XXX
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // 查询今日已有订单数
  const startOfDay = new Date(year, today.getMonth(), today.getDate());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(year, today.getMonth(), today.getDate());
  endOfDay.setHours(23, 59, 59, 999);

  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString());

  if (error) {
    console.error("Error al contar pedidos:", error);
    return `WEB-${dateStr}-${String(Date.now()).slice(-6)}`;
  }

  const seq = String((count || 0) + 1).padStart(3, "0");
  return `WEB-${dateStr}-${seq}`;
}

export async function POST(req: Request) {
  try {
    // 从请求体中获取订单信息
    const { items, total, name, phone, method } = await req.json();

    // ✅ 获取当前登录用户
    const { data: { user } } = await supabase.auth.getUser();

    // ✅ 生成订单号
    const orderNumber = await generateOrderNumber();

    // ✅ 检查库存（防止超卖）
    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `Producto "${item.name}" no existe` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.name}" solo hay ${product.stock} disponibles` },
          { status: 400 }
        );
      }
    }

    // ✅ 插入订单到 Supabase 的 orders 表（包含 order_number 和 user_id）
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name || "Cliente",
          customer_phone: phone || "No especificado",
          items: items,
          total_amount: total,
          status: "pending",
          payment_method: method,
          order_number: orderNumber,
          user_id: user?.id || null, // ✅ 关联当前登录用户
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("创建订单失败:", error);
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    // ✅ 减少库存
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.id);
      }
    }

    // 返回订单 ID，前端跳转到订单详情页
    return NextResponse.json({ orderId: data.id });
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}