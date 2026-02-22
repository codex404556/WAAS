"use client";

import { ClerkLoaded, SignedIn, SignedOut } from "@clerk/nextjs";
import SignIn from "../SignIn";
import UserButton from "./UserButton";

interface HeaderAuthProps {
  isScrolled: boolean;
}

const HeaderAuth = ({ isScrolled }: HeaderAuthProps) => {
  return (
    <ClerkLoaded>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignIn isScrolled={isScrolled} />
      </SignedOut>
    </ClerkLoaded>
  );
};

export default HeaderAuth;
