import { resolvePayloadUser } from "@/lib/resolvePayloadUser";
import type { Product, Wishlist } from "@/payload-types";

export const runtime = "nodejs";

type ProductDoc = { id?: number; _id?: string | number } & Partial<Product>;
type WishlistDoc = Wishlist & { products?: Array<ProductDoc | string> };

const normalizeId = (value?: string | number | null) =>
  value === undefined || value === null ? undefined : String(value);

const getId = (doc?: { id?: string | number; _id?: string | number } | null) =>
  normalizeId(doc?.id ?? doc?._id);

const normalizeProducts = (products: Array<ProductDoc | string> = []) =>
  products
    .map((product) => {
      if (typeof product === "string") {
        return { _id: product } as ProductDoc;
      }
      const id = getId(product);
      return { ...product, _id: id } as ProductDoc;
    })
    .filter((product) => Boolean(product._id));

const findOrCreateWishlist = async (
  payload: ReturnType<typeof resolvePayloadUser> extends Promise<
    infer T
  >
    ? T extends { payload: infer P }
      ? P
      : never
    : never,
  payloadUserId: string
) => {
  const existing = await payload.find({
    collection: "wishlists",
    where: { user: { equals: payloadUserId } },
    limit: 1,
    depth: 1,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0] as WishlistDoc;
  }

  const created = await payload.create({
    collection: "wishlists",
    data: {
      user: payloadUserId,
      products: [],
    },
    overrideAccess: true,
  });

  return created as WishlistDoc;
};

export const GET = async () => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const wishlist = await findOrCreateWishlist(payload, payloadUserId);
  const products = normalizeProducts(wishlist.products);
  const wishlistIds = products.map((product) => String(product._id));

  return Response.json({
    success: true,
    wishlist: wishlistIds,
    products,
  });
};

export const POST = async (request: Request) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const body = (await request.json()) as { productId?: string };
  if (!body.productId) {
    return new Response("Missing productId", { status: 400 });
  }

  const wishlist = await findOrCreateWishlist(payload, payloadUserId);
  const currentProducts = Array.isArray(wishlist.products)
    ? wishlist.products.map((product) =>
        typeof product === "string" ? product : getId(product)
      )
    : [];

  const updatedProducts = Array.from(
    new Set([...currentProducts, body.productId].filter(Boolean))
  );

  const updated = await payload.update({
    collection: "wishlists",
    id: getId(wishlist) as string,
    data: { products: updatedProducts },
    overrideAccess: true,
  });

  const normalized = normalizeProducts(
    (updated as WishlistDoc).products || []
  );

  return Response.json({
    success: true,
    wishlist: normalized.map((product) => String(product._id)),
    products: normalized,
  });
};

export const DELETE = async (request: Request) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") || undefined;

  const wishlist = await findOrCreateWishlist(payload, payloadUserId);
  const currentProducts = Array.isArray(wishlist.products)
    ? wishlist.products.map((product) =>
        typeof product === "string" ? product : getId(product)
      )
    : [];

  const updatedProducts = productId
    ? currentProducts.filter((id) => id !== productId)
    : [];

  const updated = await payload.update({
    collection: "wishlists",
    id: getId(wishlist) as string,
    data: { products: updatedProducts },
    overrideAccess: true,
  });

  const normalized = normalizeProducts(
    (updated as WishlistDoc).products || []
  );

  return Response.json({
    success: true,
    wishlist: normalized.map((product) => String(product._id)),
    products: normalized,
  });
};
