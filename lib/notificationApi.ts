export interface Notification {
  _id: string;
  userId?: string;
  type:
    | "order_placed"
    | "order_confirmed"
    | "order_shipped"
    | "order_delivered"
    | "order_cancelled"
    | "payment_success"
    | "payment_failed"
    | "refund_processed"
    | "general"
    | "offer"
    | "deal"
    | "announcement"
    | "promotion"
    | "alert"
    | "admin_message";
  title: string;
  message: string;
  isRead: boolean;
  relatedOrderId?: string;
  image?: string;
  actionUrl?: string;
  actionText?: string;
  external?: boolean;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQuery {
  limit?: number;
  skip?: number;
  page?: number;
  unreadOnly?: boolean;
}

type NotificationListResponse = {
  notifications: Notification[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
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

export const getNotifications = async (
  query: NotificationQuery = {}
): Promise<{
  notifications: Notification[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}> => {
  const { limit = 10, page = 1, unreadOnly = false } = query;
  const skip = (page - 1) * limit;
  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
    unreadOnly: unreadOnly.toString(),
  });

  const data = await request<NotificationListResponse>(
    `/api/notifications?${params}`
  );

  return {
    notifications: data.notifications || [],
    totalCount: data.total || 0,
    currentPage: data.currentPage || page,
    totalPages: data.totalPages || 1,
    hasMore: data.hasMore || false,
  };
};

export const getUnreadCount = async (): Promise<number> => {
  const data = await request<{ count: number }>("/api/notifications/unread-count");
  return data.count || 0;
};

export const markAsRead = async (notificationId: string): Promise<boolean> => {
  await request(
    `/api/notifications/item/read?id=${encodeURIComponent(notificationId)}`,
    { method: "PUT" }
  );
  return true;
};

export const markAllAsRead = async (): Promise<boolean> => {
  await request("/api/notifications/read-all", { method: "PUT" });
  return true;
};

export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  await request(`/api/notifications/item?id=${encodeURIComponent(notificationId)}`, {
    method: "DELETE",
  });
  return true;
};

export const deleteAllNotifications = async (): Promise<boolean> => {
  await request("/api/notifications", { method: "DELETE" });
  return true;
};
