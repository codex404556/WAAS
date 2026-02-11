import React from "react";
import { BRANDS_QUERYResult, Category } from "@/types/cms";
import CatergoryList from "./CatergoryList";
import PriceList from "./PriceList";
import BrandList from "./BrandList";

interface ShopFiltersPanelProps {
  categories: Category[];
  brands: BRANDS_QUERYResult;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPrice: string | null;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string | null>>;
  selectedBrand: string | null;
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>;
  showBorder?: boolean;
}

const ShopFiltersPanel = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  selectedBrand,
  setSelectedBrand,
  showBorder = false,
}: ShopFiltersPanelProps) => {
  return (
    <aside
      className={`space-y-6 rounded-xl bg-white p-4 ${
        showBorder ? "border border-gray-200" : ""
      }`}
    >
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
    </aside>
  );
};

export default ShopFiltersPanel;
