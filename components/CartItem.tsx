import { Product } from "@/types/cms";
import { urlFor } from "@/lib/image";
import useStore from "@/store";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AddToFavorites from "./AddToFavorites";
import { Trash } from "lucide-react";
import QuantityButton from "./QuantityButton";
import PriceFormatter from "./PriceFormatter";
import toast from "react-hot-toast";

// Type that allows categories to be either reference objects or strings (dereferenced)
type ProductWithFlexibleCategories = Omit<Product, "categories"> & {
  categories?: Product["categories"] | (string | null)[] | null;
};

interface Props {
  product: Product | ProductWithFlexibleCategories;
}

const CartItem = ({ product }: Props) => {
  const { getItemCount } = useStore();
  const itemCount = getItemCount(product._id);
  const deleteProduct = useStore((state) => state.removeItem);
  return (
    <div className="w-full border-b p-2 last:border-b-0 sm:p-3">
      <div className="group flex w-full items-start gap-2 sm:gap-4 px-1 sm:px-2">
        {product?.images && (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="border rounded-md overflow-hidden shadow-sm"
          >
            <Image
              src={urlFor(product?.images[0]).url()}
              alt="product-image"
              width={500}
              height={500}
              loading="lazy"
              className="h-16 w-16 object-cover group-hover:scale-105 hoverEffect sm:h-32 sm:w-32 md:h-40 md:w-40"
            />
          </Link>
        )}
        <div className="flex w-full flex-1 justify-between py-1 sm:py-2 md:py-3">
          <div className="flex min-h-16 flex-col justify-between sm:min-h-24 md:min-h-[120px]">
            <div className="flex flex-col gap-0.5 sm:gap-1 md:gap-1.5">
              <h2 className="line-clamp-1 text-xs font-semibold sm:text-sm md:text-base">
                {product?.name?.split(" ").slice(0, 3).join(" ")}
              </h2>
              <p className="text-sm capitalize hidden md:block">
                Variant:{" "}
                <span className="font-semibold text-sm text-darkColor">
                  {product?.variant}
                </span>
              </p>
              <p className="text-[11px] capitalize sm:text-xs md:text-sm">
                Status:{" "}
                <span className="font-semibold text-[11px] text-darkColor sm:text-xs md:text-sm">
                  {product?.status}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AddToFavorites
                product={product}
                showProduct={true}
                className="h-5 w-5 p-1 sm:h-10 sm:w-10 sm:p-2 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5"
              />
              <Trash
                className="h-4 w-4 cursor-pointer text-lightColor hover:text-red-500 hover:scale-110 hoverEffect sm:h-5 sm:w-5"
                onClick={() => {
                  deleteProduct(product?._id);
                  toast.success("Product Deleted Successfuly!");
                }}
              />
            </div>
          </div>

          <div className="flex min-h-16 flex-col justify-between sm:min-h-24 md:min-h-[120px]">
            <PriceFormatter
              amount={(product?.price as number) * itemCount}
              className="text-sm font-semibold text-gray-900 sm:text-base md:text-xl"
            />
            <QuantityButton product={product} showProduct={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
