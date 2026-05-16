"use client";

import TopNavMobile from "@/app/_components/TopNavMobile";
import BottomNavMobile from "@/app/_components/BottomNavMobile";
import { ModeToggle } from "@/components/ui/modeToggle";
import { useFeed } from "@/app/providers/feed-provider";

export default function HomeClient() {
  const { filteredListings } = useFeed();

  return (
    <div className="relative h-screen flex flex-col">
      <main className="flex-1">
        <TopNavMobile />

        {/* Temporary — confirm filtered data */}
        <div className="p-4">
          <p className="text-foreground font-semibold mb-4">
            {filteredListings.length} listings found
          </p>
          {filteredListings.map((listing) => (
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