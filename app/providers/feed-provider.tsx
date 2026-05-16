"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Listing } from "@/app/actions/listings";

// ── Types ────────────────────────────────────────────────────────────────────
export type PropertyType = "all" | "house" | "office" | "shop";
export type PriceRange = "any" | "under300" | "300to700" | "over700";

export type FilterState = {
  type: PropertyType;
  priceRange: PriceRange;
  rooms: string;
  location: string;
};

type ActiveTab = "foryou" | "nearby";

type FeedContextValue = {
  // Listings
  listings: Listing[];
  filteredListings: Listing[];

  // Active listing index for feed
  currentIndex: number;
  setCurrentIndex: (index: number) => void;

  // Current photo index per listing
  currentPhoto: number;
  setCurrentPhoto: (index: number) => void;

  // Tabs
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  appliedFilters: FilterState;
  applyFilters: () => void;
  resetFilters: () => void;
  activeFilterCount: number;

  // Detail sheet
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;

  // Filter sheet
  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;
};

// ── Defaults ─────────────────────────────────────────────────────────────────
const defaultFilters: FilterState = {
  type: "all",
  priceRange: "any",
  rooms: "any",
  location: "",
};

// ── Context ───────────────────────────────────────────────────────────────────
const FeedContext = createContext<FeedContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function FeedProvider({
  children,
  listings,
}: {
  children: ReactNode;
  listings: Listing[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("foryou");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, [filters]);

  // ── Reset filters ──────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, []);

  // ── Filter listings based on applied filters ───────────────────────────────
  const filteredListings = listings.filter((listing) => {
    // Type filter
    if (appliedFilters.type !== "all" && listing.type !== appliedFilters.type) {
      return false;
    }

    // Price filter
    if (appliedFilters.priceRange !== "any") {
      if (appliedFilters.priceRange === "under300" && listing.price >= 300000) return false;
      if (appliedFilters.priceRange === "300to700" && (listing.price < 300000 || listing.price > 700000)) return false;
      if (appliedFilters.priceRange === "over700" && listing.price <= 700000) return false;
    }

    // Rooms filter
    if (appliedFilters.rooms !== "any") {
      if (appliedFilters.rooms === "3+" && (listing.rooms ?? 0) < 3) return false;
      if (appliedFilters.rooms !== "3+" && listing.rooms !== parseInt(appliedFilters.rooms)) return false;
    }

    // Location filter
    if (appliedFilters.location !== "") {
      const query = appliedFilters.location.toLowerCase();
      if (!listing.location_name.toLowerCase().includes(query)) return false;
    }

    return true;
  });

  // ── Active filter count ────────────────────────────────────────────────────
  const activeFilterCount = [
    appliedFilters.type !== "all",
    appliedFilters.priceRange !== "any",
    appliedFilters.rooms !== "any",
    appliedFilters.location !== "",
  ].filter(Boolean).length;

  return (
    <FeedContext.Provider
      value={{
        listings,
        filteredListings,
        currentIndex,
        setCurrentIndex,
        currentPhoto,
        setCurrentPhoto,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        appliedFilters,
        applyFilters,
        resetFilters,
        activeFilterCount,
        detailOpen,
        setDetailOpen,
        filterSheetOpen,
        setFilterSheetOpen,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return ctx;
}