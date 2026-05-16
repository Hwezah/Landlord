"use client";

import type { Dispatch, SetStateAction } from "react";

export type FilterState = {
  type: "all" | "rent" | "sale";
  priceRange: "any" | "under-500" | "500-1000" | "1000+";
  rooms: "any" | "1" | "2" | "3+";
  location: string;
};

interface TopNavMobileProps {
  activeTab: "foryou" | "nearby";
  onTabChange: Dispatch<SetStateAction<"foryou" | "nearby">>;
  filters: FilterState;
  onFiltersChange: Dispatch<SetStateAction<FilterState>>;
  onApplyFilters: () => void;
}

const tabLabels: Record<"foryou" | "nearby", string> = {
  foryou: "For you",
  nearby: "Nearby",
};

export default function TopNavMobile({
  activeTab,
  onTabChange,
  filters,
  onFiltersChange,
  onApplyFilters,
}: TopNavMobileProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="border-b bg-background/90 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-full bg-muted p-1">
          {(["foryou", "nearby"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onApplyFilters}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Apply
        </button>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-xs text-muted-foreground">
          Type
          <select
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value as FilterState["type"])}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>
        </label>

        <label className="grid gap-1 text-xs text-muted-foreground">
          Price range
          <select
            value={filters.priceRange}
            onChange={(event) => updateFilter("priceRange", event.target.value as FilterState["priceRange"])}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="any">Any</option>
            <option value="under-500">Under 500</option>
            <option value="500-1000">500 - 1000</option>
            <option value="1000+">1000+</option>
          </select>
        </label>

        <label className="grid gap-1 text-xs text-muted-foreground">
          Rooms
          <select
            value={filters.rooms}
            onChange={(event) => updateFilter("rooms", event.target.value as FilterState["rooms"])}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="any">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3+">3+</option>
          </select>
        </label>

        <label className="grid gap-1 text-xs text-muted-foreground">
          Location
          <input
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            placeholder="Search location"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
