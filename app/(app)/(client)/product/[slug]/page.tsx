import AddToCartButton from "@/components/AddToCartButton";
import AddToFavorites from "@/components/AddToFavorites";
import Container from "@/components/Container";
import ImagesView from "@/components/ImagesView";
import PriceView from "@/components/PriceView";
import ProductsCharacteristics from "@/components/ProductsCharacteristics";
import RelatedProduct from "@/components/RelatedProduct";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import {
  getCategories,
  getProductBySlug,
  getProductInfo,
  getProductReview,
} from "@/lib/cms";
import { Category } from "@/types/cms";
import { StarIcon, Truck, CornerDownLeft } from "lucide-react";
import React from "react";
import { RxBorderSplit } from "react-icons/rx";
import { FaRegQuestionCircle } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FiShare2 } from "react-icons/fi";
import ProductTab from "@/components/ProductTab";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const normalize = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase();

const resolveCategoryByName = (
  categoryName?: string,
  categories: Category[] = []
): Category | null => {
  if (!categoryName) return null;

  const normalizedName = normalize(categoryName);

  return (
    categories.find((category) => {
      const title = normalize(category.title);
      const slug = normalize(category.slug?.current);
      return title === normalizedName || slug === normalizedName;
    }) ?? null
  );
};

const SingleProductPage = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const [allCategories, reviews] = await Promise.all([
    getCategories(),
    getProductReview(slug),
  ]);

  const titleInfo =
    (await getProductInfo(slug)) ?? {
      description: "",
      additionalInformation: "",
    };

  const productCategoryName =
    typeof product?.categories?.[0] === "string"
      ? product.categories[0]
      : product?.categories?.[0]?.title;
  const matchedCategory = resolveCategoryByName(productCategoryName, allCategories);

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Shop", href: "/shop" }];

  if (matchedCategory?.slug?.current) {
    breadcrumbItems.push({
      label: matchedCategory.title ?? "Category",
      href: `/category/${matchedCategory.slug.current}`,
    });
  } else if (productCategoryName) {
    breadcrumbItems.push({ label: productCategoryName });
  }

  const isStock = product?.stock;

  return (
    <div className="mt-16 sm:mt-20">
      <Container className="px-3 sm:px-4 lg:px-6">
        <PageBreadcrumb
          currentPage={product?.name ?? "Product"}
          items={breadcrumbItems}
        />
      </Container>

      <Container className="flex flex-col gap-8 px-3 sm:px-4 lg:flex-row lg:gap-10 lg:px-6 xl:gap-12">
        <div className="flex w-full flex-col lg:w-1/2">
          {product?.images && (
            <ImagesView images={product?.images} isStock={isStock} />
          )}

          <ProductTab titleInfo={titleInfo} reviews={reviews} />
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          <h2 className="text-xl font-semibold text-darkColor sm:text-2xl">
            {product?.name}
          </h2>
          <p className="text-xs font-medium text-lightColor sm:text-sm">
            {product?.description}
          </p>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) =>
              index < 4 ? (
                <StarIcon
                  size={12}
                  key={index}
                  className="text-shop_light_yellow fill-shop_light_yellow hover:scale-115 hoverEffect"
                  fill="currentColor"
                />
              ) : (
                <StarIcon
                  size={12}
                  key={index}
                  className="text-gray-300"
                  fill="none"
                />
              )
            )}
            <p className="text-xs font-light">(120)</p>
          </div>
          <div>
            <PriceView price={product?.price} oldPrice={product?.oldPrice} />
            <p
              className={`mt-2 inline-block rounded-full px-2 text-center text-[12px] font-semibold ${isStock ? "bg-shop_light_yellow" : "bg-red-500"}`}
            >
              {(isStock as number) > 0 ? "In Stock" : "Unvailed"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-full">
              <AddToCartButton showProduct={true} product={product} />
            </div>
            <AddToFavorites
              product={product}
              showProduct={true}
              className="self-start sm:self-auto"
            />
          </div>
          <ProductsCharacteristics product={product} />
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2.5 border-y border-y-gray-200 py-4">
            <div className="flex items-center gap-2 text-sm text-darkColor hover:text-shop_dark_yellow hoverEffect">
              <RxBorderSplit className="text-lg" />
              <p>Compare Color</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-darkColor hover:text-shop_dark_yellow hoverEffect">
              <FaRegQuestionCircle className="text-lg" />
              <p>Ask a Question</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-darkColor hover:text-shop_dark_yellow hoverEffect">
              <TbTruckDelivery className="text-lg" />
              <p>Delivery & Return</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-darkColor hover:text-shop_dark_yellow hoverEffect">
              <FiShare2 className="text-lg" />
              <p>Share</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3 rounded-md border border-gray-300 px-3 py-3 sm:items-center">
              <Truck
                size={26}
                className="text-shop_orange hover:scale-105 hoverEffect"
              />
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-black sm:text-base">
                  Free Delivery
                </p>
                <p className="text-xs text-gray-500 underline underline-offset-2 sm:text-sm">
                  Enter Your Postal code for delivery availability
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-gray-300 px-3 py-3 sm:items-center">
              <CornerDownLeft
                size={26}
                className="text-shop_orange hover:scale-105 hoverEffect"
              />
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-black sm:text-base">
                  Return Delivery
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Free 30days Delivery Returns.{" "}
                  <span className="underline underline-offset-1">
                    Detailes
                  </span>{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="px-3 sm:px-4 lg:px-6">
        <RelatedProduct
          categorySlug={matchedCategory?.slug?.current}
          currentProductId={product?._id}
        />
      </Container>
    </div>
  );
};

export default SingleProductPage;
