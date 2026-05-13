"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type PropertyType = "all" | "house" | "office" | "shop";
type PriceRange = "any" | "under300" | "300to700" | "over700";

export type FilterState = {
  type: PropertyType;
  priceRange: PriceRange;
  rooms: string;
  location: string;
};

type TopNavProps = {
  activeTab: "foryou" | "filter";
  onTabChange: (tab: "foryou" | "filter") => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
};

// ── Price range labels ────────────────────────────────────────────────────────
const priceLabels: Record<PriceRange, string> = {
  any: "Any price",
  under300: "Under 300k",
  "300to700": "300k – 700k",
  over700: "700k+",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function TopNav({
  activeTab,
  onTabChange,
  filters,
  onFiltersChange,
  onApplyFilters,
}: TopNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleApply() {
    onApplyFilters();
    setSheetOpen(false);
    onTabChange("foryou");
  }

  function handleReset() {
    onFiltersChange({
      type: "all",
      priceRange: "any",
      rooms: "any",
      location: "",
    });
  }

  const activeFilterCount = [
    filters.type !== "all",
    filters.priceRange !== "any",
    filters.rooms !== "any",
    filters.location !== "",
  ].filter(Boolean).length;

  return (
    <>
      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <span className="text-xl font-bold tracking-tight text-foreground">
              Landlord
            </span>

            {/* ── Mobile: Two Tabs ───────────────────────────────────────── */}
            <div className="flex md:hidden items-center bg-muted rounded-full p-1">
              {/* For You tab */}
              <button
                onClick={() => onTabChange("foryou")}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "foryou"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                For You
              </button>

              {/* Filter tab */}
              <button
                onClick={() => {
                  onTabChange("filter");
                  setSheetOpen(true);
                }}
                className={`relative flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "filter"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <SlidersHorizontal size={13} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Desktop: Category Links + Actions ─────────────────────── */}
            <nav className="hidden md:flex items-center gap-6">
              {(["all", "house", "office", "shop"] as PropertyType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onFiltersChange({ ...filters, type });
                    onApplyFilters();
                  }}
                  className={`text-sm font-medium capitalize transition-colors pb-0.5 ${
                    filters.type === type
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All" : `${type}s`}
                </button>
              ))}
            </nav>

            {/* Desktop right side actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setSheetOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                + Post Listing
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filter Bottom Sheet ─────────────────────────────────────────────── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setSheetOpen(false);
              if (activeTab === "filter") onTabChange("foryou");
            }}
          />

          {/* Sheet */}
          <div className="relative z-10 w-full sm:max-w-md mx-0 sm:mx-4 bg-background rounded-t-3xl sm:rounded-2xl shadow-xl border border-border">

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Filter listings
              </h2>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-primary font-medium"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => {
                    setSheetOpen(false);
                    if (activeTab === "filter") onTabChange("foryou");
                  }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sheet Body */}
            <div className="px-5 py-5 space-y-6">

              {/* Property Type */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Property type
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(["all", "house", "office", "shop"] as PropertyType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onFiltersChange({ ...filters, type })}
                      className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        filters.type === type
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {type === "all" ? "All" : `${type}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Monthly price (UGX)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(priceLabels) as PriceRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => onFiltersChange({ ...filters, priceRange: range })}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filters.priceRange === range
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {priceLabels[range]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rooms */}
              {(filters.type === "house" || filters.type === "all") && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Bedrooms
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {["any", "1", "2", "3+"].map((room) => (
                      <button
                        key={room}
                        onClick={() => onFiltersChange({ ...filters, rooms: room })}
                        className={`py-2 rounded-xl text-sm font-medium transition-all ${
                          filters.rooms === room
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {room === "any" ? "Any" : room}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Location
                </p>
                <input
                  type="text"
                  placeholder="e.g. Ntinda, Kisaasi, Kololo..."
                  value={filters.location}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all border border-transparent focus:border-border"
                />
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="px-5 pb-8 pt-2">
              <button
                onClick={handleApply}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all"
              >
                Show listings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}