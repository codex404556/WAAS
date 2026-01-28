"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
  href?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
  href,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden relative flex justify-between", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
      {href && (
        <Link
          href={href}
          className="absolute inset-0"
          aria-label={`View ${title} details`}
        />
      )}
    </Card>
  );
}
