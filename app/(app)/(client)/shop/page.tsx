import React from "react";
import ShopData from "@/components/ShopData";
import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const revalidate = 300;

const ShopPage = () => {
  return (
    <div className="mt-20">
      <Container>
        <PageBreadcrumb items={[]} currentPage="Shop" />
      </Container>
      <ShopData />
    </div>
  );
};

export default ShopPage;
