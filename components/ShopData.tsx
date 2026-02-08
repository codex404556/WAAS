import { getAllBrands, getCategories } from "@/lib/cms";
import Shop from "./Shop";

const ShopData = async () => {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getAllBrands(),
  ]);

  return <Shop categories={categories} brands={brands} />;
};

export default ShopData;
