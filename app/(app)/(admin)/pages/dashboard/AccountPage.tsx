import React from "react";
import { TrendingUp } from "lucide-react";
import PremiumFeature from "@/components/common/PremiumFeature";

const AccountPage: React.FC = () => {
  const accountFeatures = [
    "Advanced analytics and business insights dashboard",
    "Real-time sales tracking and revenue monitoring",
    "Comprehensive order management system",
    "User behavior analytics and patterns",
    "Inventory alerts and stock management",
    "Best-selling products analysis",
    "Monthly revenue trends and forecasting",
    "Order status breakdown and reporting",
    "Low stock and out-of-stock notifications",
    "Stale products identification and alerts",
    "Customer purchase history tracking",
    "Export reports to Excel/PDF formats",
  ];

  return (
    <PremiumFeature
      icon={TrendingUp}
      title="Analytics Dashboard"
      description="The Analytics Dashboard is part of our premium package. Get comprehensive insights into your business performance with advanced analytics, real-time tracking, and detailed reporting features."
      features={accountFeatures}
    />
  );
};

export default AccountPage;
