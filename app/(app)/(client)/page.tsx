import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import { Skeleton } from "@/components/ui/skeleton";
import CategorySkeleton from "@/app/(app)/(client)/skeleton/CategorySkeleton";
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
      <Suspense fallback={<CategorySkeleton />}>
        <HomeCategories />
      </Suspense>
      <Suspense
        fallback={
          <div className="lg:mb-25 bg-shop_light_bg p-5 lg:p-7 mx-16 rounded-md">
            <div className="flex items-center justify-between mb-10">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="flex flex-wrap md:flex-nowrap justify-between gap-1.5">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="w-50 h-24 rounded-md" />
              ))}
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-cente justify-between gap-7 mt-10 md:gap-4 shadow-lg rounded-md py-5 px-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
