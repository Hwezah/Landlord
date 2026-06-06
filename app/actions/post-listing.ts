"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PostListingInput = {
  type: "house" | "office" | "shop";
  title: string;
  description: string;
  price: number;
  location_name: string;
  room_type: string | null;
  shop_type: string | null;
  price_type: "per_month" | "per_night";
  amenities: string[];
  phone_number: string;
  pin: string;
  photos: string[];
};

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function postListing(input: PostListingInput) {
  const supabase = await createClient();

  const slug = generateSlug(input.title);

  const session = await supabase.auth.getSession();

  const listingInsert = {
    type: input.type,
    title: input.title,
    description: input.description,
    price: input.price,
    location_name: input.location_name,
    room_type: input.room_type,
    shop_type: input.shop_type,
    price_type: input.price_type,
    amenities: input.amenities,
    phone_number: input.phone_number,
    pin: input.pin,
    photos: input.photos,
    status: "available",
    slug,
    ...(session.data.session?.user.id
      ? { user_id: session.data.session.user.id }
      : {}),
  };

  const { data, error } = await supabase
    .from("listings")
    .insert(listingInsert)
    .select("id, slug")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, id: data.id, slug: data.slug };
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

export async function markAsRented(
  listingId: string,
  phone: string,
  pin: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, pin, phone_number")
    .eq("id", listingId)
    .eq("phone_number", phone.trim())
    .single();

  if (fetchError || !listing) {
    return {
      success: false,
      error: "Phone number doesn't match this listing.",
    };
  }

  if (listing.pin !== pin.trim()) {
    return { success: false, error: "Incorrect PIN. Please try again." };
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "rented" })
    .eq("id", listingId);

  if (updateError) {
    return { success: false, error: "Could not update listing. Try again." };
  }

  revalidatePath("/");
  return { success: true };
}

const REPORT_THRESHOLD = 5;

export async function submitReport(
  listingId: string,
  reason: string,
): Promise<{ success: boolean; error?: string; flagged?: boolean }> {
  const supabase = await createClient();

  const { error: insertError } = await supabase
    .from("reports")
    .insert({ listing_id: listingId, reason });

  if (insertError) {
    return { success: false, error: "Could not submit report. Try again." };
  }

  const { count, error: countError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (countError) return { success: true };

  if (count !== null && count >= REPORT_THRESHOLD) {
    await supabase
      .from("listings")
      .update({ status: "flagged" })
      .eq("id", listingId);

    revalidatePath("/");
    return { success: true, flagged: true };
  }

  return { success: true };
}
