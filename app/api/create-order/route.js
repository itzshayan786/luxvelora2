import { NextResponse } from "next/server";
import { getRazorpay, validateEnv } from "@/lib/server-init";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    validateEnv();
    const razorpay = getRazorpay();
    const body = await req.json();

    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay uses paise
      currency: "INR",
      receipt: `VELORA_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to create order",
      },
      { status: 500 }
    );
  }
}