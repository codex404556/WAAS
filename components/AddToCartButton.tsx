"use client";

import { Product } from "@/types/cms";
import React, { memo, useCallback } from "react";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import QuantityButton from "./QuantityButton";

// Type that allows categories to be either reference objects or strings (dereferenced)
type ProductWithFlexibleCategories = Omit<Product, "categories"> & {
  categories?: Product["categories"] | (string | null)[] | null;
};

interface AddToCartButtonProps {
  product: ProductWithFlexibleCategories | Product | null;
  showProduct?: true | false;
  className?: string;
}

const AddToCartButton = ({
  product,
  showProduct,
  className,
}: AddToCartButtonProps) => {
  const productId = product?._id ?? "";
  const isProductLayout = showProduct === true;
  const isOutOfStock = product?.stock === 0;
  const hasHydrated = useStore((state) => state.hasHydrated);
  const addItem = useStore((state) => state.addItem);
  const itemCount = useStore((state) =>
    productId ? state.getItemCount(productId) : 0
  );
  const visibleItemCount = hasHydrated ? itemCount : 0;
  const HandleAddToCart = useCallback(() => {
    if (!product) return;
    if ((product.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product.name?.substring(0, 12)} ...add successfully!`);
    } else {
      toast.error("Can not add more than availabe stock");
    }
  }, [addItem, itemCount, product]);

  if (!product) return null;

  return (
    <div className={isProductLayout ? "w-full" : ""}>
      {visibleItemCount > 0 ? (
        <div className="flex flex-col">
          <div
            className={`text-sm w-full flex flex-col ${isProductLayout ? "gap-1" : ""}`}
          >
            <QuantityButton
              product={product}
              className={className}
              showProduct={isProductLayout}
            />

            {isProductLayout ? (
              <div className="flex items-center justify-between gap-1 border-t pt-1">
                <span className="text-xs font-semibold text-lightColor">
                  subTotal
                </span>
                <PriceFormatter
                  className="text-xs font-semibold text-lightColor"
                  amount={product?.price && product?.price * visibleItemCount}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {!isProductLayout ? (
            <div>
              {!isOutOfStock && (
                <Button onClick={HandleAddToCart}>
                  <ShoppingCart />
                </Button>
              )}
            </div>
          ) : (
            <Button
              className={`w-full flex items-center gap-4 hover:scale-105 ${className ?? ""}`}
              onClick={HandleAddToCart}
            >
              <ShoppingCart />
              <p className="font-semibold tracking-wide ">Add To Cart</p>
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default memo(AddToCartButton);
