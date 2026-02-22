"use client";

import { urlFor } from "@/lib/image";
import type { Image as CmsImage } from "@/types/cms";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useState } from "react";

interface Props {
  images?: CmsImage[];
  isStock?: number;
}

const ImagesView = ({ images = [], isStock }: Props) => {
  const [isActive, setIsActive] = useState(images[0]);
  const firstImageUrl = images[0] ? urlFor(images[0]).url() : "";
  const activeImageUrl = isActive ? urlFor(isActive).url() : "";

  if (!activeImageUrl) {
    return null;
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={isActive?._key ?? isActive?.url ?? "active"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-h-[550px] min-h-[450px] rounded-md group"
        >
          <Image
            src={activeImageUrl}
            alt="product-image"
            width={700}
            height={700}
            priority={activeImageUrl === firstImageUrl}
            sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 44vw, 100vw"
            className={`w-full h-96 max-h-[550px] min-h-[500px] object-contain group-hover:scale-107 hoverEffect rounded-md ${isStock === 0 && "opacity-50"}`}
          />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-3 mt-5">
        {images?.map((image, index) => (
          <button
            className={`border border-shop_light_yellow/60 rounded-md overflow-hidden hover:scale-105 hoverEffect ${isActive === image && "scale-110 border border-shop_dark_yellow shadow-md"}`}
            onClick={() => setIsActive(image)}
            key={image?._key ?? image?.url ?? index}
          >
            <Image
              src={urlFor(image).url()}
              alt={`Thumbnail ${image?._key}`}
              width={100}
              height={100}
              loading="lazy"
              sizes="120px"
              className="w-30 h-30 object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImagesView;
