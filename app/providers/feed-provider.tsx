"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Listing } from "@/app/actions/listings";
import { useSavedListings } from "@/hooks/use-saved-listings";
import { useLocation, type LatLng } from "@/app/_components/LocationProvider";

// ── Types ────────────────────────────────────────────────────────────────────
export type PropertyType = "all" | "house" | "office" | "shop";
export type PriceRange = "any" | "under300" | "300to700" | "over700";

export type FilterState = {
  type: PropertyType;
  priceRange: PriceRange;
  rooms: string;
  location: string;
};

type ActiveTab = "foryou" | "nearby" | "saved";

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
  applyFilters: (nextFilters?: FilterState) => void;
  resetFilters: () => void;
  activeFilterCount: number;

  // Detail sheet
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;

  // Filter sheet
  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;

  // Saved listings
  savedIds: Set<string>;
  toggleSave: (listingId: string) => Promise<void>;

  // Location (for distance badge in Feed)
  userLocation: LatLng | null;
};

// ── Defaults ─────────────────────────────────────────────────────────────────
const defaultFilters: FilterState = {
  type: "all",
  priceRange: "any",
  rooms: "any",
  location: "",
};

// Kampala fallback coords — used when user denies location
const KAMPALA: LatLng = { lat: 0.3476, lng: 32.5825 };

// ── Haversine formula ─────────────────────────────────────────────────────────
// Returns distance in kilometres between two lat/lng points.
// This is the standard formula for great-circle distance on a sphere.
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const a2 =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

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

  const { savedIds, toggleSave } = useSavedListings();
  const { location, permissionStatus } = useLocation();

  // Use real location if granted, otherwise fall back to Kampala
  const userLocation: LatLng =
    permissionStatus === "granted" && location ? location : KAMPALA;

  // ── Apply filters ──────────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (nextFilters?: FilterState) => {
      setAppliedFilters(nextFilters ?? filters);
      setCurrentIndex(0);
      setCurrentPhoto(0);
    },
    [filters],
  );

  // ── Reset filters ──────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, []);

  // ── Handle tab changes — reset index when switching tabs ───────────────────
  const handleSetActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, []);

  // ── Build filtered + sorted listings ──────────────────────────────────────
  const filteredListings = useMemo(() => {
    // Step 1: apply search/filter criteria
    let result = listings.filter((listing) => {
      if (appliedFilters.type !== "all" && listing.type !== appliedFilters.type) {
        return false;
      }
      if (appliedFilters.priceRange !== "any") {
        if (appliedFilters.priceRange === "under300" && listing.price >= 300000) return false;
        if (appliedFilters.priceRange === "300to700" && (listing.price < 300000 || listing.price > 700000)) return false;
        if (appliedFilters.priceRange === "over700" && listing.price <= 700000) return false;
      }
      if (appliedFilters.rooms !== "any") {
        if (appliedFilters.rooms === "3+" && (listing.rooms ?? 0) < 3) return false;
        if (appliedFilters.rooms !== "3+" && listing.rooms !== parseInt(appliedFilters.rooms)) return false;
      }
      if (appliedFilters.location !== "") {
        const query = appliedFilters.location.toLowerCase();
        if (!listing.location_name.toLowerCase().includes(query)) return false;
      }
      return true;
    });

    // Step 2: tab-specific logic
    if (activeTab === "saved") {
      // Only listings this session has saved
      result = result.filter((listing) => savedIds.has(listing.id));
    } else if (activeTab === "nearby") {
      // Only listings that have coordinates, sorted nearest-first
      result = result
        .filter((l) => l.latitude !== null && l.longitude !== null)
        .sort((a, b) => {
          const distA = haversine(userLocation, {
            lat: a.latitude!,
            lng: a.longitude!,
          });
          const distB = haversine(userLocation, {
            lat: b.latitude!,
            lng: b.longitude!,
          });
          return distA - distB;
        });
    }

    return result;
  }, [listings, appliedFilters, activeTab, savedIds, userLocation]);

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
        setActiveTab: handleSetActiveTab,
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
        savedIds,
        toggleSave,
        userLocation,
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

export function useFeedOptional() {
  return useContext(FeedContext);
}
