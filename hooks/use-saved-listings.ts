"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Get or create a session ID in localStorage ────────────────────────────────
// This is how we identify the user without any auth.
// First visit: a new random ID is generated and saved.
// Every visit after: the same ID is reused.
function getSessionId(): string {
  let id = localStorage.getItem("landlord_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("landlord_session_id", id);
  }
  return id;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSavedListings() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch all listing IDs saved by this session on mount
  useEffect(() => {
    async function fetchSaved() {
      const supabase = createClient();
      const sessionId = getSessionId();

      const { data, error } = await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("session_id", sessionId);

      if (!error && data) {
        setSavedIds(new Set(data.map((row) => row.listing_id)));
      }
      setLoading(false);
    }

    fetchSaved();
  }, []);

  // Toggle save: if already saved → remove it. If not → save it.
  const toggleSave = useCallback(async (listingId: string) => {
    const supabase = createClient();
    const sessionId = getSessionId();
    const isSaved = savedIds.has(listingId);

    // Optimistic update — update the UI immediately before the DB call
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    if (isSaved) {
      // Remove from saved_listings
      await supabase
        .from("saved_listings")
        .delete()
        .eq("listing_id", listingId)
        .eq("session_id", sessionId);
    } else {
      // Insert into saved_listings
      await supabase.from("saved_listings").insert({
        listing_id: listingId,
        session_id: sessionId,
      });
    }
  }, [savedIds]);

  return { savedIds, loading, toggleSave };
}