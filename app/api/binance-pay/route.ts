import { NextResponse } from "next/server";
import crypto from "crypto";

// 从环境变量读取 Binance 密钥
const BINANCE_API_KEY = process.env.BINANCE_API_KEY!;
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY!;
const BINANCE_BASE_URL = "https://bpay.binanceapi.com"; // 生产环境

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    // 生成商户订单号 (使用时间戳+随机数)
    const merchantTradeNo = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 构造请求体 (Binance Pay 要求)
    const payload = {
      merchantTradeNo,
      orderAmount: amount.toFixed(2),
      currency: "USD", // 以美元计价，客户支付等值 USDT
      goods: {
        goodsName: "Compra en mi tienda",
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    };

    // 准备签名
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    const bodyString = JSON.stringify(payload);

    // Binance Pay 签名规则: HMAC SHA256 (timestamp + nonce + body)
    const signaturePayload = timestamp + "\n" + nonce + "\n" + bodyString + "\n";
    const signature = crypto
      .createHmac("sha256", BINANCE_SECRET_KEY)
      .update(signaturePayload)
      .digest("hex");

    // 发起请求到 Binance
    const response = await fetch(`${BINANCE_BASE_URL}/v1/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": String(timestamp),
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": BINANCE_API_KEY,
        "BinancePay-Signature": signature,
      },
      body: bodyString,
    });

    const data = await response.json();

    if (data.code === "000000") {
      // 成功，返回支付链接
      return NextResponse.json({
        success: true,
        checkoutUrl: data.data.checkoutUrl, // Binance 支付页面的 URL
        tradeNo: data.data.tradeNo,
      });
    } else {
      console.error("Binance Pay 错误:", data);
      return NextResponse.json(
        { success: false, error: data.msg || "创建 Binance 订单失败" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Binance Pay 异常:", err);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}