// app/actions/listings.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type Listing = {
  id: string;
  slug: string | null;
  type: "house" | "office" | "shop";
  title: string;
  description: string;
  price: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  rooms: number | null;
  room_type: string | null;
  shop_type: string | null;
  price_type: "per_month" | "per_night";
  amenities: string[];
  phone_number: string;
  photos: string[];
  status: string;
  created_at: string;
};

const LISTING_SELECT = `
  id, slug, type, title, description, price, location_name,
  latitude, longitude, rooms, room_type, shop_type, price_type,
  amenities, phone_number, photos, status, created_at
`;

export async function getListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getListings error:", error);
    return [];
  }

  return (data as Listing[]) ?? [];
}

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

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Listing;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error("getListingById error:", error);
    return null;
  }

  return data as Listing;
}
