"use client";

import { listProductsByFilters } from "@/lib/cms";
import { Product } from "@/types/cms";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import NoProductsAvailable from "./NoProductsAvailable";
import ProductsCard from "./ProductsCard";
import ShopProductCardSkeleton from "./skeleton/ShopProductCardSkeleton";

interface ShopProductsSectionProps {
  selectedCategory: string | null;
  selectedBrand: string | null;
  selectedPrice: string | null;
  searchTerm: string;
}

const ShopProductsSection = ({
  selectedCategory,
  selectedBrand,
  selectedPrice,
  searchTerm,
}: ShopProductsSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const animationKey = useMemo(
    () =>
      [
        selectedCategory ?? "all",
        selectedBrand ?? "all",
        selectedPrice ?? "all",
        searchTerm || "all",
      ].join("|"),
    [selectedBrand, selectedCategory, selectedPrice, searchTerm]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let minPrice = 0;
      let maxPrice = 10000;

      if (selectedPrice) {
        const [min, max] = selectedPrice.split("-").map(Number);
        minPrice = min;
        maxPrice = max;
      }

      const data = await listProductsByFilters({
        selectedCategory,
        selectedBrand,
        minPrice,
        maxPrice,
        searchTerm: searchTerm ? `${searchTerm}*` : "",
      });

      setProducts(data);
    } catch (error) {
      console.log("Shop Product fetching error", error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [selectedBrand, selectedCategory, selectedPrice, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="mt-10">
      <AnimatePresence mode="wait">
        {!hasLoaded || loading ? (
          <motion.div
            key="shop-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <ShopProductCardSkeleton key={`shop-skeleton-${index}`} />
            ))}
          </motion.div>
        ) : products?.length > 0 ? (
          <motion.div
            key={`shop-grid-${animationKey}`}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.04 },
              },
            }}
            className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {products?.map((product) => (
              <motion.div
                key={product._id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                layout
              >
                <ProductsCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="shop-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <NoProductsAvailable />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopProductsSection;
