import React from "react";
import { Title } from "./ui/text";
import { getCategories } from "@/lib/cms";
import { Category } from "@/types/cms";
import Image from "next/image";
import { urlFor } from "@/lib/image";
import Link from "next/link";
import { Button } from "./ui/button";

const HomeCategories = async ({
  categories,
}: {
  categories?: Category[];
}) => {
  const resolvedCategories = categories ?? (await getCategories());
  return (
    <section className="my-10 px-4 sm:px-6 md:my-16 lg:my-20 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-shop_light_yellow/20 bg-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <Title className="border-b pb-2 sm:pb-3">Popular Categories</Title>
        {resolvedCategories?.[0]?.slug?.current && (
          <Link href={`/category/${resolvedCategories[0].slug.current}`}>
            <Button variant="outline" className="h-9 px-4 text-sm">
              See All
            </Button>
          </Link>
        )}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-5">
        {resolvedCategories?.slice(0, 6).map((item) => (
          <Link
            href={`/category/${item?.slug?.current}`}
            key={item?._id}
            className="group flex min-h-24 items-center gap-3 rounded-xl border border-shop_light_yellow/20 bg-shop_light_bg p-2.5 transition-all duration-300 hover:bg-shop_light_yellow/70 hover:shadow-md md:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_dark_yellow"
          >
            {item?.image && (
              <div className="h-18 w-18 shrink-0 overflow-hidden rounded-md border border-shop_light_yellow/20 bg-white p-1 sm:h-20 sm:w-20">
                <Image
                  src={urlFor(item?.image).url()}
                  alt="category-image"
                  width={500}
                  height={500}
                  loading="lazy"
                  sizes="(min-width: 1024px) 96px, (min-width: 640px) 80px, 72px"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-sm font-semibold sm:text-base">
                {item?.title}
              </h3>
              <p className="text-sm text-lightColor">
                <span className="font-bold text-shop_dark_yellow">
                  ({item?.productCount ?? 0})
                </span>{" "}
                Available
              </p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
};

export default HomeCategories;
