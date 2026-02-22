"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import HomeTabBar from "./HomeTabBar";
import { productType } from "@/constants/data";
import { listProductsByVariant } from "@/lib/cms";
import NoProductsAvailable from "./NoProductsAvailable";
import ProductsCard from "./ProductsCard";
import { Product } from "@/types/cms";
import ProductCardSkeleton from "./skeleton/ProductCardSkeleton";

interface ProductGridProps {
  initialProducts?: Product[];
  initialTab?: string;
}

const ProductGrid = ({
  initialProducts = [],
  initialTab = productType[0]?.value || "",
}: ProductGridProps) => {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(initialProducts.length > 0);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [, startTransition] = useTransition();
  const tabCacheRef = useRef<Record<string, Product[]>>(
    initialProducts.length > 0 ? { [initialTab]: initialProducts } : {}
  );
  const firstLoadRef = useRef(true);
  const animationKey = useMemo(() => selectedTab || "all", [selectedTab]);

  const handleTabSelect = useCallback((tab: string) => {
    startTransition(() => {
      setSelectedTab(tab);
    });
  }, []);

  useEffect(() => {
    if (
      firstLoadRef.current &&
      selectedTab === initialTab &&
      initialProducts.length > 0
    ) {
      firstLoadRef.current = false;
      return;
    }

    firstLoadRef.current = false;

    const cachedProducts = tabCacheRef.current[selectedTab];
    if (cachedProducts) {
      setProducts(cachedProducts);
      setHasLoaded(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await listProductsByVariant(selectedTab);
        tabCacheRef.current[selectedTab] = response;
        setProducts(response);
      } catch (error) {
        console.error("Product featching error", error);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };
    fetchData();
  }, [initialProducts.length, initialTab, selectedTab]);

  return (
    <div className="mt-10">
      <HomeTabBar selectedTap={selectedTab} onTabSelect={handleTabSelect} />
      {!hasLoaded || loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={`product-skeleton-${index}`} />
          ))}
        </div>
      ) : products?.length ? (
        <div
          key={`product-grid-${animationKey}`}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10"
        >
          {products?.slice(0, 10).map((product) => (
            <ProductsCard key={product?._id} product={product} />
          ))}
        </div>
      ) : (
        <NoProductsAvailable
          selectedTab={
            productType.find((item) => item.value === selectedTab)?.title ??
            selectedTab
          }
        />
      )}
    </div>
  );
};

export default ProductGrid;
