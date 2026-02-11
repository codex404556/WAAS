"use client";

export type StripeCheckoutItem = {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
  images?: string[];
};

type StripeOrderItemInput = {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  quantity?: number | null;
  image?: string | null;
};

type CheckoutSessionRequest = {
  items: StripeCheckoutItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

type CheckoutSessionResponse =
  | { sessionId: string; url?: string }
  | { error: string };

export const createCheckoutSession = async (
  payload: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await res.text();
      return { error: message || "Failed to create Stripe session" };
    }

    const data = (await res.json()) as { sessionId?: string; url?: string };
    if (!data.sessionId) {
      return { error: "Missing Stripe session ID" };
    }

    return { sessionId: data.sessionId, url: data.url };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe request failed";
    return { error: message };
  }
};

export const redirectToCheckout = async (sessionUrl: string) => {
  if (!sessionUrl) {
    throw new Error("Missing Stripe checkout URL");
  }
  window.location.assign(sessionUrl);
};

const sanitizeText = (value: string, fallback: string, maxLength: number) => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength - 3)}...`
    : trimmed;
};

export const buildStripeCheckoutItems = (
  items: StripeOrderItemInput[],
  currency = "usd"
): StripeCheckoutItem[] => {
  return items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    const price = Number(item.price ?? 0);
    const image = item.image?.trim();

    return {
      name: sanitizeText(item.name ?? "", "Product", 120),
      description: sanitizeText(
        item.description ?? `Qty: ${quantity}`,
        `Qty: ${quantity}`,
        180
      ),
      amount: Math.max(0, Math.round(price * 100)),
      currency,
      quantity,
      images: image ? [image] : undefined,
    };
  });
};

export const buildStripeChargeItems = ({
  shipping = 0,
  tax = 0,
  currency = "usd",
}: {
  shipping?: number;
  tax?: number;
  currency?: string;
}): StripeCheckoutItem[] => {
  const chargeItems: StripeCheckoutItem[] = [];

  if (shipping > 0) {
    chargeItems.push({
      name: "Shipping",
      description: "Standard shipping",
      amount: Math.round(shipping * 100),
      currency,
      quantity: 1,
    });
  }

  if (tax > 0) {
    chargeItems.push({
      name: "Tax",
      description: "Sales tax",
      amount: Math.round(tax * 100),
      currency,
      quantity: 1,
    });
  }

  return chargeItems;
};
