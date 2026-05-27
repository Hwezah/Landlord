"use client";

import TopNavMobile from "@/app/_components/TopNavMobile";
import BottomNavMobile from "@/app/_components/BottomNavMobile";
import Feed from "@/app/_components/Feed";

export default function HomeClient() {
  return (
    <div className="relative h-screen flex flex-col overflow-hidden">

      {/* Desktop only */}
      <div className="hidden md:block">
        <TopNavMobile />
      </div>

      <Feed />

      {/* All devices */}
      <BottomNavMobile />
    </div>
  );
}