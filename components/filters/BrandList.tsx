import { BRANDS_QUERYResult } from "@/types/cms";

import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Title } from "../ui/text";
import { Label } from "../ui/label";

interface Props {
  brands: BRANDS_QUERYResult;
  selectedBrand?: string | null;
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>;
}

const BrandList = ({ brands, selectedBrand, setSelectedBrand }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <Title className="text-sm font-semibold text-gray-900">Brands</Title>
      <RadioGroup value={selectedBrand || ""} className="space-y-2">
        {brands?.map((brand) => (
          <div className="relative" key={brand?._id}>
            <RadioGroupItem
              id={brand?.slug?.current}
              value={brand?.slug?.current as string}
              className="peer sr-only"
              onClick={() => {
                if (selectedBrand === (brand?.slug?.current as string)) {
                  setSelectedBrand(null);
                } else {
                  setSelectedBrand(brand?.slug?.current as string);
                }
              }}
            />
            <Label
              htmlFor={brand?.slug?.current}
              className="block w-full cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 peer-focus-visible:ring-2 peer-focus-visible:ring-black/20 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
            >
              {brand?.title}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default BrandList;
