import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

type MediaDoc = { url?: string } | string | number | null | undefined;
type CategoryDoc =
  | { id?: string; _id?: string; title?: string }
  | string
  | null
  | undefined;
type ProductDoc =
  | {
      id?: string;
      _id?: string;
      name?: string;
      category?: CategoryDoc;
      images?: MediaDoc[] | null;
      price?: number;
    }
  | string
  | null
  | undefined;

type OrderItem = {
  product?: ProductDoc;
  quantity?: number;
  price?: number;
};

type OrderDoc = {
  id?: string;
  _id?: string;
  orderId?: string;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  items?: OrderItem[];
  createdAt?: string;
};

const getId = (doc?: { id?: string; _id?: string } | null) =>
  doc?.id ?? doc?._id;

const getMediaUrl = (media: MediaDoc) => {
  if (media && typeof media === "object" && "url" in media) {
    return typeof media.url === "string" ? media.url : null;
  }
  return null;
};

const getCategoryName = (category: CategoryDoc) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return "Uncategorized";
  return category.title || "Uncategorized";
};

const getCategoryKey = (category: CategoryDoc) => {
  if (!category) return "uncategorized";
  if (typeof category === "string") return category;
  return getId(category) || category.title || "uncategorized";
};

const getProductKey = (product: ProductDoc) => {
  if (!product || typeof product === "string") return "unknown";
  return getId(product) || product.name || "unknown";
};

export const GET = async (request: Request) => {
  const { payload, payloadUserId, error } = await resolvePayloadUser();
  if (error) return error;

  const ordersResult = await payload.find({
    collection: "orders",
    where: { user: { equals: payloadUserId } },
    limit: 1000,
    depth: 2,
  });

  const orders = (ordersResult.docs || []) as OrderDoc[];
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

  for (const order of orders) {
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
      order.id ?? order._id ?? order.orderId ?? `${Math.random()}`;
    const items = order.items ?? [];
    for (const item of items) {
      const quantity = item.quantity ?? 0;
      const unitPrice =
        item.price ??
        (item.product &&
        typeof item.product === "object" &&
        "price" in item.product
          ? item.product.price ?? 0
          : 0);
      const lineTotal = unitPrice * quantity;
      totalItems += quantity;

      const product = item.product;
      const productKey = getProductKey(product);
      let productName = "Unknown Product";
      let categoryName = "Uncategorized";
      let productImage = "/placeholder.svg";

      if (product && typeof product === "object") {
        productName = product.name || productName;
        categoryName = getCategoryName(product.category);
        const images = Array.isArray(product.images) ? product.images : [];
        const firstImageUrl = images.length ? getMediaUrl(images[0]) : null;
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

      const categoryKey = getCategoryKey(
        product && typeof product === "object" ? product.category : null
      );
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
  }

  const overview = {
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
  };

  const monthlySpending = {
    monthlySpending: monthBuckets.map((month) => ({
      month: month.month,
      monthName: month.monthName,
      totalSpent: month.totalSpent,
      paidAmount: month.paidAmount,
    })),
  };

  const preferences = {
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
  };

  return Response.json({
    overview,
    monthlySpending,
    preferences,
  });
};
