import { resolvePayloadUser } from "@/lib/resolvePayloadUser";
import type { Payload } from "payload";

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

const generateOrderId = () => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numbers = Math.floor(10000 + Math.random() * 90000);
  return `${letter}${numbers}`;
};

const generateUniqueOrderId = async (payload: Payload) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderId();
    const existing = await payload.find({
      collection: "orders",
      where: { orderId: { equals: candidate } },
      limit: 1,
      depth: 0,
    });
    if (!existing?.docs?.length) {
      return candidate;
    }
  }
  throw new Error("Failed to generate unique order ID");
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

export const GET = async () => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const result = await payload.find({
    collection: "orders",
    where: { user: { equals: payloadUserId } },
    limit: 1000,
    depth: 2,
    sort: "-createdAt",
  });

  const orders = (result.docs || []).map((doc) => mapOrder(doc as OrderDoc));

  return Response.json({ orders });
};

export const POST = async (request: Request) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const body = (await request.json()) as {
    items?: Array<{
      _id?: string;
      productId?: string;
      name?: string;
      price?: number;
      quantity?: number;
    }>;
    shippingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      postalCode?: string;
      country?: string;
    };
  };

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return new Response("Missing order items", { status: 400 });
  }

  const orderItems = items.map((item) => {
    const productId = item.productId ?? item._id;
    return {
      product: productId,
      quantity: item.quantity ?? 0,
      price: item.price ?? 0,
    };
  });

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );

  const orderId = await generateUniqueOrderId(payload);

  const created = await payload.create({
    collection: "orders",
    data: {
      orderId,
      user: payloadUserId,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
      shippingAddress: {
        street: body.shippingAddress?.street,
        city: body.shippingAddress?.city,
        state: body.shippingAddress?.state,
        zipCode: body.shippingAddress?.zipCode ?? body.shippingAddress?.postalCode,
        country: body.shippingAddress?.country,
      },
    },
    overrideAccess: true,
  });

  return Response.json({
    success: true,
    order: mapOrder(created as OrderDoc),
  });
};
