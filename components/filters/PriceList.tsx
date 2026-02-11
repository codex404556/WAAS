import React from "react";
import { Title } from "../ui/text";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

const priceArray = [
  { title: "Under $100", value: "0-100" },
  { title: "$100 - $200", value: "100-200" },
  { title: "$200 - $300", value: "200-300" },
  { title: "$300 - $500", value: "300-500" },
  { title: "Over $500", value: "500-10000" },
];

interface Props {
  selectedPrice: string | null;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string | null>>;
}

const PriceList = ({ selectedPrice, setSelectedPrice }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <Title className="text-sm font-semibold text-gray-900">Price Range</Title>
      <RadioGroup value={selectedPrice || ""} className="space-y-2">
        {priceArray?.map((price, index) => (
          <div key={index} className="relative">
            <RadioGroupItem
              value={price?.value}
              id={price?.value}
              className="peer sr-only"
              onClick={() => {
                if (selectedPrice === (price?.value as string)) {
                  setSelectedPrice(null);
                } else {
                  setSelectedPrice(price?.value as string);
                }
              }}
            />
            <Label
              className="block w-full cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 hover:text-black peer-focus-visible:ring-2 peer-focus-visible:ring-black/20 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
              htmlFor={price?.value}
            >
              {price?.title}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PriceList;
