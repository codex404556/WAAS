import { getAllBrands, getCategories } from "@/lib/cms";
import Shop from "./Shop";

interface ShopDataProps {
  initialCategory: string | null;
  initialBrand: string | null;
  initialSearchTerm: string;
}

const ShopData = async ({
  initialCategory,
  initialBrand,
  initialSearchTerm,
}: ShopDataProps) => {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getAllBrands(),
  ]);

  return (
    <Shop
      categories={categories}
      brands={brands}
      initialCategory={initialCategory}
      initialBrand={initialBrand}
      initialSearchTerm={initialSearchTerm}
    />
  );
};

export default ShopData;
