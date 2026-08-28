import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "true";
  return NextResponse.json({ authenticated: isLoggedIn });
}