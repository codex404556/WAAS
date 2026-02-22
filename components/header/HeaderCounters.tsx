"use client";

import useStore from "@/store";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface HeaderCountersProps {
  isScrolled: boolean;
}

const HeaderCounters = ({ isScrolled }: HeaderCountersProps) => {
  const { items, favoriteProduct } = useStore();

  return (
    <>
      <Link
        href="/cart"
        className={`group relative hoverEffect ${isScrolled ? "scale-80" : "scale-120"}`}
      >
        <ShoppingCart className="w-5 h-5 hover:text-shop_dark_yellow hoverEffect" />
        <span className="absolute -top-1 -right-1 bg-amber-200 rounded-full flex items-center justify-center text-xs font-semibold text-black h-3.5 w-3.5">
          {items?.length ?? 0}
        </span>
      </Link>

      <Link
        href="/favorites"
        className={`group relative hoverEffect ${isScrolled ? "scale-90" : "scale-120"}`}
      >
        <Heart className="w-5 h-5 hover:text-shop_dark_yellow hoverEffect" />
        <span className="absolute -top-1 -right-1 bg-amber-200 rounded-full flex items-center justify-center text-xs font-semibold text-black h-3.5 w-3.5">
          {favoriteProduct.length}
        </span>
      </Link>
    </>
  );
};

export default HeaderCounters;
