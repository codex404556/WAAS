"use client";

import { Product } from "@/types/cms";
import { urlFor } from "@/lib/image";
import { Flame, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useMemo } from "react";
import useStore from "@/store";
import AddToFavorites from "./AddToFavorites";
import { Title } from "./ui/text";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";

// Type that allows categories to be either reference objects or strings (dereferenced)
type ProductWithFlexibleCategories = Omit<Product, "categories"> & {
  categories?: Product["categories"] | (string | null)[] | null;
};

interface Props {
  product: ProductWithFlexibleCategories;
  clasName?: string;
}

const ProductsCard = ({ product, clasName = "" }: Props) => {
  const productId = product?._id ?? "";
  const hasHydrated = useStore((state) => state.hasHydrated);
  const itemCount = useStore((state) =>
    productId ? state.getItemCount(productId) : 0
  );
  const visibleItemCount = hasHydrated ? itemCount : 0;
  const isCartOpen = visibleItemCount > 0;

  const categoryLabel = useMemo(
    () =>
      (product?.categories ?? [])
        .map((cat) => {
          if (!cat) return "";
          if (typeof cat === "string") return cat;
          return cat.title ?? cat.slug?.current ?? "";
        })
        .filter((value) => value.length > 0)
        .join(", "),
    [product?.categories]
  );

  return (
    <div className="text-sm border border-dark_blue/10 shadow-md rounded-md group bg-white overflow-hidden">
      <div className="relative group overflow-hidden">
        {product?.images && (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="p-5 block"
          >
            <div className="relative aspect-square w-full rounded-md">
              <Image
                src={urlFor(product?.images[0]).url()}
                alt="product-images"
                loading="lazy"
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 768px) 200px, 45vw"
                className={`object-contain ${product?.stock !== 0 ? "group-hover:scale-105 hoverEffect" : "opacity-50"}`}
              />
            </div>
          </Link>
        )}
        {product?.status === "sale" && product?.stock !== 0 && (
          <p className="absolute top-2 left-2 z-10 border rounded-full bg-shop_light_yellow px-3 hover:scale-110 hoverEffect text-xs">
            Sale!
          </p>
        )}
        {product?.status === "hot" && product?.stock !== 0 && (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 bg-shop_orange rounded-full hover:scale-110 hoverEffect px-2 py-2"
          >
            <Flame
              className="hover:scale-110"
              fill="#fb6c08"
              width={18}
              height={18}
            />
          </Link>
        )}
        {product?.status === "new" && product?.stock !== 0 && (
          <p className="absolute top-2 left-2 z-10 bg-shop_light_yellow hover:scale-110 hoverEffect rounded-full text-xs px-2">
            New
          </p>
        )}

        <AddToFavorites
          showProduct={false}
          product={product}
          className={clasName}
        />
      </div>
      <div className="p-3">
        <p className="uppercase line-clamp-1 text-xs text-lightColor">
          {categoryLabel}
        </p>
        <Title className="text-sm! line-clamp-1">{product?.name}</Title>
        <div className="">
          <div className="flex items-center mt-1.5">
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
          </div>
          <div className="flex items-center justify-between">
            <div className="min-h-10">
              <div className="mt-2 min-h-5">
                {!isCartOpen ? (
                  (product?.stock as number) > 0 ? (
                    <p className="font-medium text-xs">
                      <span className="text-darkColor font-semibold bg-amber-400/40 rounded-full px-2">
                        {product?.stock}
                      </span>{" "}
                      In Stock
                    </p>
                  ) : (
                    <p className="text-xs font-semibold bg-red-600/40 rounded-full px-2">
                      Unvailable
                    </p>
                  )
                ) : null}
              </div>
              <PriceView
                price={product?.price}
                oldPrice={product?.oldPrice}
                showOldPrice={!isCartOpen}
              />
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(
  ProductsCard,
  (prevProps, nextProps) =>
    prevProps.product === nextProps.product &&
    prevProps.clasName === nextProps.clasName
);
