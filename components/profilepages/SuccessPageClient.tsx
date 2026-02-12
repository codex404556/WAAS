"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
  Calendar,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getOrderById, type Order } from "@/lib/orderApi";
import PriceFormatter from "@/components/common/PriceFormatter";
import Container from "@/components/common/Container";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/store/useCartStore";
import useStore from "@/store";

const SuccessPageClient = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasClearedCart, setHasClearedCart] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { clearCart } = useCartStore();
  const hasHydrated = useStore((state) => state.hasHydrated);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    if (!orderId) {
      router.push("/user/orders");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!orderId || !order || hasClearedCart) return;

    const isPaid = order.paymentStatus === "paid" || order.status === "paid";
    if (isPaid) return;

    let attempts = 0;
    const maxAttempts = 30; // 60 seconds total at 2s interval
    setIsPollingPayment(true);

    const intervalId = window.setInterval(async () => {
      attempts += 1;
      try {
        const latestOrder = await getOrderById(orderId);
        if (!latestOrder) return;

        setOrder(latestOrder);
        const latestPaid =
          latestOrder.paymentStatus === "paid" || latestOrder.status === "paid";
        if (latestPaid || attempts >= maxAttempts) {
          window.clearInterval(intervalId);
          setIsPollingPayment(false);
        }
      } catch {
        if (attempts >= maxAttempts) {
          window.clearInterval(intervalId);
          setIsPollingPayment(false);
        }
      }
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
      setIsPollingPayment(false);
    };
  }, [orderId, order, hasClearedCart]);

  useEffect(() => {
    // Show success toast when component mounts
    if (!loading) {
      toast.success("Payment completed successfully!");
    }
  }, [loading]);

  useEffect(() => {
    const clearCartAfterPaidOrder = async () => {
      if (hasClearedCart || !order || !hasHydrated) return;
      const isPaid = order.paymentStatus === "paid" || order.status === "paid";
      if (!isPaid) return;

      console.info("[success-page] Clearing cart for paid order", {
        orderId: order._id,
      });
      await clearCart();
      setHasClearedCart(true);
    };

    clearCartAfterPaidOrder();
  }, [order, clearCart, hasClearedCart, hasHydrated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container className="py-8">
        <PageBreadcrumb
          items={[{ label: "Checkout", href: "/checkout" }]}
          currentPage="Success"
          showSocialShare={false}
        />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadcrumb
        items={[{ label: "Checkout", href: "/checkout" }]}
        currentPage="Success"
        showSocialShare={false}
      />

      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-12 text-center mb-8">
          <div className="relative">
            {/* Animated Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-14 h-14 text-white animate-pulse" />
            </div>

            {/* Celebration Animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-100"></div>
              <div className="absolute top-10 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute top-5 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-500"></div>
              <div className="absolute top-12 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-700"></div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
            Payment Successful! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-8 animate-fade-in delay-100">
            Thank you for your purchase. Your order has been confirmed and is
            being processed.
          </p>

          {isPollingPayment && (
            <p className="text-sm text-gray-500 mb-6">
              Verifying payment confirmation...
            </p>
          )}

          {order && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 animate-fade-in delay-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Order ID</span>
                  </div>
                  <p className="font-mono text-lg font-bold text-gray-900">
                    #{String(order._id || "").slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Order Date</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Payment Status</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {order.paymentStatus === "paid" || order.status === "paid" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-600">
                          Paid
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="font-semibold text-yellow-600">
                          Processing
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Total Paid</span>
                  </div>
                  <PriceFormatter
                    amount={order.total}
                    className="text-2xl font-bold text-green-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
            <Link href="/user/orders">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                <Package className="w-5 h-5 mr-2" />
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/shop">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-full transition-all transform hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-gray-100 px-8 py-3 rounded-full transition-all"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in delay-400">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
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
                      className="font-semibold text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    Total Paid:
                  </span>
                  <PriceFormatter
                    amount={order.total}
                    className="text-2xl font-bold text-green-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What&apos;s Next Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 md:p-8 mt-8 animate-fade-in delay-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            What happens next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Order Confirmation
              </h4>
              <p className="text-sm text-gray-600">
                You&apos;ll receive an email confirmation with your order
                details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Processing</h4>
              <p className="text-sm text-gray-600">
                Our team will carefully prepare your order for shipping
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Shipping</h4>
              <p className="text-sm text-gray-600">
                Track your package as it makes its way to your door
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </Container>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center">
              <div className="animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          </div>
        </Container>
      }
    >
      <SuccessPageClient />
    </Suspense>
  );
};

export default SuccessPage;
