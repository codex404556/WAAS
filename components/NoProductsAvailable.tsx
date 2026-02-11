import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type NoProductsAvailableVariant = "default" | "shopDesktop";

const NoProductsAvailable = ({
  selectedTab,
  className,
  variant = "default",
}: {
  selectedTab?: string;
  className?: string;
  variant?: NoProductsAvailableVariant;
}) => {
  const isShopDesktop = variant === "shopDesktop";

  return (
    <div
      className={cn(
        isShopDesktop
          ? "mt-0 flex w-full min-h-[420px] flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm"
          : "mt-6 flex w-full min-h-[280px] md:h-full flex-col items-center justify-center space-y-4 rounded-xl border border-shop_light_yellow/20 bg-shop_light_bg px-4 py-10 text-center sm:min-h-80 sm:px-6 sm:py-12",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2
          className={cn(
            "text-xl font-bold sm:text-2xl",
            isShopDesktop ? "text-gray-900" : "text-gray-800"
          )}
        >
          No Products Available
        </h2>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={cn(
          "max-w-xl text-sm sm:text-base",
          isShopDesktop ? "text-gray-600" : "text-gray-600"
        )}
      >
        We&apos;re sorry, there are no products matching{" "}
        {selectedTab ? (
          <span className="font-semibold text-darkColor">{selectedTab}</span>
        ) : (
          "your selected filters"
        )}{" "}
        right now.
      </motion.p>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={cn(
          "flex items-center gap-2 text-sm sm:text-base",
          isShopDesktop ? "text-gray-500" : "text-lightColor"
        )}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>We&apos;re restocking shortly</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="max-w-md text-xs text-gray-500 sm:text-sm"
      >
        {isShopDesktop
          ? "Try adjusting your filters or search to find matching products."
          : "Please check back later or explore our other products."}
      </motion.p>
    </div>
  );
};

export default NoProductsAvailable;
