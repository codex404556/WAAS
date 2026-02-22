"use client";

import { listProductsByFilters } from "@/lib/cms";
import { Product } from "@/types/cms";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductsCard from "./ProductsCard";
import ShopNoProductsState from "./ShopNoProductsState";
import ProductCardSkeleton from "./skeleton/ProductCardSkeleton";

interface ShopProductsSectionProps {
  selectedCategory: string | null;
  selectedBrand: string | null;
  selectedPrice: string | null;
  searchTerm: string;
}

function ShopProductsSection({
  selectedCategory,
  selectedBrand,
  selectedPrice,
  searchTerm,
}: ShopProductsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const resultsCacheRef = useRef<Record<string, Product[]>>({});
  const requestKeyRef = useRef("");

  const filterKey = useMemo(
    () =>
      [
        selectedCategory ?? "all",
        selectedBrand ?? "all",
        selectedPrice ?? "all",
        searchTerm || "all",
      ].join("|"),
    [selectedBrand, selectedCategory, selectedPrice, searchTerm]
  );

  useEffect(() => {
    requestKeyRef.current = filterKey;
    const cachedProducts = resultsCacheRef.current[filterKey];
    if (cachedProducts) {
      setProducts(cachedProducts);
      setHasLoaded(true);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
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

        if (requestKeyRef.current !== filterKey) return;

        resultsCacheRef.current[filterKey] = data;
        setProducts(data);
      } catch (error) {
        console.log("Shop Product fetching error", error);
      } finally {
        if (requestKeyRef.current !== filterKey) return;
        setLoading(false);
        setHasLoaded(true);
      }
    };

    fetchProducts();
  }, [filterKey, searchTerm, selectedBrand, selectedCategory, selectedPrice]);

  return (
    <div className="mt-10">
      {!hasLoaded || loading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={`shop-skeleton-${index}`} />
          ))}
        </div>
      ) : products?.length > 0 ? (
        <div
          key={`shop-grid-${filterKey}`}
          className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {products?.map((product) => (
            <ProductsCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <ShopNoProductsState />
      )}
    </div>
  );
}

export default ShopProductsSection;
