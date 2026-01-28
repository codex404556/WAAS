"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import DashHeader from "@/components/dashboard/DashHeader";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/dashboard/SideBar";

type DashboardAppProps = {
  children: ReactNode;
};

function DashboardApp({ children }: DashboardAppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <DashHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardApp;
