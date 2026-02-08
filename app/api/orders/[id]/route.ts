import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

type MediaDoc = { url?: string } | string | number | null | undefined;
type ProductDoc =
  | {
      id?: string | number;
      _id?: string | number;
      name?: string;
      images?: MediaDoc[] | null;
    }
  | string
  | null
  | undefined;

type OrderItemDoc = {
  product?: ProductDoc;
  quantity?: number;
  price?: number;
};

type OrderDoc = {
  id?: string | number;
  _id?: string | number;
  orderId?: string;
  user?: { id?: string | number; _id?: string | number } | string | number | null;
  items?: OrderItemDoc[];
  totalAmount?: number;
  status?: "pending" | "paid" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

const normalizeId = (value?: string | number | null) =>
  value === undefined || value === null ? undefined : String(value);

const getId = (doc?: { id?: string | number; _id?: string | number } | null) =>
  normalizeId(doc?.id ?? doc?._id);

const getMediaUrl = (media: MediaDoc) => {
  if (media && typeof media === "object" && "url" in media) {
    return typeof media.url === "string" ? media.url : undefined;
  }
  return undefined;
};

const mapOrder = (order: OrderDoc) => {
  const payloadId = normalizeId(order.id ?? order._id) ?? "";
  const orderId = order.orderId ?? payloadId;
  const userId =
    typeof order.user === "string" || typeof order.user === "number"
      ? String(order.user)
      : getId(order.user as { id?: string | number; _id?: string | number } | null) || "";

  const items = (order.items ?? []).map((item) => {
    const product = item.product;
    const productId =
      typeof product === "string"
        ? product
      : getId(product as { id?: string | number; _id?: string | number } | null) || "";
    const name =
      product && typeof product === "object" ? product.name || "" : "";
    const images =
      product && typeof product === "object" && Array.isArray(product.images)
        ? product.images
        : [];
    const image = images.length ? getMediaUrl(images[0]) : undefined;

    return {
      productId,
      name,
      price: item.price ?? 0,
      quantity: item.quantity ?? 0,
      image,
    };
  });

  return {
    _id: payloadId,
    orderId,
    userId,
    items,
    total: order.totalAmount ?? 0,
    status: order.status ?? "pending",
    paymentStatus: order.paymentStatus ?? "pending",
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? new Date().toISOString(),
  };
};

const ensureOwnership = (
  payloadUserId: string | number,
  order: OrderDoc | null | undefined
) => {
  if (!order) return false;
  const orderUser =
    typeof order.user === "string" || typeof order.user === "number"
      ? String(order.user)
      : getId(order.user as { id?: string | number; _id?: string | number } | null);
  return orderUser === String(payloadUserId);
};

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { id } = await context.params;
  const { payload, payloadUserId } = resolved;
  const order = (await payload.findByID({
    collection: "orders",
    id,
    depth: 2,
  })) as OrderDoc | null;

  if (!ensureOwnership(payloadUserId, order)) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json({ order: mapOrder(order as OrderDoc) });
};

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { id } = await context.params;
  const { payload, payloadUserId } = resolved;
  const order = (await payload.findByID({
    collection: "orders",
    id,
    depth: 0,
  })) as OrderDoc | null;

  if (!ensureOwnership(payloadUserId, order)) {
    return new Response("Forbidden", { status: 403 });
  }

  await payload.delete({
    collection: "orders",
    id,
    overrideAccess: true,
  });

  return Response.json({ success: true });
};
