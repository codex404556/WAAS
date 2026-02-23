import React from "react";
import { Title } from "./ui/text";
import Link from "next/link";
import { getAllBrands } from "@/lib/cms";
import Image from "next/image";
import { urlFor } from "@/lib/image";
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";
import { Brand } from "@/types/cms";

const orderData = [
  {
    title: "Free Delivery",
    description: "Free shipping over $100",
    icon: <Truck size={30} />,
  },
  {
    title: "Free Return",
    description: "Free return over $100",
    icon: <GitCompareArrows size={30} />,
  },
  {
    title: "Customer Support",
    description: "Friendly 7/24 customer support",
    icon: <Headset size={30} />,
  },
  {
    title: "Money Back",
    description: "Quality checked by our team",
    icon: <ShieldCheck size={30} />,
  },
];

const ShopByBrands = async () => {
  let brands: Brand[] = [];
  try {
    brands = await getAllBrands();
  } catch (error) {
    console.error("Failed to load brands for home page:", error);
    return null;
  }
  return (
    <section className="mb-12 px-4 sm:px-6 lg:mb-20 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-shop_light_bg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <Title>Shop By Brands</Title>
          <Link
            href={"/brand"}
            className="rounded-full bg-darkColor px-3 py-1.5 text-xs font-semibold text-white hover:bg-shop_light_yellow hover:text-darkColor hover:scale-105 hoverEffect"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {brands?.slice(0, 8).map((brand: Brand) => (
            <Link
              className="group flex min-h-20 items-center justify-center overflow-hidden rounded-lg border border-shop_light_yellow/25 bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md hoverEffect sm:min-h-24"
              key={brand?._id}
              href={{ pathname: "/shop", query: { brand: brand?.slug?.current } }}
            >
              {brand?.image && (
                <Image
                  src={urlFor(brand?.image).url()}
                  alt="brand-image"
                  width={250}
                  height={250}
                  loading="lazy"
                  sizes="(min-width: 1024px) 144px, (min-width: 768px) 120px, 45vw"
                  className="h-14 w-full object-contain group-hover:scale-105 hoverEffect sm:h-16"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-shop_light_yellow/20 bg-white p-4 shadow-sm sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-4 lg:p-5">
          {orderData.map((brand) => (
            <div key={brand.title} className="group flex items-center gap-3 rounded-lg p-2">
              <span className="text-lightColor group-hover:text-shop_dark_yellow hover:scale-105 hoverEffect">
                {brand?.icon}
              </span>
              <div>
                <p className="text-sm font-semibold capitalize text-lightColor group-hover:text-shop_dark_yellow">
                  {brand?.title}
                </p>
                <p className="text-xs font-medium text-lightColor/80 sm:text-sm">
                  {brand?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByBrands;
