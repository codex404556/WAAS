"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import ProfilePageSkeleton from "@/components/skeleton/ProfilePageSkeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/login");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <ProfilePageSkeleton />;
  }

  if (!userId) {
    return null;
  }

  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
