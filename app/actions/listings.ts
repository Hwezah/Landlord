// app/actions/listings.ts
"use server";
 
import { createClient } from "@/lib/supabase/server";
 
export type Listing = {
  id: string;
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
      "id, type, title, description, price, location_name, latitude, longitude, rooms, phone_number, photos, status, created_at"
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });
 
  if (error) {
    console.error("getListings error:", error);
    return [];
  }
 
  return (data as Listing[]) ?? [];
}
 
// Fetch a single listing by ID — used by the /listing/[id] detail page.
// Unlike getListings, this does NOT filter by status=available,
// so owners can still see their listing even after it's flagged/rented.
export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();
 
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, type, title, description, price, location_name, latitude, longitude, rooms, phone_number, photos, status, created_at"
    )
    .eq("id", id)
    .single();
 
  if (error) {
    console.error("getListingById error:", error);
    return null;
  }
 
  return data as Listing;
}