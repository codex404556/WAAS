"use client";
import { BRANDS_QUERYResult, Category } from "@/types/cms";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import { Title } from "./ui/text";
import ShopFiltersPanel from "./filters/ShopFiltersPanel";
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
import ShopProductsSection from "./ShopProductsSection";

interface Props {
  categories: Category[];
  brands: BRANDS_QUERYResult;
  initialCategory: string | null;
  initialBrand: string | null;
  initialSearchTerm: string;
}

const Shop = ({
  categories,
  brands,
  initialCategory,
  initialBrand,
  initialSearchTerm,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialBrand
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedBrand(initialBrand);
  }, [initialBrand, initialCategory]);

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
    <Container>
      <div className="sticky top-0 z-10 mb-5 ">
        <div className="flex items-center justify-between">
          <Title className="text-lg text-darkColor">
            Get the products as your needs
          </Title>
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
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Narrow products by category, price, and brand.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-2">
            <ShopFiltersPanel
              categories={categories}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              brands={brands}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              showBorder={false}
            />
          </div>
          <SheetFooter className="px-4 py-3">
            <Button variant="outline" onClick={() => setMobileFiltersOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetFilters();
                setMobileFiltersOpen(false);
              }}
              disabled={!hasActiveFilters}
            >
              Reset Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="hidden pb-5 md:sticky md:top-20 md:block md:h-[calc(100vh-160px)] md:min-w-72 md:self-start md:overflow-y-auto scrollbar-hide">
          <ShopFiltersPanel
            categories={categories}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            brands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            showBorder
          />
        </div>
        <div>
          <ShopProductsSection
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedPrice={selectedPrice}
            searchTerm={initialSearchTerm}
          />
        </div>
      </div>
    </Container>
  );
};

export default Shop;
