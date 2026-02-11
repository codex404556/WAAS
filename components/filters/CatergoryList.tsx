import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Category } from "@/types/cms";
import { Title } from "../ui/text";
import { Label } from "../ui/label";

interface Props {
  categories: Category[];
  selectedCategory?: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

const CatergoryList = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <Title className="text-sm font-semibold text-gray-900">Categories</Title>
      <RadioGroup value={selectedCategory || ""} className="space-y-2">
        {categories?.map((category) => (
          <div className="relative" key={category?._id}>
            <RadioGroupItem
              value={(category?.slug?.current as string) || ""}
              id={category?.slug?.current}
              className="peer sr-only"
              onClick={() => {
                if (selectedCategory === (category?.slug?.current as string)) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(category?.slug?.current as string);
                }
              }}
            />
            <Label
              htmlFor={category?.slug?.current}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 peer-focus-visible:ring-2 peer-focus-visible:ring-black/20 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
            >
              <span>{category?.title}</span>
              <span className="text-xs text-gray-400 peer-data-[state=checked]:text-white/90">
                {category?.productCount ?? 0}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default CatergoryList;
