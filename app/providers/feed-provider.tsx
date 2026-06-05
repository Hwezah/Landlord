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

export type RoomType =
  | "any"
  | "single_room"
  | "double_room"
  | "self_contained"
  | "studio_room"
  | "flat"
  | "bungalow"
  | "maisonette"
  | "airbnb";

export type ShopType = "any" | "whole_shop" | "stall";

export type FilterState = {
  type: PropertyType;
  priceRange: PriceRange;
  roomType: RoomType;
  shopType: ShopType;
  location: string;
};

type ActiveTab = "foryou" | "nearby" | "saved";

type FeedContextValue = {
  listings: Listing[];
  filteredListings: Listing[];
  locations: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  currentPhoto: number;
  setCurrentPhoto: (index: number) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  appliedFilters: FilterState;
  applyFilters: (nextFilters?: FilterState) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;
  savedIds: Set<string>;
  toggleSave: (listingId: string) => Promise<void>;
  userLocation: LatLng | null;
};

// ── Defaults ──────────────────────────────────────────────────────────────────
const defaultFilters: FilterState = {
  type: "all",
  priceRange: "any",
  roomType: "any",
  shopType: "any",
  location: "",
};

const KAMPALA: LatLng = { lat: 0.3476, lng: 32.5825 };

// ── Fuzzy location matching ───────────────────────────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function locationMatches(locationName: string, query: string): boolean {
  if (!query) return true;
  const locNorm = normalize(locationName);
  const queryNorm = normalize(query);
  if (locNorm.includes(queryNorm)) return true;
  const queryTokens = queryNorm.split(" ").filter(Boolean);
  const locTokens = locNorm.split(" ").filter(Boolean);
  return queryTokens.every((qToken) =>
    locTokens.some((lToken) => {
      if (lToken.includes(qToken) || qToken.includes(lToken)) return true;
      const maxDist = qToken.length <= 4 ? 0 : qToken.length <= 6 ? 1 : 2;
      return levenshtein(qToken, lToken) <= maxDist;
    }),
  );
}

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371;
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
  locations = [],
}: {
  children: ReactNode;
  listings: Listing[];
  locations?: string[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("foryou");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(defaultFilters);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { savedIds, toggleSave } = useSavedListings();
  const { location, permissionStatus } = useLocation();

  const userLocation: LatLng =
    permissionStatus === "granted" && location ? location : KAMPALA;

  const applyFilters = useCallback(
    (nextFilters?: FilterState) => {
      setAppliedFilters(nextFilters ?? filters);
      setCurrentIndex(0);
      setCurrentPhoto(0);
    },
    [filters],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, []);

  const handleSetActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentIndex(0);
    setCurrentPhoto(0);
  }, []);

  // ── Filtered listings ──────────────────────────────────────────────────────
  const filteredListings = useMemo(() => {
    let result = listings.filter((listing) => {
      // Type
      if (appliedFilters.type !== "all" && listing.type !== appliedFilters.type)
        return false;

      // Price
      if (appliedFilters.priceRange !== "any") {
        if (appliedFilters.priceRange === "under300" && listing.price >= 300000)
          return false;
        if (
          appliedFilters.priceRange === "300to700" &&
          (listing.price < 300000 || listing.price > 700000)
        )
          return false;
        if (appliedFilters.priceRange === "over700" && listing.price <= 700000)
          return false;
      }

      // Room type — only applies when type is house (or all)
      if (appliedFilters.roomType !== "any" && listing.type === "house") {
        if (listing.room_type !== appliedFilters.roomType) return false;
      }

      // Shop type — only applies when type is shop (or all)
      if (appliedFilters.shopType !== "any" && listing.type === "shop") {
        if (listing.shop_type !== appliedFilters.shopType) return false;
      }

      // Location — fuzzy match
      if (appliedFilters.location !== "") {
        if (!locationMatches(listing.location_name, appliedFilters.location))
          return false;
      }

      return true;
    });

    if (activeTab === "saved") {
      result = result.filter((listing) => savedIds.has(listing.id));
    } else if (activeTab === "nearby") {
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

  const activeFilterCount = [
    appliedFilters.type !== "all",
    appliedFilters.priceRange !== "any",
    appliedFilters.roomType !== "any",
    appliedFilters.shopType !== "any",
    appliedFilters.location !== "",
  ].filter(Boolean).length;

  return (
    <FeedContext.Provider
      value={{
        listings,
        filteredListings,
        locations,
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
  if (!ctx) throw new Error("useFeed must be used within a FeedProvider");
  return ctx;
}

export function useFeedOptional() {
  return useContext(FeedContext);
}
