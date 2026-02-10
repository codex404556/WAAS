import React, { Suspense } from "react";
import ShopData from "@/components/ShopData";
import ShopSkeleton from "@/components/skeleton/ShopSkeleton";
import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const dynamic = "force-dynamic";

const ShopPage = () => {
  return (
    <div className="mt-20">
      <Container>
        <PageBreadcrumb items={[]} currentPage="Shop" />
      </Container>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopData />
      </Suspense>
    </div>
  );
};

export default ShopPage;
