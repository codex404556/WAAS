import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Title } from "./ui/text";
import PriceFormatter from "./PriceFormatter";
import useStore from "@/store";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const MobOrderSummary = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { getSubTotalPrice, getPromoDiscount, getTotalPrice } = useStore();
  const router = useRouter();
  const subtotal = getSubTotalPrice();
  const discount = getPromoDiscount();
  const total = getTotalPrice();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:hidden"
    >
      <div className="mx-auto max-w-7xl px-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">Total</p>
            <PriceFormatter
              amount={total}
              className="truncate text-base font-bold text-darkColor"
            />
          </div>
          <Button
            size="lg"
            className="h-11 min-w-[190px] rounded-full bg-darkColor px-4 font-semibold text-white hover:bg-shop_light_yellow/90"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={isDetailsOpen}
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          className="mt-2 w-full text-left text-sm font-medium text-lightColor underline underline-offset-2"
        >
          {isDetailsOpen ? "Hide details" : "View details"}
        </button>

        <div
          className={`grid transition-all duration-300 ${
            isDetailsOpen ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <Title className="mb-4 text-darkColor">Order Summary</Title>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Suptotal</span>
                  <PriceFormatter
                    amount={subtotal}
                    className="font-bold text-lightColor"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <PriceFormatter
                    amount={discount}
                    className="font-bold text-lightColor"
                  />
                </div>
                <Separator />
                <div className="mt-4 flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <PriceFormatter
                    amount={total}
                    className="text-lg font-bold text-darkColor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobOrderSummary;
