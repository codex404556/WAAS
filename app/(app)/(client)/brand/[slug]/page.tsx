import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Title } from "@/components/ui/text";
import { getAllBrands } from "@/lib/cms";
import React from "react";

export const dynamic = "force-dynamic";

const BrandPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const brands = await getAllBrands();

  const selectedBrand = brands.find(
    (brand) => brand.slug?.current?.toLowerCase() === slug.toLowerCase()
  );
  const currentPageLabel =
    selectedBrand?.title ?? selectedBrand?.brandName ?? slug;

  return (
    <div className="mt-16 py-10">
      <Container>
        <PageBreadcrumb
          items={[{ label: "Shop", href: "/shop" }]}
          currentPage={currentPageLabel}
        />

        <Title className="text-darkColor group">
          Products By Brand:{" "}
          <span className="font-bold text-shop_orange capitalize tracking-wide">
            {currentPageLabel}
          </span>
          <div className="bg-shop_dark_yellow w-40 h-1 mt-2 group-hover:w-80 hoverEffect"></div>
        </Title>
      </Container>
    </div>
  );
};

export default BrandPage;
