"use client";

import {
  User,
  ShoppingBag,
  UserCircle,
  Heart,
  Settings,
  LogOut,
  Package,
  Bell,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const UserButton = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <span className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // If not authenticated, show the sign-in link
  if (!isSignedIn || !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
      >
        <User size={30} />
        <span>
          <p className="text-xs font-medium">Welcome</p>
          <p className="font-semibold text-sm">Sign in / Register</p>
        </span>
      </Link>
    );
  }

  // If authenticated, show dropdown menu
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={(e) => {
            const relatedTarget = e.relatedTarget as HTMLElement | null;
            if (
              !relatedTarget ||
              !relatedTarget.closest('[data-slot="popover-content"]')
            ) {
              setOpen(false);
            }
          }}
        >
          <span className="w-10 h-10 border rounded-full p-1 group-hover:border-babyshopSky hoverEffect">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "userImage"}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
                {(user.fullName || user.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </span>
          <span className="text-left">
            <p className="text-xs font-medium">Welcome</p>
            <p className="font-semibold text-sm">
              {user.firstName || "My Profile"}
            </p>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-2"
        align="end"
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-1">
          {/* User Info Header */}
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-gray-900">
              {user.fullName || user.username}
            </p>
            <p className="text-xs text-gray-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <Separator />

          {/* Menu Items */}
          <div className="py-1 space-y-1">
            <Link
              href="/user/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              <span>My Profile</span>
            </Link>

            <Link
              href="/user/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <Link
              href="/user/wishlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/user/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>

            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              href="/user/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>

          <Separator />

          {/* Logout Button */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserButton;
