"use client";

import type {
  PriceRange,
  PropertyType,
  RoomType,
  ShopType,
} from "@/app/providers/feed-provider";
import { useFeed } from "@/app/providers/feed-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// ── Labels ────────────────────────────────────────────────────────────────────

const priceLabels: Record<PriceRange, string> = {
  any: "Any price",
  under300: "Under 300k",
  "300to700": "300k – 700k",
  over700: "700k+",
};

const ROOM_TYPE_OPTIONS: { value: RoomType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "single_room", label: "Single Room" },
  { value: "double_room", label: "Double Room" },
  { value: "self_contained", label: "Self-Contained" },
  { value: "studio_room", label: "Studio Room" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "maisonette", label: "Maisonette" },
  { value: "airbnb", label: "Airbnb" },
];

const SHOP_TYPE_OPTIONS: { value: ShopType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "whole_shop", label: "Whole Shop" },
  { value: "stall", label: "Stall / Subrent" },
];

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        selected
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Filter content ────────────────────────────────────────────────────────────
function FilterContent({ onApply }: { onApply: () => void }) {
  const {
    filters,
    setFilters,
    appliedFilters,
    resetFilters,
    activeFilterCount,
  } = useFeed();

  return (
    <div className="space-y-5">
      {/* ── Property Type ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Property type
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(["all", "house", "office", "shop"] as PropertyType[]).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    type,
                    // Reset sub-type filters when switching property type
                    roomType: "any",
                    shopType: "any",
                  })
                }
                className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filters.type === type
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {type === "all" ? "All" : `${type}s`}
              </button>
            ),
          )}
        </div>
        {filters.type !== appliedFilters.type && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Hit &quot;Show listings&quot; to apply
          </p>
        )}
      </div>

      {/* ── Room Type — shown when House or All is selected ────────────────── */}
      {(filters.type === "house" || filters.type === "all") && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Room type</p>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPE_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                selected={filters.roomType === value}
                onClick={() => setFilters({ ...filters, roomType: value })}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Shop Type — shown when Shop or All is selected ─────────────────── */}
      {(filters.type === "shop" || filters.type === "all") && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Shop type</p>
          <div className="flex flex-wrap gap-2">
            {SHOP_TYPE_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                selected={filters.shopType === value}
                onClick={() => setFilters({ ...filters, shopType: value })}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Price Range ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Monthly price (UGX)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(priceLabels) as PriceRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setFilters({ ...filters, priceRange: range })}
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

      {/* ── Location ───────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Location</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
          }}
          className="contents"
        >
          <Input
            type="search"
            inputMode="search"
            placeholder="e.g. Ntinda, Kisaasi, Kololo..."
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onApply();
              }
            }}
            className="h-auto rounded-xl bg-muted border-transparent py-2.5 text-sm focus:border-border focus-visible:ring-primary"
          />
        </form>
      </div>

      {/* ── Buttons ────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1 rounded-2xl py-5 text-sm font-semibold"
          >
            Reset
          </Button>
        )}
        <Button
          onClick={onApply}
          className="flex-1 rounded-2xl py-5 text-sm font-semibold"
        >
          Show listings
        </Button>
      </div>
    </div>
  );
}

// ── TopNavMobile ──────────────────────────────────────────────────────────────
export default function TopNavMobile() {
  const {
    applyFilters,
    activeFilterCount,
    filterSheetOpen,
    setFilterSheetOpen,
    appliedFilters,
    setFilters,
    filters,
  } = useFeed();

  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleApply() {
    applyFilters();
    setFilterSheetOpen(false);
  }

  function handleOpenFilterSheet() {
    setFilters(appliedFilters);
    setFilterSheetOpen(true);
  }

  useEffect(() => {
    if (searchParams.get("filters") === "1") {
      setFilters(appliedFilters);
      setFilterSheetOpen(true);
      router.replace("/");
    }
  }, [appliedFilters, router, searchParams, setFilterSheetOpen, setFilters]);

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

            {/* Desktop: Category Links */}
            <nav className="hidden md:flex items-center flex-1 justify-center gap-6">
              {(["all", "house", "office", "shop"] as PropertyType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const next = {
                        ...filters,
                        type,
                        roomType: "any" as RoomType,
                        shopType: "any" as ShopType,
                      };
                      setFilters(next);
                      applyFilters(next);
                    }}
                    className={`text-sm font-medium capitalize transition-colors pb-0.5 ${
                      appliedFilters.type === type
                        ? "text-foreground border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "all" ? "All" : `${type}s`}
                  </button>
                ),
              )}
            </nav>

            {/* Desktop: Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleOpenFilterSheet}
                className="relative rounded-full gap-2"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filter Modal ──────────────────────────────────────────────────────── */}
      {isMobile ? (
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl max-h-[90vh] overflow-y-auto px-5 pb-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="w-9 h-1 rounded-full bg-border mx-auto mb-4" />
            <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-border mb-5">
              <SheetTitle className="text-base font-semibold text-foreground">
                Filter listings
              </SheetTitle>
            </SheetHeader>
            <FilterContent onApply={handleApply} />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <DialogContent
            className="rounded-2xl overflow-hidden p-0"
            style={{
              width: "480px",
              maxWidth: "90vw",
              maxHeight: "65vh",
              overflowX: "hidden",
            }}
          >
            <div
              className="overflow-y-auto p-6"
              style={{ maxHeight: "65vh", scrollbarWidth: "none" }}
            >
              <DialogHeader className="mb-5 pb-4 border-b border-border">
                <DialogTitle className="text-base font-semibold text-foreground">
                  Filter listings
                </DialogTitle>
              </DialogHeader>
              <FilterContent onApply={handleApply} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
