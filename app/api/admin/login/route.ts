import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { password } = await req.json();

  // 从环境变量获取管理员密码
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("⚠️ ADMIN_PASSWORD 环境变量未配置！");
    return NextResponse.json(
      { error: "服务器配置错误" },
      { status: 500 }
    );
  }

  if (password === adminPassword) {
    const cookieStore = await cookies(); // ✅ 加上 await
    cookieStore.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: "/",
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "密码错误" },
    { status: 401 }
  );
}