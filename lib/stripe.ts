"use client";

export type StripeCheckoutItem = {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
  images?: string[];
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
