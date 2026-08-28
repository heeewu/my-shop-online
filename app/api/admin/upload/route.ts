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
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择图片" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "只支持 JPG、PNG、WEBP、GIF 格式" },
        { status: 400 }
      );
    }

    // 限制文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片大小不能超过 2MB" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("上传失败:", error);
      return NextResponse.json(
        { error: "图片上传失败" },
        { status: 500 }
      );
    }

    // 获取公开 URL
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (err) {
    console.error("服务器错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}