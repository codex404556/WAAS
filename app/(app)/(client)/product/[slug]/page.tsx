import AddToCartButton from "@/components/AddToCartButton";
import AddToFavorites from "@/components/AddToFavorites";
import BuyNowButton from "@/components/BuyNowButton";
import Container from "@/components/Container";
import ImagesView from "@/components/ImagesView";
import ProductsCharacteristics from "@/components/ProductsCharacteristics";
import RelatedProduct from "@/components/RelatedProduct";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import ProductTab from "@/components/ProductTab";
import { getProductBySlug } from "@/lib/cms";
import { StarIcon, Truck, CornerDownLeft } from "lucide-react";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import { RxBorderSplit } from "react-icons/rx";
import { FaRegQuestionCircle } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FiShare2 } from "react-icons/fi";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const formatSkuFromSlug = (slug?: string) =>
  (slug ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toUpperCase() || "N/A";

const ProductTabFallback = () => (
  <div className="mt-10 w-full animate-pulse rounded-b-md border border-gray-200 bg-white p-4 sm:p-6">
    <div className="mb-4 h-6 w-40 rounded bg-gray-100" />
    <div className="space-y-3">
      <div className="h-4 w-full rounded bg-gray-100" />
      <div className="h-4 w-11/12 rounded bg-gray-100" />
      <div className="h-4 w-10/12 rounded bg-gray-100" />
    </div>
  </div>
);

const RelatedProductsFallback = () => (
  <section className="pb-10 pt-8 sm:pt-10">
    <div className="mb-5 h-6 w-40 animate-pulse rounded bg-gray-100" />
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`related-fallback-${index}`}
          className="aspect-[3/4] animate-pulse rounded-md border border-gray-100 bg-white"
        />
      ))}
    </div>
  </section>
);

const SingleProductPage = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const reviews = product?.reviews ?? [];
  const titleInfo = {
    description: product?.description ?? "",
    additionalInformation: product?.additionalInformation ?? "",
  };

  const primaryCategory = product?.categories?.[0];
  const categorySlug =
    typeof primaryCategory === "string"
      ? undefined
      : primaryCategory?.slug?.current;
  const categoryTitle =
    typeof primaryCategory === "string"
      ? primaryCategory
      : primaryCategory?.title;

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Shop", href: "/shop" }];

  if (categorySlug) {
    breadcrumbItems.push({
      label: categoryTitle ?? "Category",
      href: `/category/${categorySlug}`,
    });
  } else if (categoryTitle) {
    breadcrumbItems.push({ label: categoryTitle });
  }

  const isStock = product?.stock;
  const brandName =
    product?.brand?.title ?? product?.brand?.brandName ?? "Unknown Brand";
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? Number(
        (
          reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          reviewCount
        ).toFixed(1)
      )
    : 0;
  const sku = formatSkuFromSlug(product?.slug?.current);
  const currentPrice = Number(product?.price ?? 0);
  const oldPrice =
    typeof product?.oldPrice === "number" && product.oldPrice > currentPrice
      ? product.oldPrice
      : undefined;
  const discountPercent = oldPrice
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;
  const productBreadcrumbLabel = (product?.name ?? "Product")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  return (
    <div className="mt-22 sm:mt-24">
      <Container className="px-3 sm:px-4 lg:px-6">
        <PageBreadcrumb
          currentPage={productBreadcrumbLabel || "Product"}
          items={breadcrumbItems}
        />
      </Container>

      <Container className="flex flex-col gap-8 px-3 sm:px-4 lg:flex-row lg:gap-10 lg:px-6 xl:gap-12">
        <div className="flex w-full flex-col lg:w-1/2">
          {product?.images && (
            <ImagesView images={product?.images} isStock={isStock} />
          )}
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-lightColor">
              Brand: <span className="font-semibold text-darkColor">{brandName}</span>
            </p>
            <p
              className={`text-sm font-medium ${(isStock as number) > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {(isStock as number) > 0
                ? `In Stock (${isStock} available)`
                : "Out of Stock"}
            </p>
          </div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-darkColor sm:text-4xl">
            {product?.name}
          </h1>
          <div className="space-y-4 border-b border-gray-200 pb-5">
            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => {
                  const filled = index < Math.floor(averageRating);
                  return (
                    <StarIcon
                      size={18}
                      key={index}
                      className={
                        filled
                          ? "text-shop_light_yellow fill-shop_light_yellow"
                          : "text-shop_light_yellow"
                      }
                      fill={filled ? "currentColor" : "none"}
                    />
                  );
                })}
              </div>
              <span className="text-2xl font-semibold text-darkColor">
                {averageRating.toFixed(1)}
              </span>
              <span className="h-6 w-px bg-gray-300" />
              <button type="button" className="font-semibold text-shop_dark_yellow">
                {reviewCount} Reviews
              </button>
              <span className="h-6 w-px bg-gray-300" />
              <span className="text-lightColor">SKU: {sku}</span>
            </div>
          </div>

          <div className="space-y-3 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-5xl font-bold leading-none text-shop_dark_yellow">
                ${currentPrice.toFixed(0)}
              </span>
              {oldPrice ? (
                <span className="text-4xl font-semibold leading-none text-lightColor line-through">
                  ${oldPrice.toFixed(0)}
                </span>
              ) : null}
              {discountPercent > 0 ? (
                <span className="rounded-md bg-red-100 px-3 py-2 text-2xl font-medium text-red-600">
                  Save {discountPercent}%
                </span>
              ) : null}
            </div>
            <p className="text-2xl text-lightColor">
              Tax included. Shipping calculated at checkout.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex w-full items-center gap-3">
              <AddToCartButton
                showProduct={true}
                product={product}
                className="h-14 rounded-xl bg-shop_orange text-base font-semibold hover:bg-darkColor hover:text-white hoverEffect"
              />
              <AddToFavorites
                product={product}
                showProduct={true}
                className="h-14 w-14 rounded-xl border border-gray-300 bg-white p-0 text-darkColor opacity-100 transition hover:bg-shop_light_bg hover:text-shop_dark_yellow hover:scale-100"
              />
              <button
                type="button"
                className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-darkColor transition hover:bg-shop_light_bg hover:text-shop_dark_yellow"
                aria-label="Share product"
                title="Share"
              >
                <FiShare2 className="text-xl" />
              </button>
            </div>
            <BuyNowButton
              product={product}
              className="h-14 w-full rounded-xl bg-darkColor text-base font-semibold text-white hover:bg-shop_light_yellow hoverEffect"
            />
          </div>
          <ProductsCharacteristics product={product} />
          <div className="mt-2 grid grid-cols-2 gap-2.5 border-y border-y-gray-200 py-4 md:grid-cols-3">
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
        <Suspense fallback={<ProductTabFallback />}>
          <ProductTab
            titleInfo={titleInfo}
            keyFeatures={product?.keyFeatures}
            specifications={product?.specifications}
            reviews={reviews}
          />
        </Suspense>
      </Container>

      <Container className="px-3 sm:px-4 lg:px-6">
        <Suspense fallback={<RelatedProductsFallback />}>
          <RelatedProduct categorySlug={categorySlug} currentProductId={product?._id} />
        </Suspense>
      </Container>
    </div>
  );
};

export default SingleProductPage;
