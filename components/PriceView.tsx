import React from "react";
import PriceFormatter from "./PriceFormatter";
interface Props {
  price: number | undefined;
  oldPrice?: number;
  showOldPrice?: boolean;
}

const PriceView = ({ price, oldPrice, showOldPrice = true }: Props) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <PriceFormatter amount={price} className="" />
        {showOldPrice &&
          price !== undefined &&
          oldPrice !== undefined &&
          oldPrice > 0 && (
          <PriceFormatter
            className="line-through text-lightColor/90 text-xs font-normal"
            amount={oldPrice}
          />
          )}
      </div>
    </div>
  );
};

export default PriceView;
