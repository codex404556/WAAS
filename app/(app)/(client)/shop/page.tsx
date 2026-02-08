import React, { Suspense } from "react";
import ShopData from "@/components/ShopData";
import ShopSkeleton from "@/components/skeleton/ShopSkeleton";

export const dynamic = "force-dynamic";

const ShopPage = () => {
  return (
    <div className="mt-20">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopData />
      </Suspense>
    </div>
  );
};

export default ShopPage;
