import useStore from "@/store";
import { useMemo } from "react";

type CartProduct = {
  _id: string;
  name: string;
  price: number;
  image?: string;
};

export type CartItemWithQuantity = {
  product: CartProduct;
  quantity: number;
};

export const useCartStore = () => {
  const items = useStore((state) => state.items);
  const resetCart = useStore((state) => state.resetCart);
  const setState = useStore.setState;

  const cartItemsWithQuantities: CartItemWithQuantity[] = useMemo(
    () =>
      items.map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name ?? "Product",
          price: item.product.price ?? 0,
          image: item.product.images?.[0]?.url,
        },
        quantity: item.quantity,
      })),
    [items]
  );

  return {
    cartItemsWithQuantities,
    clearCart: async () => {
      resetCart();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cart-store");
      }
    },
    removeFromCart: async (productId: string) => {
      setState((state) => ({
        items: state.items.filter((item) => item.product._id !== productId),
      }));
    },
    updateCartItemQuantity: async (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setState((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
        return;
      }
      setState((state) => ({
        items: state.items.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));
    },
    syncCartFromServer: async () => {
      // No server sync in this project; keep placeholder for compatibility.
      return;
    },
  };
};
