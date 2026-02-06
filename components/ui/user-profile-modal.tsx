"use client";

import { ClerkLoaded, SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
};

const UserProfileModal = ({
  open,
  onOpenChange,
  title = "Account",
}: UserProfileModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        <ClerkLoaded>
          <SignedIn>
            <div className="min-h-[500px]">
              <UserProfile />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="text-center text-sm text-gray-600">
              You need to sign in to manage your profile.
            </div>
          </SignedOut>
        </ClerkLoaded>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
