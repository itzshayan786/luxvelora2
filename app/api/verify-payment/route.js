import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb, validateEnv } from "@/lib/server-init";
import { cleanDoc } from "@/app/api/[[...path]]/route";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    validateEnv();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment details",
        },
        { status: 400 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature",
        },
        { status: 400 }
      );
    }

    // Save order to MongoDB only after successful signature verification.
    const database = await getDb();
    
    const orderId = 'VEL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    
    const order = {
      id: orderId,
      items: orderPayload?.items || [],
      address: orderPayload?.address || {},
      email: orderPayload?.email || "",
      name: orderPayload?.name || "",
      phone: orderPayload?.phone || "",
      payment: "razorpay",
      coupon: orderPayload?.coupon || null,
      subtotal: orderPayload?.subtotal || 0,
      shipping: orderPayload?.shipping || 0,
      discount: orderPayload?.discount || 0,
      total: orderPayload?.total || 0,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'confirmed',
      tracking: [
        { stage: 'confirmed', at: new Date().toISOString(), label: 'Order Confirmed' },
        { stage: 'processing', at: null, label: 'Processing at warehouse' },
        { stage: 'shipped', at: null, label: 'Shipped' },
        { stage: 'out-for-delivery', at: null, label: 'Out for delivery' },
        { stage: 'delivered', at: null, label: 'Delivered' },
      ],
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    };

    await database.collection('orders').insertOne(order);

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      order: cleanDoc(order),
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Verification failed",
      },
      { status: 500 }
    );
  }
}