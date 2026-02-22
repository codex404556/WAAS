import React from "react";
import ShopData from "@/components/ShopData";
import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const revalidate = 300;

type ShopPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pickParam = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const ShopPage = async ({ searchParams }: ShopPageProps) => {
  const resolvedSearchParams = (searchParams ? await searchParams : {}) as Record<
    string,
    string | string[] | undefined
  >;
  const initialCategory = pickParam(resolvedSearchParams.category);
  const initialBrand = pickParam(resolvedSearchParams.brand);
  const initialSearchTerm = (pickParam(resolvedSearchParams.search) ?? "").trim();

  return (
    <div className="mt-20">
      <Container>
        <PageBreadcrumb items={[]} currentPage="Shop" />
      </Container>
      <ShopData
        initialCategory={initialCategory}
        initialBrand={initialBrand}
        initialSearchTerm={initialSearchTerm}
      />
    </div>
  );
};

export default ShopPage;
