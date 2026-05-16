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
    console.error("Error fetching listings:", error.message);
    return [];
  }

  return data ?? [];
}