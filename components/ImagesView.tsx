"use client";

import { urlFor } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { Image as CmsImage } from "@/types/cms";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

interface Props {
  images?: CmsImage[];
  isStock?: number;
  productName?: string;
}

type ImageItem = {
  key: string;
  url: string;
};

const buildImageKey = (image: CmsImage, index: number) =>
  image?._key ?? image?.url ?? `image-${index}`;

const buildImageUrl = (image: CmsImage) => {
  try {
    return urlFor(image).url();
  } catch {
    return "";
  }
};

const ImagesView = ({ images = [], isStock, productName }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const imageItems = useMemo<ImageItem[]>(
    () =>
      images
        .map((image, index) => ({
          key: buildImageKey(image, index),
          url: buildImageUrl(image),
        }))
        .filter((item) => Boolean(item.url)),
    [images]
  );
  const firstImageKey = imageItems[0]?.key;
  const [activeImageKey, setActiveImageKey] = useState<string | undefined>(firstImageKey);

  useEffect(() => {
    if (!imageItems.length) {
      setActiveImageKey(undefined);
      return;
    }

    if (!activeImageKey || !imageItems.some((item) => item.key === activeImageKey)) {
      setActiveImageKey(imageItems[0].key);
    }
  }, [activeImageKey, imageItems]);

  const activeItem = useMemo(
    () =>
      imageItems.find((item) => item.key === activeImageKey) ??
      (imageItems.length ? imageItems[0] : undefined),
    [activeImageKey, imageItems]
  );
  const activeImageUrl = activeItem?.url ?? "";
  const activeImageIndex = activeItem
    ? imageItems.findIndex((item) => item.key === activeItem.key)
    : -1;

  if (!activeImageUrl) {
    return null;
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem?.key ?? "active"}
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          className="w-full max-h-137.5 min-h-112.5 rounded-md group"
        >
          <Image
            src={activeImageUrl}
            alt={`${productName ?? "Product"} image ${activeImageIndex + 1}`}
            width={700}
            height={700}
            priority={activeItem?.key === firstImageKey}
            sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 44vw, 100vw"
            className={cn(
              "w-full h-96 max-h-137.5 min-h-125 object-contain group-hover:scale-107 hoverEffect rounded-md",
              isStock === 0 && "opacity-50"
            )}
          />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-3 mt-5">
        {imageItems.map((item, index) => (
          <button
            type="button"
            aria-pressed={activeImageKey === item.key}
            aria-label={`View image ${index + 1}`}
            title={`Image ${index + 1}`}
            className={cn(
              "border border-shop_light_yellow/60 rounded-md overflow-hidden hover:scale-105 hoverEffect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_dark_yellow focus-visible:ring-offset-2",
              activeImageKey === item.key && "scale-110 border-shop_dark_yellow shadow-md"
            )}
            onClick={() => setActiveImageKey(item.key)}
            key={item.key}
          >
            <Image
              src={item.url}
              alt={`${productName ?? "Product"} thumbnail ${index + 1}`}
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
