// app/listing/[id]/ListingPageClient.tsx
"use client";

import type { Listing } from "@/app/actions/listings";
import { markAsRented, submitReport } from "@/app/actions/post-listing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flag,
  Loader2,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const typeStyles = {
  house: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
    label: "House",
  },
  office: {
    bg: "bg-blue-500/15",
    text: "text-blue-500",
    border: "border-blue-500/25",
    dot: "bg-blue-400",
    label: "Office",
  },
  shop: {
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
    label: "Shop",
  },
};

// ─────────────────────────────────────────────────────────────
// Lightbox — unchanged
// ─────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  function prev() {
    setIdx((i) => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setIdx((i) => (i + 1) % photos.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        {idx + 1} / {photos.length}
      </span>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors text-xl"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors text-xl"
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative h-[80vh] w-full max-w-4xl px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[idx]}
          alt={`Photo ${idx + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Photo Collage — unchanged
// ─────────────────────────────────────────────────────────────
function PhotoCollage({
  photos,
  onOpen,
}: {
  photos: string[];
  onOpen: (index: number) => void;
}) {
  const total = photos.length;

  if (total === 0) {
    return (
      <div className="w-full h-72 rounded-2xl bg-muted flex items-center justify-center text-6xl text-muted-foreground/30">
        🏠
      </div>
    );
  }

  if (total === 1) {
    return (
      <div
        className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => onOpen(0)}
      >
        <Image
          src={photos[0]}
          alt="Property photo"
          fill
          className="object-cover hover:scale-[1.02] transition-transform duration-500"
          sizes="100vw"
          priority
        />
      </div>
    );
  }

  const showRightCount = Math.min(total - 1, 4);
  const rightSlots = photos.slice(1, 1 + showRightCount);
  const extraCount = total - 1 - showRightCount;

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "1fr 1fr", height: "clamp(280px, 45vw, 520px)" }}
      >
        <div
          className="relative overflow-hidden rounded-l-2xl cursor-pointer"
          onClick={() => onOpen(0)}
        >
          <Image
            src={photos[0]}
            alt="Main photo"
            fill
            className="object-cover hover:scale-[1.03] transition-transform duration-500"
            sizes="50vw"
            priority
          />
        </div>

        <div
          className="grid gap-1.5"
          style={{
            gridTemplateRows: rightSlots.length <= 2 ? `repeat(${rightSlots.length}, 1fr)` : "1fr 1fr",
            gridTemplateColumns: rightSlots.length >= 3 ? "1fr 1fr" : "1fr",
          }}
        >
          {rightSlots.map((src, i) => {
            const isLastCell = i === 3;
            const showOverlay = isLastCell && extraCount > 0;
            const isFirstRight = i === 0;
            const isLastRight = i === rightSlots.length - 1;
            const roundClass = [
              isFirstRight && rightSlots.length === 1 ? "rounded-r-2xl" : "",
              isFirstRight && rightSlots.length > 1 ? "rounded-tr-2xl" : "",
              isLastRight && rightSlots.length > 1 ? "rounded-br-2xl" : "",
            ].filter(Boolean).join(" ");

            return (
              <div
                key={i}
                className={`relative overflow-hidden cursor-pointer ${roundClass}`}
                onClick={() => onOpen(i + 1)}
              >
                <Image
                  src={src}
                  alt={`Photo ${i + 2}`}
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-500"
                  sizes="25vw"
                />
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      +{extraCount + 1} photos
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onOpen(0)}
        className="mt-3 w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors sm:hidden"
      >
        Show all {total} photos
      </button>
    </div>
  );
}

const REPORT_REASONS = [
  "Incorrect information",
  "Already rented / no longer available",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Duplicate listing",
  "Other",
];

// ─────────────────────────────────────────────────────────────
// Report Section — subtle bg, no border
// ─────────────────────────────────────────────────────────────
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
      <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${wasFlagged ? "bg-red-500/10" : "bg-muted/50"}`}>
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
    <div className="rounded-2xl overflow-hidden bg-muted/50">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/80 transition-colors rounded-2xl"
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
        <div className="px-4 pb-4 space-y-3 pt-1">
          <p className="text-sm text-muted-foreground">What&apos;s wrong with this listing?</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  reason === r
                    ? "bg-foreground text-background font-medium"
                    : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-destructive/10 rounded-xl px-3 py-2">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading || !reason}
            variant="outline"
            className="w-full rounded-xl py-5 text-sm font-bold gap-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
              : "Submit Report"
            }
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Owner Section — subtle bg, no border
// ─────────────────────────────────────────────────────────────
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
      <div className="bg-emerald-500/10 rounded-2xl p-4 flex flex-col items-center gap-2">
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
    <div className="rounded-2xl overflow-hidden bg-muted/50">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/80 transition-colors rounded-2xl"
      >
        <div>
          <p className="text-foreground text-sm font-semibold">This is my listing</p>
          <p className="text-muted-foreground text-xs mt-0.5">Mark it as rented once it&apos;s taken</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 pt-1">
          <Input
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl bg-background/60 border-transparent focus:border-border focus-visible:ring-primary py-5"
          />
          <Input
            type="password"
            placeholder="····"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="rounded-xl bg-background/60 border-transparent focus:border-border focus-visible:ring-primary tracking-widest text-center text-lg py-5"
          />
          {error && (
            <div className="bg-destructive/10 rounded-xl px-3 py-2">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}
          <Button
            onClick={handleVerify}
            disabled={loading}
            variant="destructive"
            className="w-full rounded-xl py-5 text-sm font-bold gap-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
              : "Mark as Rented"
            }
          </Button>
          <p className="text-muted-foreground text-[11px] text-center leading-relaxed">
            This will remove your listing from the feed immediately.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page client component
// ─────────────────────────────────────────────────────────────
export default function ListingPageClient({ listing }: { listing: Listing }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [markedRented, setMarkedRented] = useState(false);

  const styles = typeStyles[listing.type];
  const isFlagged = listing.status === "flagged";

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-24">

      {/* ── Title row ── */}
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground leading-snug">
              {listing.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin size={14} className="text-orange-400 shrink-0" strokeWidth={2.5} />
              <span className="text-muted-foreground text-sm">{listing.location_name}</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 ${styles.bg} ${styles.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
              {styles.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Photo collage ── */}
      <PhotoCollage photos={listing.photos} onOpen={(i) => setLightboxIndex(i)} />

      {lightboxIndex !== null && (
        <Lightbox
          photos={listing.photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* ── Two-column layout ── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-7">

          {/* Flagged warning */}
          {isFlagged && (
            <div className="bg-red-500/10 rounded-2xl p-4 flex gap-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">
                This listing has been flagged by multiple users and is under review. Proceed with caution.
              </p>
            </div>
          )}

          {markedRented && (
            <div className="bg-emerald-500/10 rounded-2xl p-4 text-center">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                ✅ This listing has been marked as rented
              </p>
            </div>
          )}

          <div className="border-b border-border" />

          {/* ── Stats — plain text, no boxes ── */}
          <div className="flex items-center gap-2 flex-wrap">
            {listing.rooms != null && (
              <>
                <span className="text-foreground text-sm font-medium">
                  {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}
                </span>
                <span className="text-muted-foreground/40 text-sm">·</span>
              </>
            )}
            <span className="text-foreground text-sm font-medium">
              {listing.photos.length} {listing.photos.length === 1 ? "photo" : "photos"}
            </span>
            <span className="text-muted-foreground/40 text-sm">·</span>
            <span className={`text-sm font-medium capitalize ${styles.text}`}>
              {listing.type}
            </span>
          </div>

          <div className="border-b border-border" />

          {/* Description */}
          {listing.description ? (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">About this space</h2>
              <p className="text-muted-foreground text-sm leading-7">{listing.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No description provided.</p>
          )}

          <div className="border-b border-border" />

          {/* Safety disclaimer — tint bg, no border */}
          <div className="bg-amber-500/8 rounded-2xl p-4 flex gap-3">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-amber-600 dark:text-amber-400 text-sm leading-relaxed">
              Always visit this space in person before making any payments to anyone.
            </p>
          </div>

          {/* Owner + Report — mobile only */}
          <div className="space-y-3 lg:hidden">
            <OwnerSection listingId={listing.id} onRented={() => setMarkedRented(true)} />
            <ReportSection listingId={listing.id} />
          </div>
        </div>

        {/* ── RIGHT COLUMN (desktop sidebar) ── */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-3">

            {/* Price card — subtle bg, no border */}
            <div className="rounded-2xl bg-muted/50 p-6 space-y-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-foreground">
                    UGX {listing.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={13} className="text-orange-400 shrink-0" strokeWidth={2.5} />
                  <p className="text-muted-foreground text-sm truncate">{listing.location_name}</p>
                </div>
              </div>

              <Button
                className="w-full rounded-xl py-5 text-sm font-bold gap-2"
                onClick={() => window.open(`tel:${listing.phone_number}`)}
              >
                <Phone size={16} strokeWidth={2.5} />
                Call {listing.phone_number}
              </Button>

              <p className="text-muted-foreground text-xs text-center leading-relaxed">
                Contact the landlord directly to arrange a viewing.
              </p>
            </div>

            <OwnerSection listingId={listing.id} onRented={() => setMarkedRented(true)} />
            <ReportSection listingId={listing.id} />
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar on mobile ── */}
      <div className="fixed bottom-0 inset-x-0 z-20 lg:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div>
            <p className="text-base font-semibold text-foreground leading-tight">
              UGX {listing.price.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">/month</p>
          </div>
          <Button
            className="ml-auto rounded-xl px-6 py-5 text-sm font-bold gap-2"
            onClick={() => window.open(`tel:${listing.phone_number}`)}
          >
            <Phone size={15} strokeWidth={2.5} />
            Call landlord
          </Button>
        </div>
      </div>
    </main>
  );
}
