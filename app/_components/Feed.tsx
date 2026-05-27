"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useFeed } from "@/app/providers/feed-provider";
import { SlidersHorizontal, Info, Heart, MapPin, Navigation, Loader2, ChevronDown, ChevronUp, Flag, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { markAsRented, submitReport } from "@/app/actions/post-listing";

const typeStyles = {
  house: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  office: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
  shop: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
};

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const a2 =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(0)} km`;
}

// ── Report reasons ─────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Incorrect information",
  "Already rented / no longer available",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Duplicate listing",
  "Other",
];

// ── Report Section ─────────────────────────────────────────────────────────
function ReportSection({ listingId }: { listingId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [wasFlagged, setWasFlagged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason) return setError("Please select a reason");
    setError(null);
    setLoading(true);
    const result = await submitReport(listingId, reason);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    setWasFlagged(result.flagged ?? false);
    setDone(true);
  }

  if (done) {
    return (
      <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${
        wasFlagged
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-muted"
      }`}>
        <span className="text-2xl">{wasFlagged ? "🚩" : "🙏"}</span>
        <p className="text-foreground font-semibold text-sm">
          {wasFlagged ? "Listing has been flagged" : "Report submitted"}
        </p>
        <p className="text-muted-foreground text-xs text-center">
          {wasFlagged
            ? "This listing has received too many reports and has been removed from the feed."
            : "Thanks for helping keep Landlord trustworthy."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Flag size={14} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-foreground text-sm font-semibold">Report this listing</p>
            <p className="text-muted-foreground text-xs mt-0.5">Something wrong? Let us know</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">What's wrong with this listing?</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  reason === r
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !reason}
            variant="outline"
            className="w-full rounded-xl py-5 text-sm font-bold gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Owner Section ──────────────────────────────────────────────────────────
function OwnerSection({
  listingId,
  onRented,
}: {
  listingId: string;
  onRented: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleVerify() {
    setError(null);
    if (!phone.trim()) return setError("Enter your phone number");
    if (pin.length !== 4) return setError("PIN must be 4 digits");
    setLoading(true);
    const result = await markAsRented(listingId, phone, pin);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Verification failed");
      return;
    }
    setDone(true);
    setTimeout(() => onRented(), 1500);
  }

  if (done) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center gap-2">
        <span className="text-2xl">✅</span>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          Listing marked as rented
        </p>
        <p className="text-muted-foreground text-xs text-center">
          It will disappear from the feed shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
      >
        <div>
          <p className="text-foreground text-sm font-semibold">This is my listing</p>
          <p className="text-muted-foreground text-xs mt-0.5">Mark it as rented once it's taken</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <Input
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary py-5"
          />
          <Input
            type="password"
            placeholder="····"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary tracking-widest text-center text-lg py-5"
          />
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}
          <Button
            onClick={handleVerify}
            disabled={loading}
            variant="destructive"
            className="w-full rounded-xl py-5 text-sm font-bold gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Mark as Rented"
            )}
          </Button>
          <p className="text-muted-foreground text-[11px] text-center leading-relaxed">
            This will remove your listing from the feed immediately.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Detail Content ─────────────────────────────────────────────────────────
function DetailContent({
  listing,
  currentPhoto,
  setCurrentPhoto,
  styles,
  onRented,
}: {
  listing: any;
  currentPhoto: number;
  setCurrentPhoto: (i: number) => void;
  styles: typeof typeStyles.house;
  onRented: () => void;
}) {
  return (
    <div className="px-1 space-y-4">
      {/* Photo strip */}
      {listing.photos.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {listing.photos.map((p: string, i: number) => (
            <div
              key={i}
              className={`relative h-20 w-28 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all ${
                i === currentPhoto ? "ring-2 ring-primary" : "opacity-60"
              }`}
              onClick={() => setCurrentPhoto(i)}
            >
              <Image src={p} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="112px" />
            </div>
          ))}
        </div>
      )}

      {/* Type + Title + Price */}
      <div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-2 ${styles.bg} ${styles.border}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          <span className={`text-[11px] font-bold tracking-wide uppercase ${styles.text}`}>
            {listing.type}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-foreground font-bold text-lg leading-tight flex-1 min-w-0">
            {listing.title}
          </h2>
          <div className="text-right shrink-0">
            <p className="text-foreground font-bold text-base">UGX {listing.price.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">/month</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5">
        <MapPin size={15} className="text-orange-400 shrink-0" strokeWidth={2.5} />
        <p className="text-muted-foreground text-sm">{listing.location_name}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2">
        {listing.rooms && (
          <div className="flex-1 bg-muted rounded-xl p-2.5 text-center">
            <p className="text-foreground font-bold text-sm">{listing.rooms}</p>
            <p className="text-muted-foreground text-[11px]">{listing.rooms === 1 ? "Room" : "Rooms"}</p>
          </div>
        )}
        <div className="flex-1 bg-muted rounded-xl p-2.5 text-center">
          <p className="text-foreground font-bold text-sm">{listing.photos.length}</p>
          <p className="text-muted-foreground text-[11px]">Photos</p>
        </div>
        <div className="flex-1 bg-muted rounded-xl p-2.5 text-center">
          <p className={`font-bold text-sm capitalize ${styles.text}`}>{listing.type}</p>
          <p className="text-muted-foreground text-[11px]">Type</p>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {listing.description}
        </p>
      )}

      {/* Flagged warning — shown inside detail if listing is flagged */}
      {listing.status === "flagged" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2.5">
          <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-red-600 dark:text-red-400 text-xs leading-relaxed">
            This listing has been flagged by multiple users and is under review.
            Proceed with caution.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2.5">
        <span className="text-base shrink-0">⚠️</span>
        <p className="text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
          Always visit this space in person before making any payments to anyone.
        </p>
      </div>

      {/* Call Button */}
      <Button
        className="w-full rounded-2xl py-5 text-sm font-bold gap-2"
        onClick={() => window.open(`tel:${listing.phone_number}`)}
      >
        📞 Call {listing.phone_number}
      </Button>

      <OwnerSection listingId={listing.id} onRented={onRented} />
      <ReportSection listingId={listing.id} />
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
function FeedTabs({
  activeTab,
  setActiveTab,
  overlay = false,
}: {
  activeTab: "foryou" | "nearby" | "saved";
  setActiveTab: (tab: "foryou" | "nearby" | "saved") => void;
  overlay?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        overlay ? "absolute top-4 left-1/2 -translate-x-1/2 z-20" : "py-4 mx-auto"
      }`}
      style={{ gap: "clamp(0.75rem, 4vw, 1.5rem)", width: "max-content", maxWidth: "90vw" }}
    >
      {(["foryou", "nearby", "saved"] as const).map((tab) => (
        <button
          key={tab}
          onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
          className={`relative pb-1 text-sm font-semibold transition-all duration-200 ${
            activeTab === tab
              ? overlay ? "text-white" : "text-foreground"
              : overlay ? "text-white/45 hover:text-white/70" : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          {tab === "foryou" ? "For You" : tab === "nearby" ? "Nearby" : "Saved"}
          {activeTab === tab && (
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${overlay ? "bg-white" : "bg-foreground"}`} />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main Feed ──────────────────────────────────────────────────────────────
export default function Feed() {
  const {
    filteredListings,
    currentIndex,
    setCurrentIndex,
    currentPhoto,
    setCurrentPhoto,
    detailOpen,
    setDetailOpen,
    setFilterSheetOpen,
    activeFilterCount,
    activeTab,
    setActiveTab,
    savedIds,
    toggleSave,
    userLocation,
  } = useFeed();

  const isMobile = useIsMobile();
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);

  const listing = filteredListings[currentIndex];

  useEffect(() => {
    setCurrentPhoto(0);
  }, [currentIndex, setCurrentPhoto]);

  function handleRented() {
    setDetailOpen(false);
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartY.current || !touchStartX.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 40 && listing && currentPhoto < listing.photos.length - 1) setCurrentPhoto(currentPhoto + 1);
        else if (deltaX < -40 && currentPhoto > 0) setCurrentPhoto(currentPhoto - 1);
      } else {
        if (deltaY > 50 && currentIndex < filteredListings.length - 1) setCurrentIndex(currentIndex + 1);
        else if (deltaY < -50 && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      }
      touchStartY.current = null;
      touchStartX.current = null;
    },
    [touchStartY, touchStartX, currentPhoto, currentIndex, filteredListings.length, listing, setCurrentPhoto, setCurrentIndex]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!mouseStart.current) return;
      const deltaX = mouseStart.current.x - e.clientX;
      const deltaY = mouseStart.current.y - e.clientY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 40 && listing && currentPhoto < listing.photos.length - 1) setCurrentPhoto(currentPhoto + 1);
        else if (deltaX < -40 && currentPhoto > 0) setCurrentPhoto(currentPhoto - 1);
      } else {
        if (deltaY > 50 && currentIndex < filteredListings.length - 1) setCurrentIndex(currentIndex + 1);
        else if (deltaY < -50 && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      }
      mouseStart.current = null;
    },
    [mouseStart, currentPhoto, currentIndex, filteredListings.length, listing, setCurrentPhoto, setCurrentIndex]
  );

  // ── Empty state ────────────────────────────────────────────────────────
  if (!listing) {
    return (
      <div className="relative w-full flex-1 flex flex-col bg-background" style={{ height: "calc(100vh - 56px)" }}>
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} overlay={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-4xl">
            {activeTab === "saved" ? "🤍" : activeTab === "nearby" ? "📍" : "🏠"}
          </p>
          <p className="text-foreground font-semibold">
            {activeTab === "saved" ? "No saved listings yet"
              : activeTab === "nearby" ? "No nearby listings found"
              : "No listings found"}
          </p>
          <p className="text-muted-foreground text-sm text-center px-8">
            {activeTab === "saved" ? "Tap the heart on any listing to save it here"
              : activeTab === "nearby" ? "Listings need coordinates set to appear here"
              : "Try adjusting your filters"}
          </p>
          {activeTab !== "saved" && (
            <Button variant="outline" className="rounded-full mt-2" onClick={() => setFilterSheetOpen(true)}>
              Adjust filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  const styles = typeStyles[listing.type];
  const photo = listing.photos[currentPhoto];
  const isCurrentSaved = savedIds.has(listing.id);

  const distanceBadge =
    activeTab === "nearby" &&
    userLocation !== null &&
    listing.latitude !== null &&
    listing.longitude !== null
      ? formatDistance(haversine(userLocation, { lat: listing.latitude, lng: listing.longitude }))
      : null;

  // Flagged listings show a warning triangle badge on the feed card
  const isFlagged = listing.status === "flagged";

  return (
    <>
      <div
        className="relative w-full flex-1 bg-background select-none cursor-grab active:cursor-grabbing"
        style={{ height: "calc(100vh - 56px)" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div
          className="absolute inset-x-0 top-0 overflow-hidden rounded-b-xl"
          style={{ bottom: "52px" }}
        >
          {photo ? (
            <div className="relative w-full h-full">
              <Image src={photo} alt={listing.title} fill className="object-cover" sizes="100vw" priority draggable={false} />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-8xl opacity-20">🏠</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

          <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} overlay={true} />

          {/* Flagged badge — top left corner of the photo */}
          {isFlagged && (
            <div className="absolute top-14 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
              <AlertTriangle size={11} className="text-white" strokeWidth={2.5} />
              <span className="text-white text-[11px] font-bold">Under review</span>
            </div>
          )}

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-20 left-4 right-20 z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${styles.bg} ${styles.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                <span className={`text-[11px] font-bold tracking-wide uppercase ${styles.text}`}>
                  {listing.type}
                </span>
              </div>
              {distanceBadge && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25">
                  <Navigation size={10} className="text-white" strokeWidth={2.5} />
                  <span className="text-[11px] font-bold text-white">{distanceBadge}</span>
                </div>
              )}
            </div>
            <h2 className="text-white font-bold text-2xl leading-tight mb-1.5 drop-shadow-lg">{listing.title}</h2>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin size={18} className="text-orange-400 shrink-0" strokeWidth={2.5} />
              <span className="text-white/70 text-sm">{listing.location_name}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-xl">UGX {listing.price.toLocaleString()}</span>
              <span className="text-white/50 text-sm">/mo</span>
            </div>
          </div>

          {/* Photo dots */}
          {listing.photos.length > 1 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 pointer-events-auto">
              {listing.photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentPhoto(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentPhoto ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Right Side Floating Actions */}
          {/* Right Side Floating Actions */}
<div className="absolute right-3 bottom-20 z-10 flex flex-col gap-3 md:hidden">
  <button
    onClick={() => setDetailOpen(true)}
    className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
  >
    <Info size={18} className="text-white" />
  </button>

  <button
    onClick={() => toggleSave(listing.id)}
    className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
  >
    <Heart
      size={18}
      className={`transition-colors ${
        isCurrentSaved
          ? "fill-red-500 text-red-500"
          : "text-white"
      }`}
    />
  </button>

  <button
    onClick={() => setFilterSheetOpen(true)}
    className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
  >
    <SlidersHorizontal size={18} className="text-white" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Gap strip */}
        <div className="absolute inset-x-0 bottom-0 flex items-center px-4" style={{ height: "52px" }}>
          {filteredListings[currentIndex + 1] && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-emerald-500 text-xs">↑</span>
              <span className="text-emerald-500 text-xs font-medium truncate">
                Next: {filteredListings[currentIndex + 1].title}
              </span>
              <span className="text-emerald-500 text-xs ml-auto shrink-0">
                UGX {filteredListings[currentIndex + 1].price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      {isMobile ? (
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pb-10">
            <div className="w-9 h-1 rounded-full bg-border mx-auto mb-5" />
            <DetailContent
              listing={listing}
              currentPhoto={currentPhoto}
              setCurrentPhoto={setCurrentPhoto}
              styles={styles}
              onRented={handleRented}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent
            className="rounded-2xl overflow-hidden p-0"
            style={{ width: "560px", maxWidth: "90vw", maxHeight: "70vh", overflowX: "hidden" }}
          >
            <div className="overflow-y-auto p-6" style={{ maxHeight: "70vh", scrollbarWidth: "none" }}>
              <DetailContent
                listing={listing}
                currentPhoto={currentPhoto}
                setCurrentPhoto={setCurrentPhoto}
                styles={styles}
                onRented={handleRented}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
