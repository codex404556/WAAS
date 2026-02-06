"use client";
import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUser } from "@clerk/nextjs";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import PriceFormatter from "@/components/common/PriceFormatter";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CartPageClient = () => {
  const {
    cartItemsWithQuantities,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    syncCartFromServer,
  } = useCartStore();
  const { isLoaded, isSignedIn } = useUser();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCart = async () => {
      if (isLoaded && isSignedIn) {
        try {
          await syncCartFromServer();
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
      setIsLoading(false);
    };

    initializeCart();
  }, [isLoaded, isSignedIn, syncCartFromServer]);

  const calculateSubtotal = () => {
    return cartItemsWithQuantities.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + shipping + tax;
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleClearCart = () => {
    setShowClearDialog(true);
  };

  const confirmClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      if (isLoaded && !isSignedIn) {
        toast.error("You must be logged in to place an order.");
        setIsCheckingOut(false);
        return;
      }

      // Redirect to checkout page with cart items
      router.push(`/user/checkout`);
      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      toast.error("Failed to navigate to checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <Container className="py-8">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <span>/</span>
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-24 mb-2" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Cart Items Section Skeleton */}
          <div className="xl:col-span-3">
            <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Table Header Skeleton - Desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
                <div className="col-span-6">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>

              {/* Cart Items Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                  >
                    {/* Mobile Layout Skeleton */}
                    <div className="block lg:hidden">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                      <div className="lg:col-span-6 flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </div>
                      <div className="lg:col-span-2 flex justify-center">
                        <Skeleton className="h-10 w-32" />
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-20 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Skeleton className="h-12 w-full sm:w-48" />
                <Skeleton className="h-12 w-full sm:w-32" />
              </div>
            </div>
          </div>

          {/* Cart Totals Skeleton */}
          <div className="xl:col-span-1">
            <div className="bg-babyshopWhite rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
              <Skeleton className="h-6 w-24 mb-6" />

              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}

                <div className="my-4">
                  <Skeleton className="h-px w-full" />
                </div>

                <div className="flex justify-between items-center py-2">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              <Skeleton className="h-12 w-full mt-6" />

              <div className="mt-4 text-center">
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (cartItemsWithQuantities.length === 0) {
    return (
      <Container className="py-16">
        <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingCart className="w-16 h-16 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is currently empty.
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              You may check out all the available products and buy some in the
              shop.
            </p>
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium"
              >
                Return to shop
              </Button>
            </Link>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  High Quality Selection
                </h3>
                <p className="text-sm text-gray-600">
                  Total product quality control for peace of mind
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Affordable Prices
                </h3>
                <p className="text-sm text-gray-600">
                  Factory direct prices for maximum savings
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Express Shipping
                </h3>
                <p className="text-sm text-gray-600">
                  Fast, reliable delivery from global warehouse
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[]}
        currentPage="Cart"
        showSocialShare={true}
        shareData={{
          title: "My Shopping Cart",
          text: `Check out my cart with ${cartItemsWithQuantities.length} item${
            cartItemsWithQuantities.length !== 1 ? "s" : ""
          } from Babyshop`,
          url: typeof window !== "undefined" ? window.location.href : "",
        }}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cart</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Cart Items Section */}
        <div className="xl:col-span-3">
          <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Cart Table Header - Only visible on larger screens */}
            <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
              <div className="col-span-6 text-sm font-medium text-gray-900 uppercase tracking-wide">
                Product
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Price
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Quantity
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Subtotal
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItemsWithQuantities.map((cartItem) => (
                <div
                  key={cartItem.product._id}
                  className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                >
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${cartItem.product._id}`}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.image ? (
                            <Image
                              src={cartItem.product.image}
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${cartItem.product._id}`}>
                          <h3 className="font-medium text-gray-900 mb-2 text-sm leading-5 hover:text-blue-600 transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Price
                            </span>
                            <PriceFormatter
                              amount={cartItem.product.price}
                              className="text-sm font-medium text-gray-900"
                            />
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.product._id,
                                  cartItem.quantity - 1
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="h-8 w-10 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-xs font-medium">
                              {cartItem.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.product._id,
                                  cartItem.quantity + 1
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtotal and Remove */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Subtotal
                            </span>
                            <PriceFormatter
                              amount={
                                cartItem.product.price * cartItem.quantity
                              }
                              className="text-sm font-semibold text-gray-900"
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(cartItem.product._id)
                            }
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                    {/* Product Info */}
                    <div className="lg:col-span-6 flex items-center gap-4">
                      <Link href={`/product/${cartItem.product._id}`}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.image ? (
                            <Image
                              src={cartItem.product.image}
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${cartItem.product._id}`}>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(cartItem.product._id)
                            }
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price}
                        className="text-base font-medium text-gray-900"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.product._id,
                              cartItem.quantity - 1
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="h-10 w-12 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-sm font-medium">
                          {cartItem.quantity}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.product._id,
                              cartItem.quantity + 1
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price * cartItem.quantity}
                        className="text-base font-semibold text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <Link href="/shop" className="flex-1 sm:flex-initial">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearCart}
                className="w-full sm:w-auto rounded-full px-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Cart Totals */}
        <div className="xl:col-span-1">
          <div className="bg-babyshopWhite rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Cart totals
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <PriceFormatter
                  amount={calculateSubtotal()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-base font-medium">
                  {calculateSubtotal() > 100 ? (
                    <span className="text-green-600">Free shipping</span>
                  ) : (
                    <PriceFormatter
                      amount={15}
                      className="text-base font-medium text-gray-900"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tax</span>
                <PriceFormatter
                  amount={calculateSubtotal() * 0.08}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              {calculateSubtotal() > 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <PriceFormatter
                  amount={calculateTotal()}
                  className="text-xl font-bold text-gray-900"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItemsWithQuantities.length === 0}
              className="w-full mt-6 bg-black hover:bg-gray-800 text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Order...
                </>
              ) : (
                "Proceed to checkout"
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AlertDialog
        open={showClearDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowClearDialog(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear your cart? This action cannot be
              undone and all items will be removed from your cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearCart}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default CartPageClient;
