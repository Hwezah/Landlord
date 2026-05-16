"use client";

import { useState } from "react";
import TopNav from "@/app/_components/TopNavMobile";
import type { FilterState } from "@/app/_components/TopNavMobile";
import BottomNavMobile from "@/app/_components/BottomNavMobile";
import { ModeToggle } from "@/components/ui/modeToggle";
import type { Listing } from "@/app/actions/listings";

const defaultFilters: FilterState = {
  type: "all",
  priceRange: "any",
  rooms: "any",
  location: "",
};

export default function HomeClient({ listings }: { listings: Listing[] }) {
  const [activeTab, setActiveTab] = useState<"foryou" | "nearby">("foryou");
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

        {/* Temporary — confirm data is coming through */}
        <div className="p-4">
          <p className="text-foreground font-semibold mb-4">
            {listings.length} listings found
          </p>
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="mb-4 p-4 rounded-xl bg-card border border-border"
            >
              <p className="text-foreground font-bold">{listing.title}</p>
              <p className="text-muted-foreground text-sm">{listing.location_name}</p>
              <p className="text-foreground text-sm">
                UGX {listing.price.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm">
                {listing.photos.length} photos
              </p>
            </div>
          ))}
        </div>
      </main>

      <BottomNavMobile />

      <div className="fixed bottom-40 right-6 z-10">
        <ModeToggle />
      </div>
    </div>
  );
}