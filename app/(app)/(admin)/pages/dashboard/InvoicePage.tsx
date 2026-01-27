import React from "react";
import { FileText } from "lucide-react";
import PremiumFeature from "@/components/common/PremiumFeature";

const InvoicePage: React.FC = () => {
  const invoiceFeatures = [
    "Professional invoice generation with custom templates",
    "Automatic invoice numbering system",
    "PDF download and print functionality",
    "Email invoices directly to customers",
    "Share invoices via WhatsApp, Telegram, and social media",
    "Invoice history and tracking",
    "Multiple currency support",
    "Custom branding and company logo",
    "Tax calculations and discounts",
    "Payment status tracking",
  ];

  return (
    <PremiumFeature
      icon={FileText}
      title="Invoice Generator"
      description="The Invoice Generator feature is part of our premium package. Upgrade to unlock professional invoicing capabilities and streamline your business operations."
      features={invoiceFeatures}
    />
  );
};

export default InvoicePage;
