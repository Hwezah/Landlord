// app/actions/listings.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type Listing = {
  id: string;
  slug: string | null;  // null for listings posted before slugs were added
  type: "house" | "office" | "shop";
  title: string;
  description: string;
  price: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  rooms: number | null;
  phone_number: string;
  photos: string[];
  status: string;
  created_at: string;
};

export async function getListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, slug, type, title, description, price, location_name, latitude, longitude, rooms, phone_number, photos, status, created_at"
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getListings error:", error);
    return [];
  }

  return (data as Listing[]) ?? [];
}

// Returns every distinct location_name that currently has at least one
// available listing — used to drive search suggestions and the location
// parser instead of the hardcoded UGANDA_LOCATIONS array.
export async function getDistinctLocations(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("location_name")
    .eq("status", "available");

  if (error) {
    console.error("getDistinctLocations error:", error);
    return [];
  }

  const seen = new Set<string>();
  for (const row of data ?? []) {
    if (row.location_name) seen.add(row.location_name);
  }

  return [...seen].sort();
}

// Fetch by slug (new URLs) — used by the listing detail page.
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, slug, type, title, description, price, location_name, latitude, longitude, rooms, phone_number, photos, status, created_at"
    )
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Listing;
}

// Fetch by UUID — fallback for old shared links that used /listing/<uuid>.
export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, slug, type, title, description, price, location_name, latitude, longitude, rooms, phone_number, photos, status, created_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("getListingById error:", error);
    return null;
  }

  return data as Listing;
}