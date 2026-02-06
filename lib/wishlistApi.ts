import type { Product } from "@/types/cms";

export type WishlistResponse = {
  success: boolean;
  wishlist: string[];
  products: Product[];
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

  return (await res.json()) as T;
};

export const getUserWishlist = async (): Promise<WishlistResponse> =>
  request<WishlistResponse>("/api/wishlist");

export const addToWishlist = async (productId: string): Promise<WishlistResponse> =>
  request<WishlistResponse>("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });

export const removeFromWishlist = async (
  productId: string
): Promise<WishlistResponse> =>
  request<WishlistResponse>(`/api/wishlist?productId=${productId}`, {
    method: "DELETE",
  });

export const clearWishlist = async (): Promise<WishlistResponse> =>
  request<WishlistResponse>("/api/wishlist", { method: "DELETE" });
