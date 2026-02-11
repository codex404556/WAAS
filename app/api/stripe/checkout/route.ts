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

const getBaseOrigin = (fallbackOrigin: string) => {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_PAYLOAD_URL ||
    fallbackOrigin
  );
};

const normalizeImageUrl = (rawUrl: string, fallbackOrigin: string) => {
  const url = rawUrl.trim();
  if (!url) return undefined;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Protocol-relative URL: //cdn.example.com/image.png
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  // Root-relative URL: /media/image.png
  if (url.startsWith("/")) {
    const base = getBaseOrigin(fallbackOrigin).replace(/\/$/, "");
    return `${base}${url}`;
  }

  // Relative path without leading slash: media/image.png
  const base = getBaseOrigin(fallbackOrigin).replace(/\/$/, "");
  const normalizedPath = url.replace(/^\.?\/*/, "");
  if (normalizedPath) {
    return `${base}/${normalizedPath}`;
  }

  return undefined;
};

const getFallbackImageUrl = (fallbackOrigin: string) => {
  const raw = process.env.NEXT_PUBLIC_STRIPE_FALLBACK_IMAGE_URL?.trim();
  if (!raw) return undefined;
  return normalizeImageUrl(raw, fallbackOrigin);
};

export const POST = async (request: Request) => {
  try {
    const payload = (await request.json()) as CheckoutPayload;
    const requestOrigin = new URL(request.url).origin;
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!payload.successUrl || !payload.cancelUrl) {
      return new Response("Missing successUrl or cancelUrl", { status: 400 });
    }

    if (items.length === 0) {
      return new Response("Missing items", { status: 400 });
    }

    const fallbackImage = getFallbackImageUrl(requestOrigin);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item, index) => {
        const normalizedImages = (item.images || [])
          .map((img) => normalizeImageUrl(img, requestOrigin))
          .filter((img): img is string => Boolean(img));

        const checkoutImages =
          normalizedImages.length > 0
            ? normalizedImages
            : fallbackImage
              ? [fallbackImage]
              : [];

        if (
          process.env.NODE_ENV !== "production" &&
          (item.images?.length ?? 0) > 0 &&
          checkoutImages.length === 0
        ) {
          console.warn("Stripe checkout image dropped", {
            itemIndex: index,
            itemName: item.name,
            rawImages: item.images,
          });
        }

        return {
          price_data: {
            currency: item.currency,
            product_data: {
              name: item.name,
              description: item.description,
              images: checkoutImages,
            },
            unit_amount: item.amount,
          },
          quantity: item.quantity,
        };
      }
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
