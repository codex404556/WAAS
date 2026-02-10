"use client";
import { BRANDS_QUERYResult, Category, Product } from "@/types/cms";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Container from "./Container";
import { Title } from "./ui/text";
import CatergoryList from "./filters/CatergoryList";
import PriceList from "./filters/PriceList";
import BrandList from "./filters/BrandList";
import { useSearchParams } from "next/navigation";
import { listProductsByFilters } from "@/lib/cms";
import NoProductsAvailable from "./NoProductsAvailable";
import ProductsCard from "./ProductsCard";
import ShopProductCardSkeleton from "./skeleton/ShopProductCardSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  categories: Category[];
  brands: BRANDS_QUERYResult;
}

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const categoryParams = searchParams?.get("category");
  const brandParams = searchParams?.get("brand");
  const searchTerm = (searchParams?.get("search") || "").trim();
  const [loading, setLoding] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParams || null
  );

  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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
    setLoding(true);
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
      setLoding(false);
      setHasLoaded(true);
    }
  }, [selectedBrand, selectedCategory, selectedPrice, searchTerm]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const hasActiveFilters =
    selectedBrand !== null ||
    selectedPrice !== null ||
    selectedCategory !== null;
  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedPrice(null);
  };

  return (
    <div className="border-t">
      <Container>
        <div className="sticky top-0 z-10 mb-5 ">
          <div className="flex items-center justify-between">
            <Title className="text-lg">Get the products as your needs</Title>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            {hasActiveFilters && (
              <Button
                variant="destructive"
                onClick={resetFilters}
                className="hidden md:inline-flex"
              >
                Reset Filters
              </Button>
            )}
            </div>
          </div>
        </div>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow products by category, price, and brand.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-2">
              <CatergoryList
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <PriceList
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
              <BrandList
                brands={brands}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
              />
            </div>
            <SheetFooter className="border-t">
              <Button
                variant="outline"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  resetFilters();
                  setMobileFiltersOpen(false);
                }}
              >
                Reset Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="flex flex-col md:flex-row gap-5 border-t border-t-shop_dark_yellow">
          <div className="hidden md:block md:sticky md:top-20 md:self-start md:h-[calc(100vh-160px)] md:overflow-y-auto md:min-w-64 pb-5 md:border-r border-r-shop_light_yellow scrollbar-hide">
            <CatergoryList
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <PriceList
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
            <BrandList
              brands={brands}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
            />
          </div>
          <div className="">
            <div className="mt-10">
              <AnimatePresence mode="wait">
                {!hasLoaded || loading ? (
                  <motion.div
                    key="shop-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-10"
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
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
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
                    <NoProductsAvailable className="p-60" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
