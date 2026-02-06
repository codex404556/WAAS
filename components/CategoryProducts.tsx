"use client";

import { Category, Product } from "@/types/cms";
import { listProductsByCategory } from "@/lib/cms";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import NoProductsAvailable from "./NoProductsAvailable";
import ProductsCard from "./ProductsCard";
import CategorySkeleton from "@/app/(app)/(client)/skeleton/CategorySkeleton";

interface Props {
  categories: Category[];
  slug: string;
}

const CategoryProducts = ({ categories, slug }: Props) => {
  const normalizedCategories = categories.filter(
    (category): category is Category & { slug: { current: string } } =>
      Boolean(category?.slug?.current)
  );
  const initialSlug =
    normalizedCategories.find((category) => category.slug.current === slug)
      ?.slug.current ??
    normalizedCategories[0]?.slug.current ??
    slug;

  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === currentSlug) return;
    setCurrentSlug(newSlug);
    router.push(`/category/${newSlug}`);
  };

  const featchProducts = async (categorySlug: string) => {
    if (!categorySlug) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const data = await listProductsByCategory(categorySlug);
      setProducts(data);
    } catch (error) {
      console.log("Error Featching Products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setCurrentSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    featchProducts(currentSlug);
  }, [currentSlug]);

  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
  };

  return (
    <div className="py-5 flex flex-col md:flex-row items-start gap-5">
      <div className="flex flex-wrap md:flex-col gap-2 md:min-w-40">
        {normalizedCategories.map((category) => (
          <button
            onClick={() => handleCategoryChange(category.slug.current)}
            className={`text-left border font-semibold py-2 rounded-md px-1 hover:bg-shop_light_yellow hover:text-darkColor hoverEffect hover:scale-105 capitalize ${category.slug.current === currentSlug ? "bg-shop_light_yellow scale-107 text-darkColor" : "text-white bg-darkColor/90"}`}
            key={category?._id}
          >
            {category?.title}
          </button>
        ))}
      </div>
      <div className="w-full">
        {loading ? (
          <CategorySkeleton />
        ) : products?.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlug}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5"
            >
              {products?.map((product: Product) => (
                <motion.div
                  key={product?._id}
                  variants={cardVariants}
                  layout
                >
                  <ProductsCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <NoProductsAvailable selectedTab={currentSlug} className="" />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
