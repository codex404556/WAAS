import React from "react";
import PriceFormatter from "./PriceFormatter";
interface Props {
  price: number | undefined;
  oldPrice?: number;
}

const PriceView = ({ price, oldPrice }: Props) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <PriceFormatter amount={price} className="" />
        {price !== undefined && oldPrice !== undefined && oldPrice > 0 && (
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
