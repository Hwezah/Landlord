"use client";

import { useRef, useCallback, useEffect } from "react";
import { useFeed } from "@/app/providers/feed-provider";
import { SlidersHorizontal, Info, Heart, MapPin } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const typeStyles = {
  house: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  office: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
  shop: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
};

function DetailContent({
  listing,
  currentPhoto,
  setCurrentPhoto,
  styles,
}: {
  listing: any;
  currentPhoto: number;
  setCurrentPhoto: (i: number) => void;
  styles: typeof typeStyles.house;
}) {
  return (
    <div className="px-1">
      {/* Photo strip */}
      {listing.photos.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {listing.photos.map((p: string, i: number) => (
            <img
              key={i}
              src={p}
              alt={`Photo ${i + 1}`}
              className={`h-24 w-36 object-cover rounded-xl flex-shrink-0 cursor-pointer transition-all ${
                i === currentPhoto ? "ring-2 ring-primary" : "opacity-60"
              }`}
              onClick={() => setCurrentPhoto(i)}
            />
          ))}
        </div>
      )}

      {/* Type badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 ${styles.bg} ${styles.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        <span className={`text-[11px] font-bold tracking-wide uppercase ${styles.text}`}>
          {listing.type}
        </span>
      </div>

      {/* Title + Price — min-w-0 prevents overflow */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-foreground font-bold text-xl leading-tight flex-1 min-w-0">
          {listing.title}
        </h2>
        <div className="text-right shrink-0 ml-2">
          <p className="text-foreground font-bold text-base">
            UGX {listing.price.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-xs">/month</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-4">
        <MapPin size={16} className="text-orange-400 shrink-0" strokeWidth={2.5} />
        <p className="text-muted-foreground text-sm">{listing.location_name}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-5">
        {listing.rooms && (
          <div className="flex-1 bg-muted rounded-xl p-3 text-center">
            <p className="text-foreground font-bold text-base">{listing.rooms}</p>
            <p className="text-muted-foreground text-xs">
              {listing.rooms === 1 ? "Room" : "Rooms"}
            </p>
          </div>
        )}
        <div className="flex-1 bg-muted rounded-xl p-3 text-center">
          <p className="text-foreground font-bold text-base">{listing.photos.length}</p>
          <p className="text-muted-foreground text-xs">Photos</p>
        </div>
        <div className="flex-1 bg-muted rounded-xl p-3 text-center">
          <p className={`font-bold text-base capitalize ${styles.text}`}>{listing.type}</p>
          <p className="text-muted-foreground text-xs">Type</p>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {listing.description}
        </p>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 flex gap-3">
        <span className="text-lg shrink-0">⚠️</span>
        <p className="text-amber-600 dark:text-amber-400 text-sm leading-relaxed">
          Always visit this space in person before making any payments to anyone.
        </p>
      </div>

      {/* Call Button */}
      <Button
        className="w-full rounded-2xl py-6 text-base font-bold gap-2"
        onClick={() => window.open(`tel:${listing.phone_number}`)}
      >
        📞 Call {listing.phone_number}
      </Button>
    </div>
  );
}

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
  } = useFeed();

  const isMobile = useIsMobile();
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);

  const listing = filteredListings[currentIndex];

  useEffect(() => {
    setCurrentPhoto(0);
  }, [currentIndex, setCurrentPhoto]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartY.current || !touchStartX.current) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 40 && listing && currentPhoto < listing.photos.length - 1) {
        setCurrentPhoto(currentPhoto + 1);
      } else if (deltaX < -40 && currentPhoto > 0) {
        setCurrentPhoto(currentPhoto - 1);
      }
    } else {
      if (deltaY > 50 && currentIndex < filteredListings.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (deltaY < -50 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  }, [touchStartY, touchStartX, currentPhoto, currentIndex, filteredListings.length, listing, setCurrentPhoto, setCurrentIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
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
  }, [mouseStart, currentPhoto, currentIndex, filteredListings.length, listing, setCurrentPhoto, setCurrentIndex]);

  if (!listing) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-4xl">🏠</p>
        <p className="text-foreground font-semibold">No listings found</p>
        <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
        <Button
          variant="outline"
          className="rounded-full mt-2"
          onClick={() => setFilterSheetOpen(true)}
        >
          Adjust filters
        </Button>
      </div>
    );
  }

  const styles = typeStyles[listing.type];
  const photo = listing.photos[currentPhoto];

  return (
    <>
      {/* ── Full Screen Feed ──────────────────────────────────────────────── */}
      <div
        className="relative w-full flex-1 bg-background select-none cursor-grab active:cursor-grabbing"
        style={{ height: "calc(100vh - 56px)" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* ── Current listing — leaves gap at bottom ────────────────────── */}
        <div
          className="absolute inset-x-0 top-0 overflow-hidden"
          style={{ bottom: "52px", borderRadius: "0 0 24px 24px" }}
        >
          {/* Background Photo */}
          {photo ? (
            <img
              src={photo}
              alt={listing.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-8xl opacity-20">🏠</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />

          {/* Listing Progress — left side */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5">
            {filteredListings.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1 rounded-full cursor-pointer transition-all duration-300 ${
                  i === currentIndex
                    ? "h-6 bg-white"
                    : "h-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Photo Dots — floating inside listing above gap */}
          {listing.photos.length > 1 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {listing.photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentPhoto ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-20 left-4 right-20 z-10">
            {/* Type Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 ${styles.bg} ${styles.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              <span className={`text-[11px] font-bold tracking-wide uppercase ${styles.text}`}>
                {listing.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-white font-bold text-2xl leading-tight mb-1.5 drop-shadow-lg">
              {listing.title}
            </h2>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin size={18} className="text-orange-400 shrink-0" strokeWidth={2.5} />
              <span className="text-white/70 text-sm">{listing.location_name}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-xl">
                UGX {listing.price.toLocaleString()}
              </span>
              <span className="text-white/50 text-sm">/mo</span>
            </div>
          </div>

          {/* Right Side Floating Actions */}
          <div className="absolute right-3 bottom-20 z-10 flex flex-col gap-3">
            <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95">
              <Heart size={18} className="text-white" />
            </button>
            <button
              onClick={() => setDetailOpen(true)}
              className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
            >
              <Info size={18} className="text-white" />
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

        {/* ── Gap strip — next listing peek ─────────────────────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center px-4"
          style={{ height: "52px" }}
        >
          {filteredListings[currentIndex + 1] && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-muted-foreground text-xs">↑</span>
              <span className="text-muted-foreground text-xs font-medium truncate">
                Next: {filteredListings[currentIndex + 1].title}
              </span>
              <span className="text-muted-foreground text-xs ml-auto">
                UGX {filteredListings[currentIndex + 1].price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {isMobile ? (
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pb-10"
          >
            <div className="w-9 h-1 rounded-full bg-border mx-auto mb-5" />
            <DetailContent
              listing={listing}
              currentPhoto={currentPhoto}
              setCurrentPhoto={setCurrentPhoto}
              styles={styles}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="w-[480px] max-w-[90vw] rounded-2xl px-6 pb-8 pt-2 max-h-[80vh] overflow-y-auto">
            <DetailContent
              listing={listing}
              currentPhoto={currentPhoto}
              setCurrentPhoto={setCurrentPhoto}
              styles={styles}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
