"use client";

import { urlFor } from "@/lib/image";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { Check, Star } from "lucide-react";

interface ProductImage {
  url?: string;
  asset?: {
    url?: string;
  };
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage?: ProductImage;
}

interface Props {
  titleInfo: {
    description: string;
    additionalInformation: string;
  };
  keyFeatures?: Array<{ title?: string }>;
  specifications?: Array<{ name?: string; title?: string }>;
  reviews: Review[];
}

const ProductTab = ({
  titleInfo,
  keyFeatures = [],
  specifications = [],
  reviews,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">(
    "description"
  );
  const [showAllReviews, setShowAllReviews] = useState(false);

  const normalizedFeatures = useMemo(
    () =>
      keyFeatures
        .map((feature) => feature.title?.trim() ?? "")
        .filter((title) => title.length > 0),
    [keyFeatures]
  );

  const normalizedSpecifications = useMemo(
    () =>
      specifications
        .map((item) => ({
          name: item.name?.trim() ?? "",
          title: item.title?.trim() ?? "",
        }))
        .filter((item) => item.name.length > 0 && item.title.length > 0),
    [specifications]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingDistribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((review) => review.rating === stars).length;
        const percentage = reviews.length
          ? Math.round((count / reviews.length) * 100)
          : 0;
        return { stars, count, percentage };
      }),
    [reviews]
  );

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-10 w-full">
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center rounded-t-md border border-b-0 border-gray-200 bg-white">
          {[
            { id: "description", label: "Description" },
            { id: "specifications", label: "Specifications" },
            { id: "reviews", label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
                activeTab === tab.id
                  ? "border-b-2 border-shop_dark_yellow text-shop_dark_yellow"
                  : "text-lightColor hover:text-darkColor"
              }`}
              onClick={() =>
                setActiveTab(tab.id as "description" | "specifications" | "reviews")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-60 rounded-b-md border border-gray-200 bg-white p-4 sm:p-6">
        {activeTab === "description" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-darkColor">Product Description</h3>
              <p className="text-sm leading-relaxed text-lightColor">
                {titleInfo.description ||
                  "No Description has been provided for this product yet."}
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-darkColor">Key Features</h3>
              {normalizedFeatures.length > 0 ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {normalizedFeatures.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-green-600" />
                      <span className="text-sm text-lightColor">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-lightColor">No key features available.</p>
              )}
            </div>

            {titleInfo.additionalInformation ? (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-darkColor">
                  Additional Information
                </h3>
                <p className="text-sm leading-relaxed text-lightColor">
                  {titleInfo.additionalInformation}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "specifications" && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-darkColor">Technical Specifications</h3>
            {normalizedSpecifications.length > 0 ? (
              <div className="grid gap-2">
                {normalizedSpecifications.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="grid grid-cols-2 gap-3 rounded-md bg-gray-50 p-3"
                  >
                    <span className="text-sm font-semibold text-darkColor">{item.name}</span>
                    <span className="text-sm text-lightColor">{item.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-lightColor">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="grid gap-6 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
              <div className="text-center">
                <p className="text-4xl font-bold text-shop_dark_yellow">{averageRating || "0.0"}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-shop_light_yellow text-shop_light_yellow" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-lightColor">
                  Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-darkColor">{item.stars}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-shop_light_yellow"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-lightColor">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {displayedReviews.length > 0 ? (
              <div className="space-y-3">
                {displayedReviews.map((item, index) => (
                  <div
                    key={`${item.userName}-${item.date}-${index}`}
                    className="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {item.userImage ? (
                        <Image
                          src={urlFor(item.userImage).width(80).height(80).url()}
                          width={40}
                          height={40}
                          alt={item.userName || "Reviewer"}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                          {item.userName?.slice(0, 1).toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-darkColor">{item.userName}</p>
                          <p className="text-xs text-lightColor">{item.date}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < item.rating ? "fill-shop_light_yellow text-shop_light_yellow" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-lightColor">{item.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-lightColor">No reviews for this product yet.</p>
            )}

            {reviews.length > 3 ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-darkColor hover:bg-gray-50"
                >
                  {showAllReviews
                    ? "Show Less Reviews"
                    : `Show All ${reviews.length} Reviews`}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTab;
