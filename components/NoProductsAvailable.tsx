import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const NoProductsAvailable = ({
  selectedTab,
  className,
}: {
  selectedTab?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "mt-6 flex w-full min-h-[280px] flex-col items-center justify-center space-y-4 rounded-xl border border-shop_light_yellow/20 bg-shop_light_bg px-4 py-10 text-center sm:min-h-[320px] sm:px-6 sm:py-12",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
          No Products Available
        </h2>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-xl text-sm text-gray-600 sm:text-base"
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
        className="flex items-center gap-2 text-sm text-lightColor sm:text-base"
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
        Please check back later or explore our other products.
      </motion.p>
    </div>
  );
};

export default NoProductsAvailable;
