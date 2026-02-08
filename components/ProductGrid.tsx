"use client";

import { useEffect, useMemo, useState } from "react";
import HomeTabBar from "./HomeTabBar";
import { productType } from "@/constants/data";
import { listProductsByVariant } from "@/lib/cms";
import NoProductsAvailable from "./NoProductsAvailable";
import { AnimatePresence, motion } from "framer-motion";
import ProductsCard from "./ProductsCard";
import { Product } from "@/types/cms";
import ProductCardSkeleton from "./skeleton/ProductCardSkeleton";

const ProductGrid = () => {
  const [selectedTab, setSelectedTab] = useState(productType[0]?.value || "");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const animationKey = useMemo(
    () => selectedTab || "all",
    [selectedTab]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await listProductsByVariant(
          selectedTab
        );
        setProducts(response);
      } catch (error) {
        console.error("Product featching error", error);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };
    fetchData();
  }, [selectedTab]);

  return (
    <div className="mt-10">
      <HomeTabBar selectedTap={selectedTab} onTabSelect={setSelectedTab} />
      <AnimatePresence mode="wait">
        {!hasLoaded || loading ? (
          <motion.div
            key="product-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10"
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))}
          </motion.div>
        ) : products?.length ? (
          <motion.div
            key={`product-grid-${animationKey}`}
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10"
          >
            {products?.slice(0, 10).map((product) => (
              <motion.div
                key={product?._id}
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
            key="product-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <NoProductsAvailable
              selectedTab={
                productType.find((item) => item.value === selectedTab)?.title ??
                selectedTab
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
