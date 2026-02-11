import React from "react";
import NoProductsAvailable from "./NoProductsAvailable";

interface ShopNoProductsStateProps {
  selectedTab?: string;
}

function ShopNoProductsState({ selectedTab }: ShopNoProductsStateProps) {
  return (
    <NoProductsAvailable
      selectedTab={selectedTab}
      variant="shopDesktop"
      className="w-full"
    />
  );
}

export default ShopNoProductsState;
