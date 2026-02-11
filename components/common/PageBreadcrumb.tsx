import { Facebook, Home, Instagram, LinkIcon, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
  showSocialShare?: boolean;
  shareData?: {
    title: string;
    text: string;
    url: string;
  };
}

const formatBreadcrumbLabel = (value: string, maxWords = 3): string => {
  const normalizedValue = value.replace(/[-_]+/g, " ").trim();
  if (!normalizedValue) return "";

  return normalizedValue.split(/\s+/).slice(0, maxWords).join(" ");
};

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  currentPage,
  showSocialShare = false,
  shareData,
}) => {
  const displayCurrentPage = formatBreadcrumbLabel(currentPage, 3);

  const handleShare = async (platform: string) => {
    if (!shareData) {
      toast.error("No share data available");
      return;
    }

    const { title, text, url } = shareData;
    const shareText = `${title} - ${text}`;

    try {
      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}&quote=${encodeURIComponent(shareText)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(url)}`;
          break;
        case "instagram":
          await navigator.clipboard.writeText(`${shareText} ${url}`);
          toast.success(
            "Copied to clipboard! You can now paste it on Instagram"
          );
          return;
        case "copy":
          await navigator.clipboard.writeText(`${shareText} ${url}`);
          toast.success("Link copied to clipboard!");
          return;
        default:
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share. Please try again.");
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-babyshopWhite p-3 shadow-sm sm:mb-8 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="flex min-w-max items-center gap-1.5 whitespace-nowrap text-xs text-gray-500 sm:gap-2 sm:text-sm">
            <Link href="/" className="shrink-0 rounded-sm p-1 hover:bg-gray-100">
              <Home className="h-4 w-4" />
            </Link>
            {items?.map((item, index) => {
              const displayLabel = formatBreadcrumbLabel(item?.label, 3);

              return (
                <React.Fragment key={`${item?.label}-${index}`}>
                  <span className="text-gray-300">/</span>
                  {item?.href ? (
                    <Link
                      href={item?.href}
                      className="max-w-28 truncate hover:text-gray-700 sm:max-w-40"
                      title={item?.label}
                    >
                      {displayLabel}
                    </Link>
                  ) : (
                    <span
                      className="max-w-28 truncate sm:max-w-40"
                      title={item?.label}
                    >
                      {displayLabel}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
            <span className="text-gray-300">/</span>
            <span
              className="max-w-32 truncate font-medium text-gray-700 sm:max-w-48"
              title={currentPage}
            >
              {displayCurrentPage || "Page"}
            </span>
          </div>
        </div>

        {showSocialShare && shareData && (
          <div className="flex items-center gap-1.5 self-end sm:gap-2">
            <span className="mr-1 text-[11px] text-gray-500 sm:mr-2 sm:text-xs">
              Share:
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("facebook")}
              className="h-8 w-8 p-0 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("twitter")}
              className="h-8 w-8 p-0 transition-colors hover:bg-sky-50 hover:text-sky-600"
              title="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("instagram")}
              className="h-8 w-8 p-0 transition-colors hover:bg-pink-50 hover:text-pink-600"
              title="Share on Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("copy")}
              className="h-8 w-8 p-0 transition-colors hover:bg-gray-50 hover:text-gray-700"
              title="Copy Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBreadcrumb;
