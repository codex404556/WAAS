import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./types/cms";

// Type that allows categories to be either reference objects or strings (dereferenced)
type ProductWithFlexibleCategories = Omit<Product, "categories"> & {
  categories?: Product["categories"] | (string | null)[] | null;
};

export interface CartItem {
  product: Product | ProductWithFlexibleCategories;
  quantity: number;
}

interface StoreState {
  items: CartItem[];
  promoDiscount: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  getItemCount: (productId: string) => number;
  addItem: (product: Product | ProductWithFlexibleCategories) => void;
  removeItem: (productId: string) => void;
  // list all of favorite product here
  favoriteProduct: (Product | ProductWithFlexibleCategories)[];
  addToFavorite: (
    product: Product | ProductWithFlexibleCategories
  ) => Promise<void>;
  getGroupedItems: () => CartItem[];
  getitemCount: (productId: string) => number;
  setPromoDiscount: (amount: number) => void;
  resetPromoDiscount: () => void;
  getPromoDiscount: () => number;
  getSubTotalPrice: () => number;
  getTotalPrice: () => number;
  resetCart: () => void;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      promoDiscount: 0,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      favoriteProduct: [],

      getItemCount: (productId) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product._id === product._id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),
      addToFavorite: (product: Product | ProductWithFlexibleCategories) => {
        return new Promise<void>((resolve) => {
          set((state) => {
            const isFavorite = state.favoriteProduct.some(
              (item) => item._id === product._id
            );
            return {
              favoriteProduct: isFavorite
                ? state.favoriteProduct.filter(
                    (item) => item._id !== product._id
                  )
                : [...state.favoriteProduct, { ...product }],
            };
          });
          resolve();
        });
      },
      removeFromFavorite: (productId: string) => {
        set((state: StoreState) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item._id !== productId
          ),
        }));
      },
      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },
      getitemCount: (productId: string) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
      setPromoDiscount: (amount: number) => {
        set({ promoDiscount: Math.max(0, amount) });
      },
      resetPromoDiscount: () => {
        set({ promoDiscount: 0 });
      },
      getPromoDiscount: () => {
        const subtotal = get().getSubTotalPrice();
        return Math.min(get().promoDiscount, subtotal);
      },
      getSubTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0
        );
      },
      getTotalPrice: () => {
        const subtotal = get().getSubTotalPrice();
        return Math.max(0, subtotal - get().getPromoDiscount());
      },
      resetCart: () => set({ items: [], promoDiscount: 0 }),
    }),
    {
      name: "cart-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useStore;
