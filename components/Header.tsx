"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Container from "./Container";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";

const SearchBar = dynamic(() => import("./SearchBar"), {
  ssr: false,
});
const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
});
const HeaderAuth = dynamic(() => import("./header/HeaderAuth"), {
  ssr: false,
});
const HeaderCounters = dynamic(() => import("./header/HeaderCounters"), {
  ssr: false,
});

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 50;
        setIsScrolled((prev) =>
          prev === nextIsScrolled ? prev : nextIsScrolled
        );
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed w-full z-50 shadow-md ${isScrolled ? "bg-white/60 backdrop-blur-lg overflow-visible h-13 transition-all duration-300" : "h-17 bg-shop_light_yellow"}`}
    >
      <Container className="flex items-center justify-between h-15">
        <div className="w-auto md:w-1/3 flex items-center gap-2.5 justify-start md:gap-0">
          <MobileMenu />
          <Logo isScrolled={isScrolled} />
        </div>

        <HeaderMenu isScrolled={isScrolled} />
        <div className="flex md:1/3 items-center justify-end gap-5">
          <div className="flex justify-end w-20">
            <SearchBar isScrolled={isScrolled} />
          </div>
          <HeaderCounters isScrolled={isScrolled} />
          <HeaderAuth isScrolled={isScrolled} />
        </div>
      </Container>
    </header>
  );
};

export default Header;
