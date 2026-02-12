export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  orderId?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  status_updates?: {
    address_confirmed?: { timestamp?: string };
    confirmed?: { timestamp?: string };
    packed?: { timestamp?: string };
    delivering?: { timestamp?: string; by?: { name?: string } };
    delivered?: { timestamp?: string };
    cancelled?: { timestamp?: string };
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type OrdersResponse = {
  orders: Order[];
};

type OrderResponse = {
  order: Order | null;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

type CreateOrderResponse = {
  success: boolean;
  order?: Order;
  message?: string;
};

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || `Request failed: ${res.status}`);
    (error as { status?: number }).status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};

export const getUserOrders = async (): Promise<Order[]> => {
  const data = await request<OrdersResponse>("/api/orders/me");
  return data.orders || [];
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const data = await request<OrderResponse>(
    `/api/orders/me-item?id=${encodeURIComponent(orderId)}`
  );
  return data.order ?? null;
};

export const deleteOrder = async (
  orderId: string
): Promise<DeleteResponse> => {
  try {
    await request(`/api/orders/me-item?id=${encodeURIComponent(orderId)}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete order";
    return { success: false, message };
  }
};

export const createOrderFromCart = async (
  items: Array<{
    _id?: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    postalCode?: string;
  }
): Promise<CreateOrderResponse> => {
  try {
    const payload = {
      items,
      shippingAddress,
    };
    const data = await request<CreateOrderResponse>("/api/orders/me", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return { success: false, message };
  }
};
