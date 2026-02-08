import Stripe from "stripe";

export const runtime = "nodejs";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
};

type StripeCheckoutItem = {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
  images?: string[];
};

type CheckoutPayload = {
  items: StripeCheckoutItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

const normalizeImageUrl = (url: string) => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (!url.startsWith("/")) {
    return undefined;
  }
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL;
  if (!baseUrl) return undefined;
  return `${baseUrl.replace(/\/$/, "")}${url}`;
};

export const POST = async (request: Request) => {
  try {
    const payload = (await request.json()) as CheckoutPayload;
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!payload.successUrl || !payload.cancelUrl) {
      return new Response("Missing successUrl or cancelUrl", { status: 400 });
    }

    if (items.length === 0) {
      return new Response("Missing items", { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            description: item.description,
            images: (item.images || [])
              .map((img) => normalizeImageUrl(img))
              .filter((img): img is string => Boolean(img)),
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })
    );

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl,
      customer_email: payload.customerEmail || undefined,
      metadata: payload.metadata || undefined,
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe error";
    return new Response(message, { status: 500 });
  }
};
