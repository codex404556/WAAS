import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/components/skeleton/ProductCardSkeleton";
import React, { Suspense } from "react";

const Home = async () => {
  return (
    <Container className="bg-shop-light-pink ">
      <HomeBanner />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))}
          </div>
        }
      >
        <ProductGrid />
      </Suspense>
      <Suspense fallback={null}>
        <HomeCategories />
      </Suspense>
      <Suspense
        fallback={
          <section className="mb-12 px-4 sm:px-6 lg:mb-20 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl bg-shop_light_bg p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex items-center justify-between sm:mb-8">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-lg sm:h-24" />
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-shop_light_yellow/20 bg-white p-4 shadow-sm sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-4 lg:p-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        }
      >
        <ShopByBrands />
      </Suspense>
      <Suspense
        fallback={
          <div className="mb-10 lg:mb-20">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-wrap md:flex-nowrap mt-5 gap-4 py-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-shop_light_bg rounded-md shadow-md max-w-90 overflow-hidden">
                  <Skeleton className="h-40 w-90" />
                  <div className="p-3 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <LatestBlog />
      </Suspense>
    </Container>
  );
};
export default Home;
