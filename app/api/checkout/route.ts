import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json(); // ← 接收金额

    // 金额必须大于 0
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "金额无效" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "我的海外商店 - 订单",
            },
            unit_amount: Math.round(amount * 100), // 转为美分
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe 创建会话错误:", err);
    return NextResponse.json(
      { error: "创建支付会话失败" },
      { status: 500 }
    );
  }
}