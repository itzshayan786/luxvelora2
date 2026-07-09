export function logDebug(type, message, data = null) {
  const log = {
    id: Date.now() + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString(),
    type, // 'info' | 'error' | 'success' | 'warn'
    message,
    data,
  };
  if (typeof window !== "undefined") {
    window.__razorpayDebugLogs = window.__razorpayDebugLogs || [];
    window.__razorpayDebugLogs.unshift(log); // Newest logs first
    window.dispatchEvent(new CustomEvent("razorpay-debug-update"));
    console.log(`[RZP-DEBUG] [${type.toUpperCase()}] ${message}`, data || "");
  }
}

export const loadRazorpay = () => {
  logDebug("info", "Loading Razorpay SDK Script...");
  return new Promise((resolve) => {
    if (window.Razorpay) {
      logDebug("success", "Razorpay SDK is already loaded on window.");
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      logDebug("success", "Razorpay SDK script loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      logDebug("error", "Failed to load Razorpay SDK script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export async function openRazorpayCheckout({
  order,
  prefill,
  notes,
  description,
  image,
  orderPayload,
  onVerified,
  onDismiss,
}) {
  logDebug("info", "openRazorpayCheckout initiated", {
    passed_order_id: order?.order?.id,
    passed_amount: order?.order?.amount,
    passed_currency: order?.order?.currency,
    key_prefix: order?.key ? order.key.substring(0, 12) + "..." : "undefined",
  });

  const loaded = await loadRazorpay();

  if (!loaded) {
    logDebug("error", "Unable to load Razorpay Checkout script.");
    throw new Error("Unable to load Razorpay Checkout.");
  }

  const options = {
    key: order.key,
    amount: order.order.amount,
    currency: order.order.currency,
    name: "VELORA",
    description,
    image,

    order_id: order.order.id,

    prefill,

    notes,

    theme: {
      color: "#111827",
    },

    modal: {
      ondismiss: () => {
        logDebug("warn", "Razorpay modal dismissed/closed by user");
        onDismiss?.();
      },
    },

    handler: async function (response) {
      logDebug("success", "Customer authorized payment successfully. Verification initiated.", response);
      try {
        logDebug("info", "Sending payment verification request to /api/verify-payment...", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
        });

        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderPayload,
          }),
        });

        const verified = await verifyRes.json();

        if (!verifyRes.ok) {
          logDebug("error", "Payment verification request rejected by server", verified);
          throw new Error(
            verified.error || "Payment verification failed."
          );
        }

        logDebug("success", "Payment verified and recorded on server successfully!", verified);

        onVerified?.({
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          order: verified.order,
        });
      } catch (err) {
        logDebug("error", "Error during payment verification process", err.message);
        alert(err.message);
      }
    },
  };

  logDebug("info", "Constructed Razorpay options", {
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    order_id: options.order_id,
    prefill: options.prefill,
    notes: options.notes,
  });

  try {
    logDebug("info", "Initializing window.Razorpay instance...");
    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      logDebug("error", "Razorpay payment.failed callback triggered", {
        code: response.error?.code,
        description: response.error?.description,
        source: response.error?.source,
        step: response.error?.step,
        reason: response.error?.reason,
        metadata: response.error?.metadata,
      });
      alert(response.error.description);
    });

    logDebug("info", "Opening Razorpay checkout modal...");
    rzp.open();
  } catch (err) {
    logDebug("error", "Failed to initialize or open Razorpay instance", err.message);
    throw err;
  }
}
