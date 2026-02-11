"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import useStore from "@/store";
import { Product } from "@/types/cms";

type ProductWithFlexibleCategories = Omit<Product, "categories"> & {
  categories?: Product["categories"] | (string | null)[] | null;
};

interface BuyNowButtonProps {
  product: ProductWithFlexibleCategories | Product | null;
  className?: string;
}

const BuyNowButton = ({ product, className }: BuyNowButtonProps) => {
  const router = useRouter();
  const { addItem, getItemCount } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const stock = product?.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const handleBuyNow = async () => {
    if (!product) {
      toast.error("Product is unavailable");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const itemCount = getItemCount(product._id);

      if (itemCount === 0) {
        addItem(product);
      } else if (itemCount > stock) {
        toast.error("Requested quantity exceeds available stock");
        return;
      }

      toast.success("Redirecting to checkout...");
      router.push("/checkout");
    } catch {
      toast.error("Unable to proceed to checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleBuyNow}
      disabled={isOutOfStock || isProcessing || !product}
      className={className}
      aria-label="Buy now and proceed to checkout"
    >
      {isOutOfStock ? "Out of Stock" : isProcessing ? "Processing..." : "Buy Now"}
    </Button>
  );
};

export default BuyNowButton;
