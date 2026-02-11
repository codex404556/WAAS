import configPromise from "@payload-config";
import { getPayload } from "payload";
import Stripe from "stripe";

export const runtime = "nodejs";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
};

const getWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
};

type OrderDoc = {
  id?: string | number;
  orderId?: string;
  status?: "pending" | "paid" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  stripeSessionId?: string;
};

const resolveOrderRef = (session: Stripe.Checkout.Session) =>
  session.metadata?.orderId || session.client_reference_id || "";

const toAmount = (amountTotal: number | null | undefined) => {
  if (typeof amountTotal !== "number" || !Number.isFinite(amountTotal)) return 0;
  return amountTotal / 100;
};

const resolvePaymentIntentId = (
  paymentIntent: Stripe.Checkout.Session["payment_intent"]
) => {
  if (typeof paymentIntent === "string") return paymentIntent;
  if (paymentIntent && typeof paymentIntent === "object" && "id" in paymentIntent) {
    return paymentIntent.id;
  }
  return undefined;
};

const updateOrderFromSession = async ({
  session,
  paymentStatus,
}: {
  session: Stripe.Checkout.Session;
  paymentStatus: "paid" | "failed";
}) => {
  const orderRef = resolveOrderRef(session);
  if (!orderRef) {
    console.warn("[stripe-webhook] Missing order reference", {
      sessionId: session.id,
      paymentStatus,
    });
    return;
  }

  const payload = await getPayload({ config: configPromise });
  let order: OrderDoc | null = null;
  try {
    order = (await payload.findByID({
      collection: "orders",
      id: orderRef,
      depth: 0,
    })) as OrderDoc | null;
  } catch {
    console.warn("[stripe-webhook] Order lookup failed", {
      orderRef,
      sessionId: session.id,
      paymentStatus,
    });
    return;
  }

  if (!order) {
    console.warn("[stripe-webhook] Order not found", {
      orderRef,
      sessionId: session.id,
      paymentStatus,
    });
    return;
  }

  const alreadySettled =
    paymentStatus === "paid" &&
    order.paymentStatus === "paid" &&
    order.stripeSessionId === session.id;
  if (alreadySettled) {
    console.info("[stripe-webhook] Order already settled", {
      orderRef,
      sessionId: session.id,
      paymentStatus: order.paymentStatus,
    });
    return;
  }

  const nextStatus =
    paymentStatus === "paid"
      ? order.status === "completed" || order.status === "cancelled"
        ? order.status
        : "paid"
      : order.status;

  const updateData: {
    paymentStatus: "paid" | "failed";
    status?: "pending" | "paid" | "completed" | "cancelled";
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    stripeAmountTotal: number;
    stripeAmountTotalCents: number;
    stripeCurrency: string;
    paidAt?: string;
  } = {
    paymentStatus,
    stripeSessionId: session.id,
    stripePaymentIntentId: resolvePaymentIntentId(session.payment_intent),
    stripeAmountTotal: toAmount(session.amount_total),
    stripeAmountTotalCents: session.amount_total ?? 0,
    stripeCurrency: (session.currency || "usd").toUpperCase(),
  };

  if (nextStatus) {
    updateData.status = nextStatus;
  }

  if (paymentStatus === "paid") {
    updateData.paidAt = new Date().toISOString();
  }

  await payload.update({
    collection: "orders",
    id: orderRef,
    data: updateData,
    overrideAccess: true,
  });

  console.info("[stripe-webhook] Order updated", {
    orderRef,
    sessionId: session.id,
    paymentStatus: updateData.paymentStatus,
    orderStatus: updateData.status,
    amountCents: updateData.stripeAmountTotalCents,
    currency: updateData.stripeCurrency,
  });
};

export const POST = async (request: Request) => {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const rawBody = await request.text();
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.info("[stripe-webhook] Event received", {
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info("[stripe-webhook] checkout.session.completed", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          orderRef: resolveOrderRef(session),
        });
        if (session.payment_status === "paid") {
          await updateOrderFromSession({ session, paymentStatus: "paid" });
        } else {
          console.info("[stripe-webhook] Session completed but not paid", {
            sessionId: session.id,
            paymentStatus: session.payment_status,
          });
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info("[stripe-webhook] checkout.session.async_payment_succeeded", {
          sessionId: session.id,
          orderRef: resolveOrderRef(session),
        });
        await updateOrderFromSession({ session, paymentStatus: "paid" });
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn("[stripe-webhook] checkout.session.async_payment_failed", {
          sessionId: session.id,
          orderRef: resolveOrderRef(session),
        });
        await updateOrderFromSession({ session, paymentStatus: "failed" });
        break;
      }
      default:
        console.info("[stripe-webhook] Unhandled event type", {
          eventId: event.id,
          eventType: event.type,
        });
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    console.error("[stripe-webhook] Request failed", { message });
    return new Response(message, { status: 400 });
  }
};
