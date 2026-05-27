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

// ── Mark as Rented ─────────────────────────────────────────────────────────
export async function markAsRented(
  listingId: string,
  phone: string,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("id, pin, phone_number")
    .eq("id", listingId)
    .eq("phone_number", phone.trim())
    .single();

  if (fetchError || !listing) {
    return { success: false, error: "Phone number doesn't match this listing." };
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

// ── Submit Report ──────────────────────────────────────────────────────────
// Inserts a report row, then counts total reports for this listing.
// If the count reaches the threshold (5), the listing is automatically
// flagged — it disappears from the feed pending review.
const REPORT_THRESHOLD = 5;

export async function submitReport(
  listingId: string,
  reason: string
): Promise<{ success: boolean; error?: string; flagged?: boolean }> {
  const supabase = await createClient();

  // Step 1: Insert the new report
  const { error: insertError } = await supabase
    .from("reports")
    .insert({ listing_id: listingId, reason });

  if (insertError) {
    return { success: false, error: "Could not submit report. Try again." };
  }

  // Step 2: Count how many reports this listing now has
  const { count, error: countError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (countError) {
    // Report was saved — don't fail the whole action just because count failed
    return { success: true };
  }

  // Step 3: If threshold reached, flag the listing
  if (count !== null && count >= REPORT_THRESHOLD) {
    await supabase
      .from("listings")
      .update({ status: "flagged" })
      .eq("id", listingId);

    // Revalidate so the listing disappears from the feed on next load
    revalidatePath("/");
    return { success: true, flagged: true };
  }

  return { success: true };
}