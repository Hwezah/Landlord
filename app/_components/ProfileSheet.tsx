"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/app/providers/auth-provider";
import { LogOut, User, ChevronRight, Heart, Home } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProfileSheet({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.display_name as string | undefined;
  const email = user?.email;

  // Avatar initials fallback
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (email?.[0]?.toUpperCase() ?? "U");

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  // Settings menu items — easy to extend later
  const menuItems = [
    { icon: Home, label: "My Listings", onClick: () => {} },
    { icon: Heart, label: "Saved Properties", onClick: () => {} },
  ];

  const content = (
    <div className="flex flex-col gap-4 pb-6">
      {/* Avatar + user info */}
      <div className="flex items-center gap-4 px-1 py-4 border-b border-border">
        <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base truncate">
            {displayName ?? "User"}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {email}
          </span>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        {menuItems.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted transition-colors text-left w-full"
          >
            <Icon size={18} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div className="mt-auto pt-2 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-destructive/10 transition-colors text-left w-full text-destructive"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl px-6 pt-6"
          style={{ maxHeight: "80vh" }}
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="text-xl font-bold">Account</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[380px] rounded-3xl px-8 py-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">Account</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
