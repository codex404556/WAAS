"use client";

import Logo from "./Logo";
import { X } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import SocialMedia from "./SocialMedia";
import { useOutsideClick } from "@/hooks";
import { motion, useReducedMotion } from "motion/react";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu = ({ isOpen, onClose }: Props) => {
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const shouldReduceMotion = useReducedMotion();

  const overlayTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.2 };
  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 320, damping: 30 };
  const listTransition = shouldReduceMotion
    ? { staggerChildren: 0, delayChildren: 0 }
    : { staggerChildren: 0.05, delayChildren: 0.08 };

  return (
    <motion.div
      key="mobile-side-menu"
      data-open={isOpen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayTransition}
      className="fixed inset-y-0 left-0 z-50 h-screen w-full bg-black/80 text-white shadow-xl"
    >
      <motion.div
        ref={sidebarRef}
        initial={shouldReduceMotion ? { opacity: 1 } : { x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { x: -24, opacity: 0 }}
        transition={panelTransition}
        className="flex h-screen min-w-72 max-w-96 flex-col gap-6 border-r border-r-shop_dark_yellow bg-black p-10"
      >
        <div className="flex item-center justify-between">
          <Logo className="text-white" />
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: listTransition,
            },
          }}
          className="flex flex-col gap-5 font-semibold traking-wide"
        >
          {headerData?.map((item) => (
            <motion.div
              key={item?.title}
              variants={{
                hidden: {
                  opacity: shouldReduceMotion ? 1 : 0,
                  x: shouldReduceMotion ? 0 : -8,
                },
                show: { opacity: 1, x: 0 },
              }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              <Link className="" onClick={() => onClose()} href={item?.href}>
                {item?.title}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <SocialMedia />
      </motion.div>
    </motion.div>
  );
};

export default SideMenu;
