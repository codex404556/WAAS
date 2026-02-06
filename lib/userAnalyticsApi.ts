import { payloadFetch } from "@/lib/payload-client";

export type UserAnalyticsOverview = {
  overview: {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    paidAmount: number;
    avgOrderValue: number;
    totalItems: number;
  };
  spendingByStatus: Array<{
    _id: string;
    orderCount: number;
    totalAmount: number;
  }>;
  favoriteCategories: Array<{
    _id: string;
    totalSpent: number;
    orderCount: number;
    itemCount: number;
  }>;
};

export type MonthlySpending = {
  monthlySpending: Array<{
    month: string;
    monthName: string;
    totalSpent: number;
    paidAmount: number;
  }>;
};

export type ProductPreferences = {
  mostPurchasedProducts: Array<{
    _id: string;
    productName: string;
    category: string;
    productImage: string;
    totalQuantity: number;
    totalSpent: number;
    avgPrice: number;
    orderCount: number;
  }>;
};

type UserAnalyticsResponse = {
  overview: UserAnalyticsOverview;
  monthlySpending: MonthlySpending;
  preferences: ProductPreferences;
};

const fetchUserAnalytics = async () =>
  payloadFetch<UserAnalyticsResponse>("/api/user-analytics");

export const getUserAnalyticsOverview = async () =>
  (await fetchUserAnalytics()).overview;

export const getUserMonthlySpending = async (months = 12) => {
  const data = await fetchUserAnalytics();
  if (months <= 0) return { monthlySpending: [] };
  const sliceStart = Math.max(
    0,
    data.monthlySpending.monthlySpending.length - months
  );
  return {
    monthlySpending: data.monthlySpending.monthlySpending.slice(sliceStart),
  };
};

export const getUserProductPreferences = async () =>
  (await fetchUserAnalytics()).preferences;
