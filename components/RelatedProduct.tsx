import Link from "next/link";
import ProductsCard from "@/components/ProductsCard";
import { listRelatedProductsByCategory } from "@/lib/cms";
import { Title } from "@/components/ui/text";

interface RelatedProductProps {
  categorySlug?: string;
  currentProductId?: string;
  limit?: number;
  title?: string;
}

const RelatedProduct = async ({
  categorySlug,
  currentProductId,
  limit = 4,
  title = "Related Products",
}: RelatedProductProps) => {
  if (!categorySlug) return null;

  const products = await listRelatedProductsByCategory(
    categorySlug,
    currentProductId,
    limit
  );

  if (!products.length) return null;

  return (
    <section className="pb-10 pt-8 sm:pt-10">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <Title className="text-darkColor">{title}</Title>
        <Link
          href={`/category/${categorySlug}`}
          className="text-xs font-semibold text-darkColor underline underline-offset-2 hover:text-shop_dark_yellow sm:text-sm"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductsCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProduct;
