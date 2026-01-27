import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Crown,
  Check,
  Sparkles,
  Lock,
  LucideIcon,
} from "lucide-react";

interface PremiumFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  icon: Icon,
  title,
  description,
  features,
}) => {
  const handleJavaScriptPurchase = () => {
    window.open("https://buymeacoffee.com/reactbd/e/432469", "_blank");
  };

  const handleTypeScriptPurchase = () => {
    window.open("https://buymeacoffee.com/reactbd/e/493505", "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Icon className="h-20 w-20 text-babyshopSky" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-babyshopRed to-babyshopPurple rounded-full p-2">
                <Crown className="h-8 w-8 text-babyshopWhite" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-babyshopSky to-babyshopPurple bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <p className="text-xl text-muted-foreground">
            Premium Feature - Unlock Full Potential
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-10">
          {/* Premium Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-babyshopSky/10 dark:bg-babyshopSky/20 px-6 py-3 rounded-full border-2 border-babyshopSky">
              <Lock className="h-5 w-5 text-babyshopSky" />
              <span className="font-semibold text-babyshopSky">
                Paid Version Only
              </span>
              <Sparkles className="h-5 w-5 text-babyshopSky" />
            </div>
          </div>

          {/* Description */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features List */}
          <div className="bg-babyshopLightBg dark:bg-card rounded-xl p-8 border">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-babyshopSky" />
              Premium Features Included
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-babyshopWhite dark:bg-card p-4 rounded-lg shadow-sm border"
                >
                  <div className="shrink-0 mt-0.5">
                    <Check className="h-5 w-5 text-babyshopSky" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                Ready to upgrade your business?
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Choose your preferred version and get access to all premium
                features
              </p>
            </div>

            {/* Purchase Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleJavaScriptPurchase}
                  className="bg-gradient-to-r from-babyshopRed to-babyshopPurple hover:opacity-90 text-babyshopWhite font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  JavaScript Version
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  onClick={handleTypeScriptPurchase}
                  className="bg-gradient-to-r from-babyshopSky to-babyshopPurple hover:opacity-90 text-babyshopWhite font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  TypeScript Turbo
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="text-center pt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Visit{" "}
                <a
                  href="https://buymeacoffee.com/reactbd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  reactbd.com
                </a>{" "}
                for more information
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-babyshopRed"></span>
                  JavaScript - Full Project
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-babyshopSky"></span>
                  TypeScript - Turbo Build
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-babyshopSky">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Premium Support
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-babyshopSky">∞</div>
                <div className="text-sm text-muted-foreground">
                  Unlimited Access
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-babyshopSky">100%</div>
                <div className="text-sm text-muted-foreground">
                  Satisfaction Guarantee
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumFeature;
