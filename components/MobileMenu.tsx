"use client";

import dynamic from "next/dynamic";
import { AlignLeft } from "lucide-react";
import React, { useState } from "react";

const SideMenu = dynamic(() => import("./SideMenu"), {
  ssr: false,
});

const MobileMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <AlignLeft className="hover:text-darkColor text-lightColor hoverEffect md:hidden" />
      </button>
      <div className="md:hidden">
        {isSidebarOpen ? (
          <SideMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        ) : null}
      </div>
    </>
  );
};

export default MobileMenu;
