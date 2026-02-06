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
const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  currentPage,
  showSocialShare = false,
  shareData,
}) => {
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
          // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
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
    <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={"/"}>
            <Home className="w-4 h-4" />
          </Link>
          {/* Dynamic link */}
          {items?.map((item, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              {item?.href ? (
                <Link
                  href={item?.href}
                  className="hover:text-gray-700 hoverEffect"
                >
                  {item?.label}
                </Link>
              ) : (
                <span>{item?.label}</span>
              )}
            </React.Fragment>
          ))}
          {/* current page */}
          <span>/</span>
          <span className="text-gray-700 font-medium">{currentPage}</span>
        </div>
        {/* Social Share Icons */}
        {showSocialShare && shareData && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">Share:</span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("facebook")}
              className="w-8 h-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("twitter")}
              className="w-8 h-8 p-0 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              title="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("instagram")}
              className="w-8 h-8 p-0 hover:bg-pink-50 hover:text-pink-600 transition-colors"
              title="Share on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare("copy")}
              className="w-8 h-8 p-0 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              title="Copy Link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBreadcrumb;
