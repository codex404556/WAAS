import CategoryProducts from "@/components/CategoryProducts";
import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { getCategories } from "@/lib/cms";

import React from "react";

export const dynamic = "force-dynamic";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const categories = await getCategories();
  const { slug } = await params;
  const selectedCategory = categories.find(
    (category) => category.slug?.current?.toLowerCase() === slug.toLowerCase()
  );
  const currentPageLabel = selectedCategory?.title ?? slug;

  return (
    <div className="mt-16 py-10">
      <Container>
        <PageBreadcrumb
          items={[{ label: "Shop", href: "/shop" }]}
          currentPage={currentPageLabel}
        />
        <CategoryProducts categories={categories} slug={slug} />
      </Container>
    </div>
  );
};

export default CategoryPage;
