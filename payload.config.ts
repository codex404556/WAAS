import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import crypto from "crypto";
import { buildConfig } from "payload";
import type { CollectionSlug, PayloadRequest, Where } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Banners } from "./collections/Banners";
import { Orders } from "./collections/Orders";
import { Notifications } from "./collections/Notifications";
import { Wishlists } from "./collections/Wishlists";
import { Addresses } from "./collections/Addresses";

import { Categories } from "./collections/Categories";
import Products from "./collections/Products";
import Brands from "./collections/Brands";
import Reviews from "./collections/Reviews";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

type OrderItemDoc = {
  product?:
    | {
        id?: string | number;
        _id?: string | number;
        name?: string;
        images?: unknown[] | null;
        category?:
          | { id?: string | number; _id?: string | number; title?: string }
          | string
          | null;
        price?: number;
      }
    | string
    | number
    | null;
  quantity?: number;
  price?: number;
};

type OrderDoc = {
  id?: string | number;
  _id?: string | number;
  orderId?: string;
  user?:
    | {
        id?: string | number;
        _id?: string | number;
        name?: string;
        email?: string;
      }
    | string
    | number
    | null;
  items?: OrderItemDoc[];
  status?: string;
  paymentStatus?: string;
  totalAmount?: number;
  stripeAmountTotal?: number;
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

type ProductDoc = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  stock?: number;
  price?: number;
  category?: { name?: string } | string | number | null;
  brand?: { name?: string } | string | number | null;
};

type AddressDoc = {
  id?: string | number;
  _id?: string | number;
  user?:
    | {
        id?: string | number;
        _id?: string | number;
      }
    | string
    | number
    | null;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  defaulte?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type WishlistProductDoc =
  | {
      id?: string | number;
      _id?: string | number;
    }
  | string
  | number;

type WishlistDoc = {
  id?: string | number;
  _id?: string | number;
  user?:
    | {
        id?: string | number;
        _id?: string | number;
      }
    | string
    | number
    | null;
  products?: WishlistProductDoc[];
};

type NotificationDoc = {
  id?: string | number;
  _id?: string | number;
  user?:
    | {
        id?: string | number;
        _id?: string | number;
      }
    | string
    | number
    | null;
  isRead?: boolean;
};

type AnalyticsCategoryDoc =
  | { id?: string | number; _id?: string | number; title?: string }
  | string
  | null
  | undefined;

type AnalyticsProductDoc = OrderItemDoc["product"];

const normalizeId = (value?: string | number | null) =>
  value === undefined || value === null ? "" : String(value);

const resolveProductId = (product: OrderItemDoc["product"]) => {
  if (product === null || product === undefined) return "";
  if (typeof product === "string" || typeof product === "number") {
    return String(product);
  }
  return normalizeId(product.id ?? product._id);
};

const resolveProductName = (product: OrderItemDoc["product"]) => {
  if (product && typeof product === "object" && "name" in product) {
    return product.name || "Unknown Product";
  }
  return "Unknown Product";
};

const resolveUserName = (user: OrderDoc["user"]) => {
  if (!user) return "Unknown Customer";
  if (typeof user === "object" && "name" in user) {
    return user.name || "Unknown Customer";
  }
  return "Unknown Customer";
};

const toOrderRevenue = (order: OrderDoc) => {
  const amount = Number(order.stripeAmountTotal ?? order.totalAmount ?? 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

type MappedOrder = {
  _id: string;
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  status: "pending" | "paid" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
};

const getMediaUrl = (media: unknown) => {
  if (media && typeof media === "object" && "url" in media) {
    const candidate = (media as { url?: unknown }).url;
    return typeof candidate === "string" ? candidate : undefined;
  }
  return undefined;
};

const toNumericId = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const getAnalyticsCategoryName = (category: AnalyticsCategoryDoc) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return "Uncategorized";
  return category.title || "Uncategorized";
};

const getAnalyticsCategoryKey = (category: AnalyticsCategoryDoc) => {
  if (!category) return "uncategorized";
  if (typeof category === "string") return category;
  return normalizeId(category.id ?? category._id) || category.title || "uncategorized";
};

const getAnalyticsProductKey = (product: AnalyticsProductDoc) => {
  if (!product || typeof product === "string" || typeof product === "number") {
    return "unknown";
  }
  return normalizeId(product.id ?? product._id) || product.name || "unknown";
};

const getUserAnalytics = (orders: OrderDoc[]) => {
  const totalOrders = orders.length;

  let totalSpent = 0;
  let paidAmount = 0;
  let totalItems = 0;
  let completedOrders = 0;

  const statusMap = new Map<string, { orderCount: number; totalAmount: number }>();
  const categoryMap = new Map<
    string,
    { name: string; totalSpent: number; orderIds: Set<string>; itemCount: number }
  >();
  const productMap = new Map<
    string,
    {
      name: string;
      category: string;
      image: string;
      totalQuantity: number;
      totalSpent: number;
      orderIds: Set<string>;
    }
  >();

  const now = new Date();
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const monthBuckets: Array<{
    key: string;
    month: string;
    monthName: string;
    totalSpent: number;
    paidAmount: number;
  }> = [];
  const monthIndex = new Map<string, number>();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthIndex.set(key, monthBuckets.length);
    monthBuckets.push({
      key,
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      monthName: monthFormatter.format(date),
      totalSpent: 0,
      paidAmount: 0,
    });
  }

  orders.forEach((order, orderIndex) => {
    const orderTotal = order.totalAmount ?? 0;
    totalSpent += orderTotal;
    if (order.paymentStatus === "paid") {
      paidAmount += orderTotal;
    }
    if (order.status === "completed") {
      completedOrders += 1;
    }

    const statusKey = order.status || "unknown";
    const statusEntry = statusMap.get(statusKey) || {
      orderCount: 0,
      totalAmount: 0,
    };
    statusEntry.orderCount += 1;
    statusEntry.totalAmount += orderTotal;
    statusMap.set(statusKey, statusEntry);

    if (order.createdAt) {
      const createdAt = new Date(order.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const idx = monthIndex.get(key);
      if (idx !== undefined) {
        monthBuckets[idx].totalSpent += orderTotal;
        if (order.paymentStatus === "paid") {
          monthBuckets[idx].paidAmount += orderTotal;
        }
      }
    }

    const orderId =
      normalizeId(order.id ?? order._id) ||
      order.orderId ||
      `order-${orderIndex + 1}`;

    const items = order.items ?? [];
    for (const item of items) {
      const quantity = item.quantity ?? 0;
      const product =
        item.product && typeof item.product === "object" ? item.product : null;
      const unitPrice = item.price ?? product?.price ?? 0;
      const lineTotal = unitPrice * quantity;
      totalItems += quantity;

      const productKey = getAnalyticsProductKey(item.product);
      let productName = "Unknown Product";
      let categoryName = "Uncategorized";
      let productImage = "/placeholder.svg";

      if (product) {
        productName = product.name || productName;
        categoryName = getAnalyticsCategoryName(product.category);
        const images = Array.isArray(product.images) ? product.images : [];
        const firstImageUrl = images.length ? getMediaUrl(images[0]) : undefined;
        productImage = firstImageUrl || productImage;
      }

      const productEntry = productMap.get(productKey) || {
        name: productName,
        category: categoryName,
        image: productImage,
        totalQuantity: 0,
        totalSpent: 0,
        orderIds: new Set<string>(),
      };
      productEntry.totalQuantity += quantity;
      productEntry.totalSpent += lineTotal;
      productEntry.orderIds.add(orderId);
      productMap.set(productKey, productEntry);

      const categoryKey = getAnalyticsCategoryKey(product?.category);
      const categoryEntry = categoryMap.get(categoryKey) || {
        name: categoryName,
        totalSpent: 0,
        orderIds: new Set<string>(),
        itemCount: 0,
      };
      categoryEntry.totalSpent += lineTotal;
      categoryEntry.itemCount += quantity;
      categoryEntry.orderIds.add(orderId);
      categoryMap.set(categoryKey, categoryEntry);
    }
  });

  return {
    overview: {
      overview: {
        totalOrders,
        completedOrders,
        totalSpent,
        paidAmount,
        avgOrderValue: totalOrders ? totalSpent / totalOrders : 0,
        totalItems,
      },
      spendingByStatus: Array.from(statusMap.entries()).map(([status, data]) => ({
        _id: status,
        orderCount: data.orderCount,
        totalAmount: data.totalAmount,
      })),
      favoriteCategories: Array.from(categoryMap.entries()).map(([, data]) => ({
        _id: data.name,
        totalSpent: data.totalSpent,
        orderCount: data.orderIds.size,
        itemCount: data.itemCount,
      })),
    },
    monthlySpending: {
      monthlySpending: monthBuckets.map((month) => ({
        month: month.month,
        monthName: month.monthName,
        totalSpent: month.totalSpent,
        paidAmount: month.paidAmount,
      })),
    },
    preferences: {
      mostPurchasedProducts: Array.from(productMap.entries())
        .map(([key, data]) => ({
          _id: key,
          productName: data.name,
          category: data.category,
          productImage: data.image,
          totalQuantity: data.totalQuantity,
          totalSpent: data.totalSpent,
          avgPrice: data.totalQuantity ? data.totalSpent / data.totalQuantity : 0,
          orderCount: data.orderIds.size,
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10),
    },
  };
};

const mapCustomerOrder = (order: OrderDoc): MappedOrder => {
  const payloadId = normalizeId(order.id ?? order._id) || "";
  const orderId = order.orderId || payloadId;
  const userId =
    typeof order.user === "string" || typeof order.user === "number"
      ? String(order.user)
      : normalizeId(
          (order.user as { id?: string | number; _id?: string | number } | null)
            ?.id ??
            (order.user as { id?: string | number; _id?: string | number } | null)
              ?._id
        ) || "";

  const items = (order.items ?? []).map((item) => {
    const product = item.product;
    const productId =
      typeof product === "string" || typeof product === "number"
        ? String(product)
        : normalizeId(product?.id ?? product?._id) || "";
    const name =
      product && typeof product === "object" && "name" in product
        ? product.name || ""
        : "";
    const images =
      product && typeof product === "object" && "images" in product
        ? ((product as { images?: unknown[] }).images ?? [])
        : [];
    const image = Array.isArray(images) && images.length ? getMediaUrl(images[0]) : undefined;

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
    status: (order.status as MappedOrder["status"]) || "pending",
    paymentStatus: (order.paymentStatus as MappedOrder["paymentStatus"]) || "pending",
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? new Date().toISOString(),
  };
};

const ensureOwnership = (
  payloadUserId: number,
  order: OrderDoc | null | undefined
) => {
  if (!order) return false;
  const orderUser =
    typeof order.user === "string" || typeof order.user === "number"
      ? String(order.user)
      : normalizeId(
          (order.user as { id?: string | number; _id?: string | number } | null)
            ?.id ??
            (order.user as { id?: string | number; _id?: string | number } | null)
              ?._id
        );
  return orderUser === String(payloadUserId);
};

const generateOrderId = () => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numbers = Math.floor(10000 + Math.random() * 90000);
  return `${letter}${numbers}`;
};

const generateUniqueOrderId = async (req: PayloadRequest) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderId();
    const existing = await req.payload.find({
      collection: "orders",
      where: { orderId: { equals: candidate } },
      limit: 1,
      depth: 0,
      req,
    });
    if (!(existing.docs || []).length) {
      return candidate;
    }
  }
  throw new Error("Failed to generate unique order ID");
};

const getAddressOwnerId = (address: AddressDoc) => {
  const userValue = address.user;
  if (typeof userValue === "number" || typeof userValue === "string") {
    return String(userValue);
  }
  if (userValue && typeof userValue === "object") {
    const ownerId = userValue.id ?? userValue._id;
    if (ownerId !== undefined && ownerId !== null) {
      return String(ownerId);
    }
  }
  return "";
};

const getDocId = (doc?: { id?: string | number; _id?: string | number } | null) =>
  normalizeId(doc?.id ?? doc?._id);

const normalizeWishlistProducts = (products: WishlistProductDoc[] = []) =>
  products
    .map((product) => {
      if (typeof product === "string" || typeof product === "number") {
        return { _id: product };
      }
      return { ...product, _id: getDocId(product) };
    })
    .filter((product) => Boolean(product._id));

const findOrCreateWishlist = async (
  req: PayloadRequest,
  payloadUserId: number
) => {
  const existing = await req.payload.find({
    collection: "wishlists",
    where: { user: { equals: payloadUserId } },
    limit: 1,
    depth: 1,
    req,
  });

  const docs = (existing.docs || []) as WishlistDoc[];
  if (docs.length > 0) {
    return docs[0];
  }

  const created = await req.payload.create({
    collection: "wishlists",
    data: {
      user: payloadUserId,
      products: [],
    },
    overrideAccess: true,
    req,
  });

  return created as WishlistDoc;
};

const getOwnerId = (
  owner:
    | {
        id?: string | number;
        _id?: string | number;
      }
    | string
    | number
    | null
    | undefined
) => {
  if (typeof owner === "string" || typeof owner === "number") {
    return String(owner);
  }
  return normalizeId(owner?.id ?? owner?._id) || "";
};

type ResolvePayloadUserResult =
  | { ok: true; payloadUserId: number }
  | { ok: false; error: Response };

const resolvePayloadUserFromClerk = async (
  req: PayloadRequest
): Promise<ResolvePayloadUserResult> => {
  type MinimalUserDoc = {
    id?: string | number;
    _id?: string | number;
    clerkId?: string | null;
  };

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: new Response("Unauthorized", { status: 401 }) };
  }

  const userResult = await req.payload.find({
    collection: "users",
    where: { clerkId: { equals: userId } },
    limit: 1,
    depth: 0,
    req,
  });

  const existing = (userResult.docs || [])[0] as MinimalUserDoc | undefined;
  let payloadUserId = toNumericId(existing?.id ?? existing?._id);

  if (payloadUserId) {
    return { ok: true, payloadUserId };
  }

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return {
      ok: false,
      error: new Response("Missing email for Clerk user", { status: 400 }),
    };
  }

  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

  const byEmailResult = await req.payload.find({
    collection: "users",
    where: { email: { equals: primaryEmail } },
    limit: 1,
    depth: 0,
    req,
  });

  const existingByEmail = (byEmailResult.docs || [])[0] as
    | MinimalUserDoc
    | undefined;

  if (existingByEmail) {
    const existingByEmailId = toNumericId(
      existingByEmail.id ?? existingByEmail._id
    );
    if (!existingByEmailId) {
      return {
        ok: false,
        error: new Response("Missing Payload user id", { status: 500 }),
      };
    }

    const existingClerkId =
      typeof existingByEmail.clerkId === "string"
        ? existingByEmail.clerkId.trim()
        : "";

    if (existingClerkId && existingClerkId !== userId) {
      console.error("Clerk to Payload user conflict", {
        payloadUserId: existingByEmailId,
        primaryEmail,
        existingClerkId,
        incomingClerkId: userId,
      });
      return { ok: false, error: new Response("Account conflict", { status: 409 }) };
    }

    if (!existingClerkId) {
      try {
        await req.payload.update({
          collection: "users",
          id: existingByEmailId,
          data: {
            clerkId: userId,
            avatar: clerkUser.imageUrl || "",
            name: name || undefined,
          },
          overrideAccess: true,
          req,
        });
      } catch (error) {
        console.error("Failed to link clerkId to existing Payload user", {
          primaryEmail,
          incomingClerkId: userId,
          payloadUserId: existingByEmailId,
          error,
        });
        return {
          ok: false,
          error: new Response("Failed to link customer account", { status: 500 }),
        };
      }
    }

    return { ok: true, payloadUserId: existingByEmailId };
  }

  const randomPassword = crypto.randomBytes(24).toString("hex");
  try {
    const created = (await req.payload.create({
      collection: "users",
      data: {
        name: name || primaryEmail,
        email: primaryEmail,
        avatar: clerkUser.imageUrl || "",
        clerkId: clerkUser.id,
        role: "user",
        password: randomPassword,
      },
      overrideAccess: true,
      req,
    })) as { id?: string | number; _id?: string | number } | null;

    payloadUserId = toNumericId(created?.id ?? created?._id);
  } catch (error) {
    console.error("Failed to create Payload user for Clerk customer", {
      primaryEmail,
      incomingClerkId: userId,
      error,
    });
    return {
      ok: false,
      error: new Response("Failed to provision customer account", { status: 500 }),
    };
  }

  if (!payloadUserId) {
    return { ok: false, error: new Response("User not found", { status: 404 }) };
  }

  return { ok: true, payloadUserId };
};

const ensureAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: string } | null | undefined;
  const role = user?.role;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
};

const getPaidRevenue = async (
  req: PayloadRequest,
  hasCollection?: (slug: CollectionSlug) => boolean
) => {
  if (hasCollection && !hasCollection("orders")) {
    return 0;
  }

  let totalRevenue = 0;
  let page = 1;
  const limit = 200;

  while (true) {
    const paidOrders = await req.payload.find({
      collection: "orders",
      where: {
        paymentStatus: {
          equals: "paid",
        },
      },
      depth: 0,
      limit,
      page,
      req,
    });

    const docs = (paidOrders.docs || []) as OrderDoc[];
    for (const order of docs) {
      totalRevenue += toOrderRevenue(order);
    }

    const totalPages =
      "totalPages" in paidOrders && typeof paidOrders.totalPages === "number"
        ? paidOrders.totalPages
        : 1;
    if (page >= totalPages) {
      break;
    }
    page += 1;
  }

  return totalRevenue;
};

const getAccountOverview = async (req: PayloadRequest) => {
  const adminError = ensureAdmin(req);
  if (adminError) {
    return adminError;
  }

  const [usersCountResult, productsCountResult, ordersResult, productsResult] =
    await Promise.all([
      req.payload.count({ collection: "users", req }),
      req.payload.count({ collection: "products", req }),
      req.payload.find({
        collection: "orders",
        limit: 1000,
        depth: 2,
        sort: "-createdAt",
        req,
      }),
      req.payload.find({
        collection: "products",
        limit: 1000,
        depth: 1,
        sort: "-createdAt",
        req,
      }),
    ]);

  const orders = (ordersResult.docs || []) as OrderDoc[];
  const products = (productsResult.docs || []) as ProductDoc[];
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");

  const totalRevenue = paidOrders.reduce((sum, order) => sum + toOrderRevenue(order), 0);

  const monthlyMap = new Map<string, { month: string; revenue: number; orders: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyMap.set(key, {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  for (const order of paidOrders) {
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const bucket = monthlyMap.get(key);
    if (!bucket) continue;
    bucket.revenue += toOrderRevenue(order);
    bucket.orders += 1;
  }

  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    const status = order.status || "unknown";
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  }

  const productSalesMap = new Map<
    string,
    { _id: string; productName: string; totalSold: number; totalRevenue: number }
  >();
  const productLastSaleMap = new Map<string, string>();

  for (const order of paidOrders) {
    const orderDate = order.createdAt || new Date().toISOString();
    for (const item of order.items || []) {
      const productId = resolveProductId(item.product);
      if (!productId) continue;

      const quantity = Math.max(0, Number(item.quantity ?? 0));
      const unitPrice = Math.max(0, Number(item.price ?? 0));
      const lineRevenue = quantity * unitPrice;

      const existing = productSalesMap.get(productId) || {
        _id: productId,
        productName: resolveProductName(item.product),
        totalSold: 0,
        totalRevenue: 0,
      };
      existing.totalSold += quantity;
      existing.totalRevenue += lineRevenue;
      productSalesMap.set(productId, existing);

      const previous = productLastSaleMap.get(productId);
      if (!previous || new Date(orderDate) > new Date(previous)) {
        productLastSaleMap.set(productId, orderDate);
      }
    }
  }

  const bestSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);

  const recentOrders = orders.slice(0, 10).map((order) => ({
    _id: normalizeId(order.id ?? order._id),
    userId: {
      user: resolveUserName(order.user),
    },
    total: toOrderRevenue(order),
    status: order.status || "pending",
    createdAt: order.createdAt || new Date().toISOString(),
  }));

  const now = Date.now();
  const staleThresholdMs = 90 * 24 * 60 * 60 * 1000;

  const lowStock = products
    .filter(
      (product) => Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 5
    )
    .map((product) => ({
      _id: normalizeId(product.id ?? product._id),
      name: product.name || "Unknown Product",
      stock: Number(product.stock ?? 0),
      price: Number(product.price ?? 0),
      category:
        product.category && typeof product.category === "object"
          ? { name: product.category.name || "Unknown" }
          : { name: "Unknown" },
      brand:
        product.brand && typeof product.brand === "object"
          ? { name: product.brand.name || "Unknown" }
          : { name: "Unknown" },
      lastSaleDate: productLastSaleMap.get(normalizeId(product.id ?? product._id)),
    }));

  const outOfStock = products
    .filter((product) => Number(product.stock ?? 0) <= 0)
    .map((product) => ({
      _id: normalizeId(product.id ?? product._id),
      name: product.name || "Unknown Product",
      stock: Number(product.stock ?? 0),
      price: Number(product.price ?? 0),
      category:
        product.category && typeof product.category === "object"
          ? { name: product.category.name || "Unknown" }
          : { name: "Unknown" },
      brand:
        product.brand && typeof product.brand === "object"
          ? { name: product.brand.name || "Unknown" }
          : { name: "Unknown" },
      lastSaleDate: productLastSaleMap.get(normalizeId(product.id ?? product._id)),
    }));

  const staleProducts = products
    .map((product) => {
      const productId = normalizeId(product.id ?? product._id);
      const lastSaleDate = productLastSaleMap.get(productId);
      if (!lastSaleDate) return null;
      const ageMs = now - new Date(lastSaleDate).getTime();
      if (ageMs < staleThresholdMs) return null;
      return {
        _id: productId,
        name: product.name || "Unknown Product",
        stock: Number(product.stock ?? 0),
        price: Number(product.price ?? 0),
        category:
          product.category && typeof product.category === "object"
            ? { name: product.category.name || "Unknown" }
            : { name: "Unknown" },
        brand:
          product.brand && typeof product.brand === "object"
            ? { name: product.brand.name || "Unknown" }
            : { name: "Unknown" },
        lastSaleDate,
        daysSinceLastSale: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const noSalesProducts = products
    .filter(
      (product) => !productLastSaleMap.has(normalizeId(product.id ?? product._id))
    )
    .map((product) => ({
      _id: normalizeId(product.id ?? product._id),
      name: product.name || "Unknown Product",
      stock: Number(product.stock ?? 0),
      price: Number(product.price ?? 0),
      category:
        product.category && typeof product.category === "object"
          ? { name: product.category.name || "Unknown" }
          : { name: "Unknown" },
      brand:
        product.brand && typeof product.brand === "object"
          ? { name: product.brand.name || "Unknown" }
          : { name: "Unknown" },
    }));

  return Response.json({
    overview: {
      totalProducts: productsCountResult.totalDocs ?? 0,
      totalOrders: orders.length,
      totalUsers: usersCountResult.totalDocs ?? 0,
      totalRevenue,
    },
    sales: {
      bestSellingProducts,
      recentOrders,
      monthlyRevenue: Array.from(monthlyMap.values()),
      orderStatusBreakdown: Array.from(statusCounts.entries()).map(
        ([status, count]) => ({ status, count })
      ),
    },
    inventoryAlerts: {
      lowStock,
      outOfStock,
      staleProducts,
      noSalesProducts,
    },
  });
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  endpoints: [
    {
      path: "/orders/me",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const result = await req.payload.find({
          collection: "orders",
          where: { user: { equals: resolved.payloadUserId } },
          limit: 1000,
          depth: 2,
          sort: "-createdAt",
          req,
        });

        const orders = (result.docs || []).map((doc) =>
          mapCustomerOrder(doc as OrderDoc)
        );
        return Response.json({ orders });
      },
    },
    {
      path: "/customer-addresses/me",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const addressesResult = await req.payload.find({
          collection: "addresses",
          where: { user: { equals: resolved.payloadUserId } },
          limit: 100,
          depth: 0,
          req,
        });

        return Response.json({ docs: addressesResult.docs });
      },
    },
    {
      path: "/customer-addresses/me",
      method: "post",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const data = (await (req as { json: () => Promise<unknown> }).json()) as {
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          defaulte?: boolean;
        };

        if (!data.name || !data.address || !data.city || !data.state || !data.zip) {
          return new Response("Missing required address fields", { status: 400 });
        }

        const created = await req.payload.create({
          collection: "addresses",
          data: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            defaulte: data.defaulte ?? false,
            user: resolved.payloadUserId,
          },
          overrideAccess: true,
          req,
        });

        return Response.json(created);
      },
    },
    {
      path: "/customer-addresses/me",
      method: "patch",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const data = (await (req as { json: () => Promise<unknown> }).json()) as {
          addressId?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          defaulte?: boolean;
        };

        if (!data.addressId) {
          return new Response("Missing addressId", { status: 400 });
        }

        if (data.defaulte) {
          const currentDefaults = await req.payload.find({
            collection: "addresses",
            where: {
              user: { equals: resolved.payloadUserId },
              defaulte: { equals: true },
            },
            limit: 100,
            depth: 0,
            req,
          });

          await Promise.all(
            ((currentDefaults.docs || []) as AddressDoc[])
              .map((doc) => doc.id ?? doc._id)
              .filter((id): id is string | number => Boolean(id))
              .filter((id) => String(id) !== data.addressId)
              .map((id) =>
                req.payload.update({
                  collection: "addresses",
                  id,
                  data: { defaulte: false },
                  overrideAccess: true,
                  req,
                })
              )
          );
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.state !== undefined) updateData.state = data.state;
        if (data.zip !== undefined) updateData.zip = data.zip;
        if (data.defaulte !== undefined) updateData.defaulte = data.defaulte;

        if (Object.keys(updateData).length === 0) {
          return new Response("No fields to update", { status: 400 });
        }

        const existingAddress = (await req.payload.findByID({
          collection: "addresses",
          id: data.addressId,
          depth: 0,
          req,
        })) as AddressDoc | null;

        if (!existingAddress) {
          return new Response("Address not found", { status: 404 });
        }

        const ownerId = getAddressOwnerId(existingAddress);
        if (ownerId !== String(resolved.payloadUserId)) {
          return new Response("Forbidden", { status: 403 });
        }

        const updated = await req.payload.update({
          collection: "addresses",
          id: data.addressId,
          data: updateData,
          overrideAccess: true,
          req,
        });

        return Response.json(updated);
      },
    },
    {
      path: "/customer-addresses/me",
      method: "delete",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const data = (await (req as { json: () => Promise<unknown> }).json()) as {
          addressId?: string;
        };

        if (!data.addressId) {
          return new Response("Missing addressId", { status: 400 });
        }

        const existingAddress = (await req.payload.findByID({
          collection: "addresses",
          id: data.addressId,
          depth: 0,
          req,
        })) as AddressDoc | null;

        if (!existingAddress) {
          return new Response("Address not found", { status: 404 });
        }

        const ownerId = getAddressOwnerId(existingAddress);
        if (ownerId !== String(resolved.payloadUserId)) {
          return new Response("Forbidden", { status: 403 });
        }

        await req.payload.delete({
          collection: "addresses",
          id: data.addressId,
          overrideAccess: true,
          req,
        });

        return new Response(null, { status: 204 });
      },
    },
    {
      path: "/orders/me",
      method: "post",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const body = (await (req as { json: () => Promise<unknown> }).json()) as {
          items?: Array<{
            _id?: string;
            productId?: string;
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

        const items = Array.isArray(body?.items) ? body?.items : [];
        if (items.length === 0) {
          return new Response("Missing order items", { status: 400 });
        }

        const orderItems = items
          .map((item) => {
            const productId = item.productId ?? item._id;
            if (!productId) return null;
            const numericId = Number(productId);
            if (Number.isNaN(numericId)) return null;
            return {
              product: numericId,
              quantity: item.quantity ?? 0,
              price: item.price ?? 0,
            };
          })
          .filter(
            (
              item
            ): item is {
              product: number;
              quantity: number;
              price: number;
            } => Boolean(item)
          );

        const totalAmount = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const orderId = await generateUniqueOrderId(req);
        const created = (await req.payload.create({
          collection: "orders",
          data: {
            orderId,
            user: resolved.payloadUserId,
            items: orderItems,
            totalAmount,
            status: "pending",
            paymentStatus: "pending",
            shippingAddress: {
              street: body?.shippingAddress?.street,
              city: body?.shippingAddress?.city,
              state: body?.shippingAddress?.state,
              zipCode:
                body?.shippingAddress?.zipCode ?? body?.shippingAddress?.postalCode,
              country: body?.shippingAddress?.country,
            },
          },
          overrideAccess: true,
          req,
        })) as OrderDoc;

        return Response.json({
          success: true,
          order: mapCustomerOrder(created),
        });
      },
    },
    {
      path: "/orders/me-item",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing order id", { status: 400 });
        }

        const order = (await req.payload.findByID({
          collection: "orders",
          id,
          depth: 2,
          req,
        })) as OrderDoc | null;

        if (!ensureOwnership(resolved.payloadUserId, order)) {
          return new Response("Forbidden", { status: 403 });
        }

        return Response.json({ order: mapCustomerOrder(order as OrderDoc) });
      },
    },
    {
      path: "/orders/me-item",
      method: "delete",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing order id", { status: 400 });
        }

        const order = (await req.payload.findByID({
          collection: "orders",
          id,
          depth: 0,
          req,
        })) as OrderDoc | null;

        if (!ensureOwnership(resolved.payloadUserId, order)) {
          return new Response("Forbidden", { status: 403 });
        }

        await req.payload.delete({
          collection: "orders",
          id,
          overrideAccess: true,
          req,
        });

        return Response.json({ success: true });
      },
    },
    {
      path: "/admin/orders",
      method: "get",
      handler: async (req) => {
        const adminError = ensureAdmin(req);
        if (adminError) {
          return adminError;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );

        const page = Number(searchParams.get("page") || "1");
        const limit = Number(searchParams.get("limit") || "10");
        const sort = searchParams.get("sort") || "-createdAt";
        const depth = Number(searchParams.get("depth") || "1");
        const status = searchParams.get("where[status][equals]");
        const paymentStatus = searchParams.get("where[paymentStatus][equals]");

        const where: Where = {};
        if (status) {
          where.status = { equals: status };
        }
        if (paymentStatus) {
          where.paymentStatus = { equals: paymentStatus };
        }

        const result = await req.payload.find({
          collection: "orders",
          page,
          limit,
          sort,
          depth,
          where,
          req,
        });

        return Response.json(result);
      },
    },
    {
      path: "/admin/order",
      method: "patch",
      handler: async (req) => {
        const adminError = ensureAdmin(req);
        if (adminError) {
          return adminError;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing id", { status: 400 });
        }

        const body = (await (req as { json: () => Promise<unknown> }).json()) as {
          status?: "pending" | "cancelled" | "paid" | "completed";
        };

        const updated = await req.payload.update({
          collection: "orders",
          id,
          data: {
            status: body?.status,
          },
          req,
        });

        return Response.json({ order: updated });
      },
    },
    {
      path: "/admin/order",
      method: "delete",
      handler: async (req) => {
        const adminError = ensureAdmin(req);
        if (adminError) {
          return adminError;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing id", { status: 400 });
        }

        await req.payload.delete({
          collection: "orders",
          id,
          req,
        });

        return Response.json({ success: true });
      },
    },
    {
      path: "/wishlist",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const wishlist = await findOrCreateWishlist(
          req,
          resolved.payloadUserId
        );
        const products = normalizeWishlistProducts(wishlist.products || []);
        const wishlistIds = products.map((product) => String(product._id));

        return Response.json({
          success: true,
          wishlist: wishlistIds,
          products,
        });
      },
    },
    {
      path: "/wishlist",
      method: "post",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const body = (await (req as { json: () => Promise<unknown> }).json()) as {
          productId?: string;
        };
        if (!body.productId) {
          return new Response("Missing productId", { status: 400 });
        }

        const wishlist = await findOrCreateWishlist(
          req,
          resolved.payloadUserId
        );
        const currentProducts = Array.isArray(wishlist.products)
          ? wishlist.products.map((product) =>
              typeof product === "string" || typeof product === "number"
                ? String(product)
                : getDocId(product)
            )
          : [];

        const updatedProducts = Array.from(
          new Set([...currentProducts, body.productId].filter(Boolean))
        )
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        const updated = await req.payload.update({
          collection: "wishlists",
          id: getDocId(wishlist) as string,
          data: { products: updatedProducts },
          overrideAccess: true,
          req,
        });

        const normalized = normalizeWishlistProducts(
          ((updated as WishlistDoc).products || []) as WishlistProductDoc[]
        );

        return Response.json({
          success: true,
          wishlist: normalized.map((product) => String(product._id)),
          products: normalized,
        });
      },
    },
    {
      path: "/wishlist",
      method: "delete",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const productId = searchParams.get("productId") || undefined;

        const wishlist = await findOrCreateWishlist(
          req,
          resolved.payloadUserId
        );
        const currentProducts = Array.isArray(wishlist.products)
          ? wishlist.products.map((product) =>
              typeof product === "string" || typeof product === "number"
                ? String(product)
                : getDocId(product)
            )
          : [];

        const updatedProducts = productId
          ? currentProducts.filter((id) => id !== productId)
          : [];
        const updatedProductIds = updatedProducts
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        const updated = await req.payload.update({
          collection: "wishlists",
          id: getDocId(wishlist) as string,
          data: { products: updatedProductIds },
          overrideAccess: true,
          req,
        });

        const normalized = normalizeWishlistProducts(
          ((updated as WishlistDoc).products || []) as WishlistProductDoc[]
        );

        return Response.json({
          success: true,
          wishlist: normalized.map((product) => String(product._id)),
          products: normalized,
        });
      },
    },
    {
      path: "/notifications",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const limit = Math.max(1, Number(searchParams.get("limit") ?? 10));
        const skipParam = Number(searchParams.get("skip") ?? "0");
        const pageParam = Number(searchParams.get("page") ?? "0");
        const unreadOnly = searchParams.get("unreadOnly") === "true";
        const page =
          pageParam > 0 ? pageParam : Math.floor(Math.max(0, skipParam) / limit) + 1;

        const where = {
          user: { equals: resolved.payloadUserId },
          ...(unreadOnly ? { isRead: { equals: false } } : {}),
        };

        const result = await req.payload.find({
          collection: "notifications",
          where,
          limit,
          page,
          sort: "-createdAt",
          depth: 0,
          req,
        });

        const notifications = ((result.docs || []) as NotificationDoc[]).map((doc) => ({
          ...doc,
          _id: doc.id ?? doc._id,
        }));

        return Response.json({
          notifications,
          total: result.totalDocs,
          currentPage: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasNextPage,
        });
      },
    },
    {
      path: "/notifications",
      method: "delete",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const result = await req.payload.find({
          collection: "notifications",
          where: { user: { equals: resolved.payloadUserId } },
          limit: 1000,
          depth: 0,
          req,
        });

        const ids = ((result.docs || []) as NotificationDoc[])
          .map((doc) => doc.id ?? doc._id)
          .filter((id): id is string | number => Boolean(id));

        await Promise.all(
          ids.map((id) =>
            req.payload.delete({
              collection: "notifications",
              id,
              overrideAccess: true,
              req,
            })
          )
        );

        return new Response(null, { status: 204 });
      },
    },
    {
      path: "/notifications/unread-count",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const result = await req.payload.find({
          collection: "notifications",
          where: {
            user: { equals: resolved.payloadUserId },
            isRead: { equals: false },
          },
          limit: 1,
          depth: 0,
          req,
        });

        return Response.json({ count: result.totalDocs });
      },
    },
    {
      path: "/notifications/read-all",
      method: "put",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const result = await req.payload.find({
          collection: "notifications",
          where: {
            user: { equals: resolved.payloadUserId },
            isRead: { equals: false },
          },
          limit: 1000,
          depth: 0,
          req,
        });

        const ids = ((result.docs || []) as NotificationDoc[])
          .map((doc) => doc.id ?? doc._id)
          .filter((id): id is string | number => Boolean(id));

        await Promise.all(
          ids.map((id) =>
            req.payload.update({
              collection: "notifications",
              id,
              data: { isRead: true },
              overrideAccess: true,
              req,
            })
          )
        );

        return new Response(null, { status: 204 });
      },
    },
    {
      path: "/notifications/item/read",
      method: "put",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing notification id", { status: 400 });
        }

        const notification = (await req.payload.findByID({
          collection: "notifications",
          id,
          depth: 0,
          req,
        })) as NotificationDoc | null;

        const ownerId = getOwnerId(notification?.user);
        if (!ownerId || ownerId !== String(resolved.payloadUserId)) {
          return new Response("Forbidden", { status: 403 });
        }

        await req.payload.update({
          collection: "notifications",
          id,
          data: { isRead: true },
          overrideAccess: true,
          req,
        });

        return new Response(null, { status: 204 });
      },
    },
    {
      path: "/notifications/item",
      method: "delete",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const { searchParams } = new URL(
          (req as { url: string }).url || "http://localhost"
        );
        const id = searchParams.get("id");
        if (!id) {
          return new Response("Missing notification id", { status: 400 });
        }

        const notification = (await req.payload.findByID({
          collection: "notifications",
          id,
          depth: 0,
          req,
        })) as NotificationDoc | null;

        const ownerId = getOwnerId(notification?.user);
        if (!ownerId || ownerId !== String(resolved.payloadUserId)) {
          return new Response("Forbidden", { status: 403 });
        }

        await req.payload.delete({
          collection: "notifications",
          id,
          overrideAccess: true,
          req,
        });

        return new Response(null, { status: 204 });
      },
    },
    {
      path: "/stats",
      method: "get",
      handler: async (req) => {
        const adminError = ensureAdmin(req);
        if (adminError) {
          return adminError;
        }

        const collectionSlugs =
          req.payload.config.collections?.map((collection) => collection.slug) ??
          [];
        const hasCollection = (slug: CollectionSlug) =>
          collectionSlugs.includes(slug);

        const countCollection = async (slug: CollectionSlug, where?: Where) => {
          if (!hasCollection(slug)) {
            return 0;
          }

          const result = await req.payload.count({
            collection: slug as never,
            req,
            where,
          });

          return result.totalDocs ?? 0;
        };

        const [usersCount, productsCount, categoriesCount, brandsCount] =
          await Promise.all([
            countCollection("users"),
            countCollection("products"),
            countCollection("categories"),
            countCollection("brands"),
          ]);

        const ordersCount = await countCollection("orders");

        const roles = await Promise.all(
          ["admin", "user", "deliveryman"].map(async (role) => ({
            name: role,
            value: await countCollection("users", {
              role: {
                equals: role,
              },
            }),
          }))
        );

        let categories: { name: string; value: number }[] = [];
        if (hasCollection("categories")) {
          const categoryDocs = await req.payload.find({
            collection: "categories" as never,
            depth: 0,
            limit: 1000,
            req,
          });

          categories = await Promise.all(
            categoryDocs.docs.map(async (category) => {
              const categoryId =
                (category as { id?: string; _id?: string }).id ??
                (category as { _id?: string })._id;
              const value =
                categoryId && hasCollection("products")
                  ? await countCollection("products", {
                      category: {
                        equals: categoryId,
                      },
                    })
                  : 0;

              const categoryName =
                (category as { title?: string; name?: string }).title ??
                (category as { name?: string }).name ??
                "Unknown";

              return {
                name: categoryName,
                value,
              };
            })
          );
        }

        let brands: { name: string; value: number }[] = [];
        if (hasCollection("brands")) {
          const brandDocs = await req.payload.find({
            collection: "brands" as never,
            depth: 0,
            limit: 1000,
            req,
          });

          brands = await Promise.all(
            brandDocs.docs.map(async (brand) => {
              const brandId =
                (brand as { id?: string; _id?: string }).id ??
                (brand as { _id?: string })._id;
              const value =
                brandId && hasCollection("products")
                  ? await countCollection("products", {
                      brand: {
                        equals: brandId,
                      },
                    })
                  : 0;

              return {
                name: (brand as { name?: string }).name ?? "Unknown",
                value,
              };
            })
          );
        }

        const totalRevenue = await getPaidRevenue(req, hasCollection);

        return Response.json({
          counts: {
            users: usersCount,
            products: productsCount,
            categories: categoriesCount,
            brands: brandsCount,
            orders: ordersCount,
            totalRevenue,
          },
          roles,
          categories,
          brands,
        });
      },
    },
    {
      path: "/account-overview",
      method: "get",
      handler: getAccountOverview,
    },
    {
      path: "/user-analytics",
      method: "get",
      handler: async (req) => {
        const resolved = await resolvePayloadUserFromClerk(req);
        if (!resolved.ok) {
          return resolved.error;
        }

        const ordersResult = await req.payload.find({
          collection: "orders",
          where: { user: { equals: resolved.payloadUserId } },
          limit: 1000,
          depth: 2,
          req,
        });

        const orders = (ordersResult.docs || []) as OrderDoc[];
        return Response.json(getUserAnalytics(orders));
      },
    },
  ],
  collections: [
    Users,
    Media,
    Products,
    Categories,
    Brands,
    Reviews,
    Banners,
    Orders,
    Addresses,
    Notifications,
    Wishlists,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      bucket: process.env.R2_BUCKET || "",
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: "auto",
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      },
      collections: {
        media: true,
      },
    }),
  ],
});
