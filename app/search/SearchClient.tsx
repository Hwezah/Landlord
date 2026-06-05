// app/search/SearchClient.tsx
"use client";

import BottomNavMobile from "@/app/_components/BottomNavMobile";
import type { Listing } from "@/app/actions/listings";
import { useFeed } from "@/app/providers/feed-provider";
import {
  filterListings,
  groupResultsByLocation,
  POPULAR_SEARCHES,
} from "@/lib/search/listings-search";
import { ArrowLeft, Heart, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SearchClient() {
  const router = useRouter();
  const { listings, savedIds, toggleSave } = useFeed();
  const [query, setQuery] = useState("");

  // Filter then group by location
  const groups = useMemo(() => {
    const filtered = filterListings(listings, query);
    return groupResultsByLocation(filtered);
  }, [query, listings]);

  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 h-11">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Ntinda, double room, under 500k…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground text-xs hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Popular searches (shown when input is empty) ── */}
      {!query && (
        <div className="px-4 py-6">
          <h2 className="text-base font-semibold mb-3 text-muted-foreground">
            Popular searches
          </h2>
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

      {/* ── Results ── */}
      {query.trim() && (
        <div className="pb-32">
          {/* Total count */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-muted-foreground">
              {totalCount === 0
                ? `No results for "${query}"`
                : `${totalCount} listing${totalCount === 1 ? "" : "s"} found`}
            </p>
          </div>

          {/* No results */}
          {totalCount === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12 px-4">
              Try a nearby area or check your spelling.
            </p>
          )}

          {/* Location groups */}
          {groups.map(({ location, items }) => (
            <section key={location} className="mt-6">
              {/* Section header */}
              <div className="px-4 mb-3 flex items-center gap-2">
                {/* <MapPin size={13} className="text-orange-400 shrink-0" strokeWidth={2.5} /> */}
                <h3 className="text-sm md:text-[22px] font-semibold text-foreground">
                  Available in {location}
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {items.length} listing{items.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Cards row — wraps to next line */}
              <div className="px-4 flex flex-wrap gap-3">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isSaved={savedIds.has(listing.id)}
                    onSave={() => toggleSave(listing.id)}
                    onClick={() => router.push(`/listing/${listing.id}`)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BottomNavMobile />
    </div>
  );
}

// ── Card — identical to CompactCard in Feed ───────────────────────────────────
function ListingCard({
  listing,
  isSaved,
  onSave,
  onClick,
}: {
  listing: Listing;
  isSaved: boolean;
  onSave: () => void;
  onClick: () => void;
}) {
  const photo = listing.photos[0];

  return (
    <div
      onClick={onClick}
      className="w-44 sm:w-48 md:w-56 flex-shrink-0 cursor-pointer"
    >
      {/* Square photo */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-square">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="200px"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-950 text-4xl text-white/20">
            🏠
          </div>
        )}

        {/* Save heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="absolute top-2 right-2 z-10 h-9 w-9 flex items-center justify-center"
          aria-label="Save listing"
        >
          <Heart
            size={24}
            strokeWidth={1.5}
            className={
              isSaved
                ? "fill-emerald-500 text-emerald-500"
                : "fill-black/40 text-white"
            }
          />
        </button>
      </div>

      {/* Text */}
      <div className="mt-2">
        <h4 className="text-sm font-semibold text-foreground line-clamp-2">
          {listing.title}
        </h4>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1 line-clamp-1">
          {listing.location_name}
        </p>
        <p className="text-xs text-muted-foreground font-normal mt-2">
          UGX {listing.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
