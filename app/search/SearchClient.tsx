"use client";

import { useMemo, useState } from "react";
import { Search, ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFeed } from "@/app/providers/feed-provider";
import {
  filterListings,
  POPULAR_SEARCHES,
} from "@/lib/search/listings-search";
import Image from "next/image";
import BottomNavMobile from "@/app/_components/BottomNavMobile";

export default function SearchClient() {
  const router = useRouter();
  const { listings } = useFeed();

  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterListings(listings, query),
    [query, listings]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 h-11">
            <Search size={18} className="text-muted-foreground" />

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Ntinda, double room, under 500k, Airbnb..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Empty */}
      {!query && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold mb-4">Popular Searches</h2>

          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-accent transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4 space-y-3 pb-32">
        {query.trim() && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No listings match &ldquo;{query}&rdquo;. Try a nearby area or check
            your spelling.
          </p>
        )}

        {filtered.map((listing) => (
          <div
            key={listing.id}
            className="flex gap-3 rounded-2xl bg-muted/40 border border-border overflow-hidden"
          >
            <div className="relative w-28 h-28 shrink-0">
              <Image
                src={listing.photos?.[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 p-3">
              <h3 className="font-semibold line-clamp-1">{listing.title}</h3>

              <div className="flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-orange-400 shrink-0" />

                <span className="text-muted-foreground text-xs line-clamp-1">
                  {listing.location_name}
                </span>
              </div>

              <p className="mt-3 font-bold">
                UGX {listing.price.toLocaleString()}
              </p>

              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {listing.type}
              </p>
            </div>
          </div>
        ))}
      </div>

      <BottomNavMobile />
    </div>
  );
}
