import { getDealProducts } from "@/lib/cms";
import { Product } from "@/types/cms";
import Link from "next/link";
import ProductsCard from "./ProductsCard";
import { Title } from "./ui/text";
import { Button } from "./ui/button";

const MAX_VISIBLE_DEALS = 10;

const getDiscountPercent = (product: Product): number => {
  const price = product.price;
  const oldPrice = product.oldPrice;

  if (
    typeof price !== "number" ||
    typeof oldPrice !== "number" ||
    oldPrice <= 0 ||
    oldPrice <= price
  ) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const isValidDealProduct = (product: Product): boolean => {
  const hasValidDiscount =
    typeof product.price === "number" &&
    typeof product.oldPrice === "number" &&
    product.oldPrice > product.price;

  return product.status === "hot" && hasValidDiscount && (product.stock ?? 0) > 0;
};

const sortDeals = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const discountDiff = getDiscountPercent(b) - getDiscountPercent(a);
    if (discountDiff !== 0) return discountDiff;
    return (b.price ?? 0) - (a.price ?? 0);
  });
};

const HomeDealSection = async () => {
  const products = await getDealProducts();

  const deals = sortDeals(products.filter(isValidDealProduct)).slice(0, MAX_VISIBLE_DEALS);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-shop_light_yellow/20 bg-white p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Title className="border-b pb-2 sm:pb-3">Today&apos;s Deals</Title>
          <Link href="/deal">
            <Button variant="outline" className="h-9 px-4 text-sm">
              View All Deals
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
          {deals.map((product) => (
            <ProductsCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeDealSection;
