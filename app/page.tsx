"use client";
import BottomNavMobile from "./_components/BottomNavMobile";
import { ModeToggle } from "@/components/ui/modeToggle";
import { useState } from "react";
import TopNav, { type FilterState } from "@/app/_components/TopNavMobile";

const defaultFilters: FilterState = {
  type: "all",
  priceRange: "any",
  rooms: "any",
  location: "",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"foryou" | "filter">("foryou");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

  function handleApplyFilters() {
    setAppliedFilters(filters);
  }
  return (
    <div className="relative h-screen flex flex-col">
      <main className="flex-1">
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
      />
      </main>

      <BottomNavMobile />

      <div className="fixed bottom-40 right-6 z-10">
        <ModeToggle />
      </div>
    </div>
  );
}