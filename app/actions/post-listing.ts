"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PostListingInput = {
  type: "house" | "office" | "shop";
  title: string;
  description: string;
  price: number;
  location_name: string;
  rooms: number | null;
  phone_number: string;
  pin: string;
  photos: string[];
};

export async function postListing(input: PostListingInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .insert({
      type: input.type,
      title: input.title,
      description: input.description,
      price: input.price,
      location_name: input.location_name,
      rooms: input.rooms,
      phone_number: input.phone_number,
      pin: input.pin,
      photos: input.photos,
      status: "available",
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function uploadPhoto(file: File): Promise<string | null> {
  const supabase = await createClient();

  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

  const { error } = await supabase.storage
    .from("listing-photos")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("listing-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}