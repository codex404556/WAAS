"use client";

import dynamic from "next/dynamic";
import { AlignLeft } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence } from "motion/react";

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
        <AnimatePresence>
          {isSidebarOpen ? (
            <SideMenu
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MobileMenu;
