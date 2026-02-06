"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  getUserWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/lib/wishlistApi";
import type { Product } from "@/types/cms";
import Image from "next/image";
import Link from "next/link";
import PriceFormatter from "@/components/common/PriceFormatter";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    fetchWishlistData();
  }, [isLoaded, isSignedIn, router]);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);

      // Get wishlist IDs from server
      const wishlistResponse = await getUserWishlist();

      if (wishlistResponse.success && wishlistResponse.wishlist.length > 0) {
        setWishlistIds(wishlistResponse.wishlist);
        setWishlistItems(wishlistResponse.products);
      } else {
        setWishlistIds([]);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setRemoving(productId);
      const response = await removeFromWishlist(productId);
      setWishlistIds(response.wishlist);
      setWishlistItems(response.products);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearWishlist = async () => {
    try {
      const response = await clearWishlist();
      setWishlistIds(response.wishlist);
      setWishlistItems(response.products);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  if (isLoaded && !isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-8">
        <PageBreadcrumb
          items={[{ label: "User", href: "/user/profile" }]}
          currentPage="Wishlist"
          showSocialShare={false}
        />

        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadcrumb
        items={[{ label: "User", href: "/user/profile" }]}
        currentPage="Wishlist"
        showSocialShare={false}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button
              onClick={handleClearWishlist}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding items to your wishlist by clicking the heart icon on
              products you love
            </p>
            <Button asChild>
              <Link href="/shop">
                <ShoppingBag size={16} className="mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product: Product) => {
              const imageUrl = product.images?.[0]?.url || "/placeholder.svg";
              const discountPercentage = product.discount ?? 0;
              const categoryName =
                typeof product.categories?.[0] === "object"
                  ? product.categories?.[0]?.title
                  : "Category";
              const price = product.price ?? 0;

              return (
                <div
                  key={product._id}
                  className="border rounded-lg overflow-hidden group"
                >
                  <Link href={`/product/${product._id}`} className="block">
                    <div className="relative">
                      <Image
                        src={imageUrl}
                        alt={product.name || "Product image"}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          -{discountPercentage}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        {categoryName}
                      </p>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-babyshopSky transition-colors h-12">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {discountPercentage > 0 ? (
                        <>
                          <PriceFormatter
                            amount={price}
                            className="text-gray-400 line-through text-sm"
                          />
                          <PriceFormatter
                            amount={price * (1 - discountPercentage / 100)}
                            className="text-red-600 font-semibold"
                          />
                        </>
                      ) : (
                        <PriceFormatter amount={price} className="font-semibold" />
                      )}
                    </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRemoveItem(product._id)}
                      disabled={removing === product._id}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {removing === product._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                    <Button size="sm" className="flex-1">
                      <ShoppingBag size={14} className="mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default WishlistPage;
