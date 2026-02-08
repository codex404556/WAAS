"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import AddressSelection from "@/components/AddressSelection";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PriceFormatter from "@/components/common/PriceFormatter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Banknote,
} from "lucide-react";
import Image from "next/image";
import { getOrderById, type Order, createOrderFromCart } from "@/lib/orderApi";
import {
  createCheckoutSession,
  redirectToCheckout,
  type StripeCheckoutItem,
} from "@/lib/stripe";
import useStore from "@/store";
import { useCartStore } from "@/store/useCartStore";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Address } from "@/types/address";
import { getUserAddresses } from "@/lib/addressApi";

const CheckoutPageContent = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { cartItemsWithQuantities, clearCart } = useCartStore();
  const hasHydrated = useStore((state) => state.hasHydrated);

  const generateOrderId = () => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(10000 + Math.random() * 90000);
    return `${letter}${numbers}`;
  };

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // Check if user is authenticated
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    const loadAddresses = async () => {
      try {
        const userAddresses = await getUserAddresses();
        setAddresses(userAddresses);
        if (userAddresses.length === 1) {
          setSelectedAddress(userAddresses[0]);
        } else if (userAddresses.length > 1) {
          const defaultAddress = userAddresses.find((addr) => addr.defaulte);
          setSelectedAddress(defaultAddress || userAddresses[0]);
        }
      } catch (error) {
        console.error("Failed to load addresses:", error);
      }
    };

    const initializeCheckout = async () => {
      setLoading(true);
      try {
        if (orderId) {
          // If orderId is provided, load existing order
          console.log("Checkout: Fetching order", orderId);
          const orderData = await getOrderById(orderId);
          if (orderData) {
            console.log("Checkout: Order fetched successfully");
            setOrder(orderData);
          } else {
            toast.error("Order not found");
            router.push("/cart");
          }
        } else {
          // If no orderId, check if we have cart items
          if (
            hasHydrated &&
            cartItemsWithQuantities.length === 0 &&
            !orderId &&
            !order
          ) {
            toast.error("Your cart is empty");
            router.push("/cart");
            return;
          }

          // Create a temporary order object for display
          const tempOrder: Order = {
            _id: "temp",
            orderId: generateOrderId(),
            userId: user?.id || "unknown",
            items: cartItemsWithQuantities.map((item) => ({
              productId: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image,
            })),
            total: cartItemsWithQuantities.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0
            ),
            status: "pending",
            shippingAddress: {
              street: "",
              city: "",
              country: "",
              zipCode: "",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setOrder(tempOrder);
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Failed to load checkout details");
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
    loadAddresses();
  }, [
    orderId,
    router,
    isSignedIn,
    isLoaded,
    user,
    cartItemsWithQuantities,
    hasHydrated,
  ]);

  const handleAddressesUpdate = (updatedAddresses: Address[]) => {
    setAddresses(updatedAddresses);

    // Auto-select address logic
    if (updatedAddresses.length === 1) {
      // If only one address, select it automatically
      setSelectedAddress(updatedAddresses[0]);
    } else if (updatedAddresses.length > 1) {
      // If multiple addresses, prefer default or keep current selection
      const defaultAddress = updatedAddresses.find((addr) => addr.defaulte);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (
        !selectedAddress ||
        !updatedAddresses.find((addr) => addr._id === selectedAddress._id)
      ) {
        // If no default and current selection is invalid, select first
        setSelectedAddress(updatedAddresses[0]);
      }
    } else {
      // No addresses, clear selection
      setSelectedAddress(null);
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 100 ? 0 : 15;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleCardPayment = async () => {
    if (!order) return;

    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      let finalOrder = order;

      // If this is a temporary order (from cart), create the actual order first
      if (order._id === "temp") {
        setIsCreatingOrder(true);
        const orderItems = cartItemsWithQuantities.map((item) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));

        const response = await createOrderFromCart(orderItems, selectedAddress);
        if (!response.success || !response.order) {
          throw new Error(response.message || "Failed to create order");
        }

        finalOrder = response.order;
        setOrder(finalOrder);

        // Clear cart after successful order creation
        await clearCart();
        setIsCreatingOrder(false);
      }

      // Stripe payment
      const stripeItems: StripeCheckoutItem[] = finalOrder.items.map(
        (item) => ({
          name: item.name,
          description: `Quantity: ${item.quantity}`,
          amount: Math.round(item.price * 100), // Convert to cents
          currency: "usd",
          quantity: item.quantity,
          images: item.image ? [item.image] : undefined,
        })
      );

      // Add shipping and tax as separate line items if applicable
      const shipping = calculateShipping();
      const tax = calculateTax();

      if (shipping > 0) {
        stripeItems.push({
          name: "Shipping",
          description: "Standard shipping",
          amount: Math.round(shipping * 100),
          currency: "usd",
          quantity: 1,
        });
      }

      if (tax > 0) {
        stripeItems.push({
          name: "Tax",
          description: "Sales tax",
          amount: Math.round(tax * 100),
          currency: "usd",
          quantity: 1,
        });
      }

      // Create checkout session
      console.log(
        "Checkout: Creating session with origin:",
        window.location.origin
      );
      const result = await createCheckoutSession({
        items: stripeItems,
        customerEmail: user?.primaryEmailAddress?.emailAddress || "",
        successUrl: `${window.location.origin}/success?orderId=${finalOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout?orderId=${finalOrder._id}`,
        metadata: {
          orderId: finalOrder._id,
          shippingAddress: JSON.stringify(selectedAddress),
        },
      });

      if ("sessionId" in result) {
        console.log("Stripe checkout session:", result);
        if (!result.url) {
          throw new Error("Missing Stripe checkout URL");
        }
        await redirectToCheckout(result.url);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
      setIsCreatingOrder(false);
    }
  };

  const handleCODOrder = async () => {
    if (!order) return;
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    setIsCreatingOrder(true);
    try {
      const orderItems = cartItemsWithQuantities.map((item) => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const response = await createOrderFromCart(orderItems, selectedAddress);
      if (!response.success || !response.order) {
        throw new Error(response.message || "Failed to create order");
      }

      await clearCart();
      toast.success("Order placed successfully with Cash on Delivery!");
      router.push(`/user/orders/${response.order._id}`);
    } catch (error) {
      console.error("Error creating COD order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
      setIsCreatingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      handleCODOrder();
      return;
    }

    handleCardPayment();
  };

  if (loading) {
    return (
      <Container className="py-8">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <span>/</span>
              <Skeleton className="h-4 w-8" />
              <span>/</span>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-2" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-6 w-24 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[{ label: "Cart", href: "/cart" }]}
        currentPage="Checkout"
        showSocialShare={false}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <AddressSelection
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            addresses={addresses}
            onAddressesUpdate={handleAddressesUpdate}
          />

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Details
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index.toString()}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} ×{" "}
                      <PriceFormatter amount={item.price} />
                    </p>
                  </div>

                  <div className="text-right">
                    <PriceFormatter
                      amount={item.price * item.quantity}
                      className="text-base font-semibold text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
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
                  {calculateShipping() === 0 ? (
                    <span className="text-green-600">Free shipping</span>
                  ) : (
                    <PriceFormatter
                      amount={calculateShipping()}
                      className="text-base font-medium text-gray-900"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tax</span>
                <PriceFormatter
                  amount={calculateTax()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              {calculateShipping() === 0 && (
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

            {/* Payment Method Selection */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Select Payment Method
              </h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => {
                  const method = value as "card" | "cod";
                  setPaymentMethod(method);
                }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-babyshopSky bg-babyshopSky/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <RadioGroupItem value="card" id="card-payment" />
                    <CreditCard
                      className={`w-4 h-4 ${
                        paymentMethod === "card"
                          ? "text-babyshopSky"
                          : "text-gray-600"
                      }`}
                    />
                    <Label
                      htmlFor="card-payment"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-sm text-babyshopBlack">
                        Card Payment
                      </div>
                      <div className="text-xs text-babyshopTextLight">
                        Pay securely online
                      </div>
                    </Label>
                    {paymentMethod === "card" && (
                      <CheckCircle className="w-4 h-4 text-babyshopSky" />
                    )}
                  </div>

                </div>

                <div
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-babyshopSky bg-babyshopSky/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <RadioGroupItem value="cod" id="cod-payment" />
                  <Banknote
                    className={`w-4 h-4 ${
                      paymentMethod === "cod"
                        ? "text-babyshopSky"
                        : "text-gray-600"
                    }`}
                  />
                  <Label
                    htmlFor="cod-payment"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-sm text-babyshopBlack">
                      Cash on Delivery
                    </div>
                    <div className="text-xs text-babyshopTextLight">
                      Pay when you receive
                    </div>
                  </Label>
                  {paymentMethod === "cod" && (
                    <CheckCircle className="w-4 h-4 text-babyshopSky" />
                  )}
                </div>
              </RadioGroup>
            </div>

            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={
                processing ||
                isCreatingOrder ||
                !selectedAddress
              }
              className="w-full mt-6 bg-darkColor hover:bg-shop_light_yellow/90 text-white rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Order...
                </>
              ) : !selectedAddress ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Select Address to Continue
                </>
              ) : paymentMethod === "cod" ? (
                <>
                  <Banknote className="w-4 h-4 mr-2" />
                  Place Order (Cash on Delivery)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay with Stripe
                </>
              )}
            </Button>

            {!selectedAddress && (
              <div className="mt-2 text-center">
                <p className="text-sm text-amber-600">
                  Please select a shipping address to proceed
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {paymentMethod === "card"
                  ? "Secure checkout • SSL encrypted • Powered by Stripe"
                  : "Pay cash when your order arrives at your doorstep"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Container>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
};

export default CheckoutPage;
