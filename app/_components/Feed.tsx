// "use client";
// import type { Listing } from "@/app/actions/listings";
// import { markAsRented, submitReport } from "@/app/actions/post-listing";
// import { useFeed } from "@/app/providers/feed-provider";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { useIsMobile } from "@/hooks/use-mobile";
// import {
//   AlertTriangle,
//   ChevronDown,
//   ChevronUp,
//   Flag,
//   Heart,
//   Info,
//   Loader2,
//   MapPin,
//   Navigation,
//   Phone,
//   SlidersHorizontal,
// } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useRef, useState } from "react";

// const typeStyles = {
//   house: {
//     bg: "bg-emerald-500/20",
//     text: "text-emerald-400",
//     border: "border-emerald-500/30",
//     dot: "bg-emerald-400",
//   },
//   office: {
//     bg: "bg-blue-500/20",
//     text: "text-blue-400",
//     border: "border-blue-500/30",
//     dot: "bg-blue-400",
//   },
//   shop: {
//     bg: "bg-amber-500/20",
//     text: "text-amber-400",
//     border: "border-amber-500/30",
//     dot: "bg-amber-400",
//   },
// };

// function haversine(
//   a: { lat: number; lng: number },
//   b: { lat: number; lng: number },
// ): number {
//   const R = 6371;
//   const toRad = (deg: number) => (deg * Math.PI) / 180;
//   const dLat = toRad(b.lat - a.lat);
//   const dLng = toRad(b.lng - a.lng);
//   const sinDLat = Math.sin(dLat / 2);
//   const sinDLng = Math.sin(dLng / 2);
//   const a2 =
//     sinDLat * sinDLat +
//     Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
//   return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
// }

// function formatDistance(km: number): string {
//   if (km < 1) return `${(km * 1000).toFixed(0)} m`;
//   if (km < 10) return `${km.toFixed(1)} km`;
//   return `${km.toFixed(0)} km`;
// }

// // ── Report reasons ─────────────────────────────────────────────────────────
// const REPORT_REASONS = [
//   "Incorrect information",
//   "Already rented / no longer available",
//   "Suspected scam or fraud",
//   "Inappropriate or offensive content",
//   "Duplicate listing",
//   "Other",
// ];

// // ── Report Section ─────────────────────────────────────────────────────────
// function ReportSection({ listingId }: { listingId: string }) {
//   const [expanded, setExpanded] = useState(false);
//   const [reason, setReason] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [done, setDone] = useState(false);
//   const [wasFlagged, setWasFlagged] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit() {
//     if (!reason) return setError("Please select a reason");
//     setError(null);
//     setLoading(true);
//     const result = await submitReport(listingId, reason);
//     setLoading(false);

//     if (!result.success) {
//       setError(result.error ?? "Something went wrong");
//       return;
//     }

//     setWasFlagged(result.flagged ?? false);
//     setDone(true);
//   }

//   if (done) {
//     return (
//       <div
//         className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${
//           wasFlagged ? "bg-red-500/10 border border-red-500/20" : "bg-muted"
//         }`}
//       >
//         <span className="text-2xl">{wasFlagged ? "🚩" : "🙏"}</span>
//         <p className="text-foreground font-semibold text-sm">
//           {wasFlagged ? "Listing has been flagged" : "Report submitted"}
//         </p>
//         <p className="text-muted-foreground text-xs text-center">
//           {wasFlagged
//             ? "This listing has received too many reports and has been removed from the feed."
//             : "Thanks for helping keep Landlord trustworthy."}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="border border-border rounded-2xl overflow-hidden">
//       <button
//         onClick={() => setExpanded((v) => !v)}
//         className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
//       >
//         <div className="flex items-center gap-2.5">
//           <Flag size={14} className="text-muted-foreground shrink-0" />
//           <div>
//             <p className="text-foreground text-sm font-semibold">
//               Report this listing
//             </p>
//             <p className="text-muted-foreground text-xs mt-0.5">
//               Something wrong? Let us know
//             </p>
//           </div>
//         </div>
//         {expanded ? (
//           <ChevronUp size={16} className="text-muted-foreground shrink-0" />
//         ) : (
//           <ChevronDown size={16} className="text-muted-foreground shrink-0" />
//         )}
//       </button>

//       {expanded && (
//         <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
//           <p className="text-sm text-muted-foreground">
//             What&apos;s wrong with this listing?
//           </p>
//           <div className="space-y-2">
//             {REPORT_REASONS.map((r) => (
//               <button
//                 key={r}
//                 onClick={() => setReason(r)}
//                 className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all ${
//                   reason === r
//                     ? "bg-foreground text-background font-medium"
//                     : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
//                 }`}
//               >
//                 {r}
//               </button>
//             ))}
//           </div>

//           {error && (
//             <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
//               <p className="text-destructive text-xs">{error}</p>
//             </div>
//           )}

//           <Button
//             onClick={handleSubmit}
//             disabled={loading || !reason}
//             variant="outline"
//             className="w-full rounded-xl py-5 text-sm font-bold gap-2"
//           >
//             {loading ? (
//               <>
//                 <Loader2 size={15} className="animate-spin" />
//                 Submitting...
//               </>
//             ) : (
//               "Submit Report"
//             )}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Owner Section ──────────────────────────────────────────────────────────
// function OwnerSection({
//   listingId,
//   onRented,
// }: {
//   listingId: string;
//   onRented: () => void;
// }) {
//   const [expanded, setExpanded] = useState(false);
//   const [phone, setPhone] = useState("");
//   const [pin, setPin] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [done, setDone] = useState(false);

//   async function handleVerify() {
//     setError(null);
//     if (!phone.trim()) return setError("Enter your phone number");
//     if (pin.length !== 4) return setError("PIN must be 4 digits");
//     setLoading(true);
//     const result = await markAsRented(listingId, phone, pin);
//     setLoading(false);
//     if (!result.success) {
//       setError(result.error ?? "Verification failed");
//       return;
//     }
//     setDone(true);
//     setTimeout(() => onRented(), 1500);
//   }

//   if (done) {
//     return (
//       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center gap-2">
//         <span className="text-2xl">✅</span>
//         <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
//           Listing marked as rented
//         </p>
//         <p className="text-muted-foreground text-xs text-center">
//           It will disappear from the feed shortly.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="border border-border rounded-2xl overflow-hidden">
//       <button
//         onClick={() => setExpanded((v) => !v)}
//         className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
//       >
//         <div>
//           <p className="text-foreground text-sm font-semibold">
//             This is my listing
//           </p>
//           <p className="text-muted-foreground text-xs mt-0.5">
//             Mark it as rented once it&apos;s taken
//           </p>
//         </div>
//         {expanded ? (
//           <ChevronUp size={16} className="text-muted-foreground shrink-0" />
//         ) : (
//           <ChevronDown size={16} className="text-muted-foreground shrink-0" />
//         )}
//       </button>

//       {expanded && (
//         <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
//           <Input
//             type="tel"
//             placeholder="Your phone number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary py-5"
//           />
//           <Input
//             type="password"
//             placeholder="····"
//             maxLength={4}
//             value={pin}
//             onChange={(e) =>
//               setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
//             }
//             className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary tracking-widest text-center text-lg py-5"
//           />
//           {error && (
//             <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
//               <p className="text-destructive text-xs">{error}</p>
//             </div>
//           )}
//           <Button
//             onClick={handleVerify}
//             disabled={loading}
//             variant="destructive"
//             className="w-full rounded-xl py-5 text-sm font-bold gap-2"
//           >
//             {loading ? (
//               <>
//                 <Loader2 size={15} className="animate-spin" />
//                 Verifying...
//               </>
//             ) : (
//               "Mark as Rented"
//             )}
//           </Button>
//           <p className="text-muted-foreground text-[11px] text-center leading-relaxed">
//             This will remove your listing from the feed immediately.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Detail Content ─────────────────────────────────────────────────────────
// // Still used for the MOBILE sheet popup
// function DetailContent({
//   listing,
//   currentPhoto,
//   setCurrentPhoto,
//   styles,
//   onRented,
// }: {
//   listing: Listing;
//   currentPhoto: number;
//   setCurrentPhoto: (i: number) => void;
//   styles: typeof typeStyles.house;
//   onRented: () => void;
// }) {
//   return (
//     <div className="space-y-4">
//       {/* Photo strip */}
//       {listing.photos.length > 0 && (
//         <div
//           className="-mx-1 flex gap-2 overflow-x-auto px-2 py-2"
//           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//         >
//           {listing.photos.map((p: string, i: number) => (
//             <div
//               key={i}
//               className={`relative m-0.5 h-20 w-28 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all ${
//                 i === currentPhoto
//                   ? "ring-2 ring-primary ring-offset-2 ring-offset-popover"
//                   : "opacity-60"
//               }`}
//               onClick={() => setCurrentPhoto(i)}
//             >
//               <Image
//                 src={p}
//                 alt={`Photo ${i + 1}`}
//                 fill
//                 className="object-cover"
//                 sizes="112px"
//               />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Type + Title + Price */}
//       <div>
//         <div className="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
//           <h2 className="w-fit max-w-full min-w-0 flex-auto break-words text-foreground font-medium text-lg leading-tight">
//             <span className={`font-bold capitalize ${styles.text}`}>{listing.type}</span>
//             <span className={`mx-1 ${styles.text} opacity-60`}> |</span>
//             {" "}{listing.title}
//           </h2>
//           <div className="flex shrink-0 items-baseline gap-1 whitespace-nowrap text-left">
//             <span className="text-sm text-muted-foreground font-normal">
//               UGX {listing.price.toLocaleString()}
//             </span>
//             <span className="text-muted-foreground text-xs">/month</span>
//           </div>
//         </div>
//       </div>

//       {/* Location */}
//       <div className="flex items-center gap-1.5">
//         <MapPin
//           size={15}
//           className="text-orange-400 shrink-0"
//           strokeWidth={2.5}
//         />
//         <p className="text-muted-foreground text-sm">{listing.location_name}</p>
//       </div>

//       {/* Stats */}
//       <div className="flex gap-2">
//         {listing.rooms && (
//           <div className="flex-1 rounded-xl p-2.5 text-center">
//             <p className="text-foreground font-bold text-sm">{listing.rooms}</p>
//             <p className="text-muted-foreground text-[11px]">
//               {listing.rooms === 1 ? "Room" : "Rooms"}
//             </p>
//           </div>
//         )}
//         <div className="flex-1 rounded-xl p-2.5 text-center">
//           <p className="text-foreground font-bold text-sm">
//             {listing.photos.length}
//           </p>
//           <p className="text-muted-foreground text-[11px]">Photos</p>
//         </div>
//         <div className="flex-1 rounded-xl p-2.5 text-center">
//           <p className={`font-bold text-sm capitalize ${styles.text}`}>
//             {listing.type}
//           </p>
//           <p className="text-muted-foreground text-[11px]">Type</p>
//         </div>
//       </div>

//       {/* Description */}
//       {listing.description && (
//         <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
//           {listing.description}
//         </p>
//       )}

//       {/* Flagged warning */}
//       {listing.status === "flagged" && (
//         <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2.5">
//           <AlertTriangle
//             size={15}
//             className="text-red-500 shrink-0 mt-0.5"
//             strokeWidth={2.5}
//           />
//           <p className="text-red-600 dark:text-red-400 text-xs leading-relaxed">
//             This listing has been flagged by multiple users and is under review.
//             Proceed with caution.
//           </p>
//         </div>
//       )}

//       {/* Disclaimer */}
//       <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2.5">
//         <span className="text-base shrink-0">⚠️</span>
//         <p className="text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
//           Always visit this space in person before making any payments to
//           anyone.
//         </p>
//       </div>

//       {/* Call Button */}
//       <Button
//         variant="ghost"
//         className="w-full rounded-2xl py-5 text-sm font-bold gap-2 text-foreground bg-muted/60 hover:bg-muted"
//         onClick={() => window.open(`tel:${listing.phone_number}`)}
//       >
//         <Phone size={18} className="shrink-0" strokeWidth={2.5} />
//         Call {listing.phone_number}
//       </Button>

//       <OwnerSection listingId={listing.id} onRented={onRented} />
//       <ReportSection listingId={listing.id} />
//     </div>
//   );
// }

// // ── Compact card — desktop horizontal scroll rows ──────────────────────────
// // Clicking navigates to the full listing page instead of opening a dialog.
// function CompactCard({
//   listing,
//   isSaved,
//   toggleSave,
// }: {
//   listing: Listing;
//   isSaved: boolean;
//   toggleSave: (id: string) => Promise<void>;
// }) {
//   const router = useRouter();
//   const photo = listing.photos[0];

//   return (
//     <div
//       onClick={() => router.push(`/listing/${listing.slug ?? listing.id}`)}
//       className="flex-shrink-0 w-44 sm:w-48 md:w-56 cursor-pointer"
//     >
//       <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-square">
//         {photo ? (
//           <Image
//             src={photo}
//             alt={listing.title}
//             fill
//             className="object-cover"
//             sizes="200px"
//             draggable={false}
//           />
//         ) : (
//           <div className="flex h-full items-center justify-center bg-slate-950 text-4xl text-white/20">
//             🏠
//           </div>
//         )}
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleSave(listing.id);
//           }}
//           className="absolute top-2 right-2 z-10 h-9 w-9 flex items-center justify-center text-white"
//           aria-label="Save listing"
//         >
//           <Heart
//             size={24}
//             strokeWidth={1.5}
//             className={
//               isSaved
//                 ? "fill-emerald-500 text-emerald-500"
//                 : "fill-black/40 text-white"
//             }
//           />
//         </button>
//       </div>

//       <div className="mt-2">
//         <p className="text-[11px] uppercase tracking-wide text-muted-foreground line-clamp-1">
//           {listing.location_name}
//         </p>
//         <h4 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
//           {listing.title}
//         </h4>
//         <p className="text-xs text-muted-foreground font-normal mt-1">
//           UGX {listing.price.toLocaleString()}
//         </p>
//       </div>
//     </div>
//   );
// }

// // ── Tabs ───────────────────────────────────────────────────────────────────
// function FeedTabs({
//   activeTab,
//   setActiveTab,
//   overlay = false,
// }: {
//   activeTab: "foryou" | "nearby" | "saved";
//   setActiveTab: (tab: "foryou" | "nearby" | "saved") => void;
//   overlay?: boolean;
// }) {
//   return (
//     <div
//       className={`flex items-center justify-center ${
//         overlay
//           ? "absolute top-4 left-1/2 -translate-x-1/2 z-20"
//           : "py-4 mx-auto"
//       }`}
//       style={{
//         gap: "clamp(0.75rem, 4vw, 1.5rem)",
//         width: "max-content",
//         maxWidth: "90vw",
//       }}
//     >
//       {(["foryou", "nearby", "saved"] as const).map((tab) => (
//         <button
//           key={tab}
//           onClick={(e) => {
//             e.stopPropagation();
//             setActiveTab(tab);
//           }}
//           className={`relative pb-1 text-sm font-semibold transition-all duration-200 ${
//             activeTab === tab
//               ? overlay
//                 ? "text-white"
//                 : "text-foreground"
//               : overlay
//                 ? "text-white/45 hover:text-white/70"
//                 : "text-muted-foreground hover:text-foreground/70"
//           }`}
//         >
//           {tab === "foryou" ? "For You" : tab === "nearby" ? "Nearby" : "Saved"}
//           {activeTab === tab && (
//             <span
//               className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${overlay ? "bg-white" : "bg-foreground"}`}
//             />
//           )}
//         </button>
//       ))}
//     </div>
//   );
// }

// // ── Main Feed ──────────────────────────────────────────────────────────────
// export default function Feed() {
//   const {
//     filteredListings,
//     currentIndex,
//     setCurrentIndex,
//     currentPhoto,
//     setCurrentPhoto,
//     detailOpen,
//     setDetailOpen,
//     setFilterSheetOpen,
//     activeFilterCount,
//     activeTab,
//     setActiveTab,
//     savedIds,
//     toggleSave,
//     userLocation,
//   } = useFeed();

//   const isMobile = useIsMobile();
//   const router = useRouter();

//   const touchStartY = useRef<number | null>(null);
//   const touchStartX = useRef<number | null>(null);
//   const mouseStart = useRef<{ x: number; y: number } | null>(null);

//   const listing = filteredListings[currentIndex];

//   useEffect(() => {
//     setCurrentPhoto(0);
//   }, [currentIndex, setCurrentPhoto]);

//   function handleRented() {
//     setDetailOpen(false);
//   }

//   const handleTouchStart = useCallback((e: React.TouchEvent) => {
//     touchStartY.current = e.touches[0].clientY;
//     touchStartX.current = e.touches[0].clientX;
//   }, []);

//   const handleTouchEnd = useCallback(
//     (e: React.TouchEvent) => {
//       if (!touchStartY.current || !touchStartX.current) return;
//       const deltaY = touchStartY.current - e.changedTouches[0].clientY;
//       const deltaX = touchStartX.current - e.changedTouches[0].clientX;
//       if (Math.abs(deltaX) > Math.abs(deltaY)) {
//         if (deltaX > 40 && listing && currentPhoto < listing.photos.length - 1)
//           setCurrentPhoto(currentPhoto + 1);
//         else if (deltaX < -40 && currentPhoto > 0)
//           setCurrentPhoto(currentPhoto - 1);
//       } else {
//         if (deltaY > 50 && currentIndex < filteredListings.length - 1)
//           setCurrentIndex(currentIndex + 1);
//         else if (deltaY < -50 && currentIndex > 0)
//           setCurrentIndex(currentIndex - 1);
//       }
//       touchStartY.current = null;
//       touchStartX.current = null;
//     },
//     [
//       touchStartY,
//       touchStartX,
//       currentPhoto,
//       currentIndex,
//       filteredListings.length,
//       listing,
//       setCurrentPhoto,
//       setCurrentIndex,
//     ],
//   );

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     mouseStart.current = { x: e.clientX, y: e.clientY };
//   }, []);

//   const handleMouseUp = useCallback(
//     (e: React.MouseEvent) => {
//       if (!mouseStart.current) return;
//       const deltaX = mouseStart.current.x - e.clientX;
//       const deltaY = mouseStart.current.y - e.clientY;
//       if (Math.abs(deltaX) > Math.abs(deltaY)) {
//         if (deltaX > 40 && listing && currentPhoto < listing.photos.length - 1)
//           setCurrentPhoto(currentPhoto + 1);
//         else if (deltaX < -40 && currentPhoto > 0)
//           setCurrentPhoto(currentPhoto - 1);
//       } else {
//         if (deltaY > 50 && currentIndex < filteredListings.length - 1)
//           setCurrentIndex(currentIndex + 1);
//         else if (deltaY < -50 && currentIndex > 0)
//           setCurrentIndex(currentIndex - 1);
//       }
//       mouseStart.current = null;
//     },
//     [
//       mouseStart,
//       currentPhoto,
//       currentIndex,
//       filteredListings.length,
//       listing,
//       setCurrentPhoto,
//       setCurrentIndex,
//     ],
//   );

//   // ── Empty state ────────────────────────────────────────────────────────
//   if (!listing) {
//     return (
//       <div
//         className="relative w-full flex-1 flex flex-col bg-background"
//         style={{ height: "calc(100vh - 56px)" }}
//       >
//         <FeedTabs
//           activeTab={activeTab}
//           setActiveTab={setActiveTab}
//           overlay={false}
//         />
//         <div className="flex-1 flex flex-col items-center justify-center gap-4">
//           <p className="text-4xl">
//             {activeTab === "saved"
//               ? "🤍"
//               : activeTab === "nearby"
//                 ? "📍"
//                 : "🏠"}
//           </p>
//           <p className="text-foreground font-semibold">
//             {activeTab === "saved"
//               ? "No saved listings yet"
//               : activeTab === "nearby"
//                 ? "No nearby listings found"
//                 : "No listings found"}
//           </p>
//           <p className="text-muted-foreground text-sm text-center px-8">
//             {activeTab === "saved"
//               ? "Tap the heart on any listing to save it here"
//               : activeTab === "nearby"
//                 ? "Listings need coordinates set to appear here"
//                 : "Try adjusting your filters"}
//           </p>
//           {activeTab !== "saved" && (
//             <Button
//               variant="outline"
//               className="rounded-full mt-2"
//               onClick={() => setFilterSheetOpen(true)}
//             >
//               Adjust filters
//             </Button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const styles = typeStyles[listing.type];
//   const photo = listing.photos[currentPhoto];
//   const isCurrentSaved = savedIds.has(listing.id);

//   const distanceBadge =
//     activeTab === "nearby" &&
//     userLocation !== null &&
//     listing.latitude !== null &&
//     listing.longitude !== null
//       ? formatDistance(
//           haversine(userLocation, {
//             lat: listing.latitude,
//             lng: listing.longitude,
//           }),
//         )
//       : null;

//   const isFlagged = listing.status === "flagged";

//   // ── Desktop layout ──────────────────────────────────────────────────────
//   // Cards navigate to /listing/[id] — no more dialog on desktop
//   if (!isMobile) {
//     return (
//       <div className="flex-1 overflow-y-auto pb-32 bg-background">
//         <div className="min-h-full px-6 py-8">
//           <div className="mx-auto max-w-[1600px]">
//             <div className="flex flex-col gap-6 xl:items-center xl:justify-between xl:px-4">
//               <div className="w-full">
//                 <div className="flex justify-center">
//                   <FeedTabs
//                     activeTab={activeTab}
//                     setActiveTab={setActiveTab}
//                     overlay={false}
//                   />
//                 </div>
//                 <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground text-center">
//                   Browse listings — click any card to open the full listing page.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-8 space-y-8">
//               {(["house", "office", "shop"] as const).map((t) => {
//                 const items = filteredListings.filter((l) => l.type === t);
//                 if (items.length === 0) return null;
//                 const title =
//                   t === "house"
//                     ? "Available Houses"
//                     : t === "office"
//                       ? "Available Offices"
//                       : "Available Shops";
//                 return (
//                   <section key={t} className="px-2">
//                     <h3 className="mb-3 text-sm md:text-[22px] font-semibold text-foreground px-2">
//                       {title}
//                     </h3>
//                     <div
//                       className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-4"
//                       style={{ scrollbarWidth: "none" }}
//                     >
//                       {items.map((item) => (
//                         <CompactCard
//                           key={item.id}
//                           listing={item}
//                           isSaved={savedIds.has(item.id)}
//                           toggleSave={toggleSave}
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Mobile layout — TikTok feed with sheet detail modal ─────────────────
//   return (
//     <>
//       <div
//         className="relative w-full flex-1 bg-background select-none cursor-grab active:cursor-grabbing pb-32"
//         style={{ height: "calc(100vh - 56px)" }}
//         onTouchStart={handleTouchStart}
//         onTouchEnd={handleTouchEnd}
//         onMouseDown={handleMouseDown}
//         onMouseUp={handleMouseUp}
//       >
//         <div
//           className="absolute inset-x-0 top-0 overflow-hidden rounded-b-xl"
//           style={{ bottom: "52px" }}
//         >
//           {photo ? (
//             <div className="relative w-full h-full">
//               <Image
//                 src={photo}
//                 alt={listing.title}
//                 fill
//                 className="object-cover"
//                 sizes="100vw"
//                 priority
//                 draggable={false}
//               />
//             </div>
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
//               <span className="text-8xl opacity-20">🏠</span>
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

//           <FeedTabs
//             activeTab={activeTab}
//             setActiveTab={setActiveTab}
//             overlay={true}
//           />

//           {/* Flagged badge */}
//           {isFlagged && (
//             <div className="absolute top-14 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
//               <AlertTriangle
//                 size={11}
//                 className="text-white"
//                 strokeWidth={2.5}
//               />
//               <span className="text-white text-[11px] font-bold">
//                 Under review
//               </span>
//             </div>
//           )}

//           {/* Bottom Content Overlay */}
//           <div className="absolute bottom-20 left-4 right-20 z-10">
//             {distanceBadge && (
//               <div className="inline-flex items-center gap-1 px-2.5 py-1 mb-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25">
//                 <Navigation size={10} className="text-white" strokeWidth={2.5} />
//                 <span className="text-[11px] font-bold text-white">{distanceBadge}</span>
//               </div>
//             )}
//             <h2 className="text-white font-medium text-lg leading-tight mb-1.5 drop-shadow-lg">
//               <span className={`font-bold capitalize ${styles.text}`}>{listing.type}</span>
//               <span className={`mx-1 ${styles.text} opacity-60`}> |</span>
//               {" "}{listing.title}
//             </h2>
//             <div className="flex items-center gap-1.5 mb-2">
//               <MapPin
//                 size={18}
//                 className="text-orange-400 shrink-0"
//                 strokeWidth={2.5}
//               />
//               <span className="text-white/70 text-sm">
//                 {listing.location_name}
//               </span>
//             </div>
//             <div className="flex items-baseline gap-1">
//               <span className="text-white text-sm font-medium">
//                 UGX {listing.price.toLocaleString()}
//               </span>
//               <span className="text-white/50 text-sm">/mo</span>
//             </div>
//           </div>

//           {/* Photo dots */}
//           {listing.photos.length > 1 && (
//             <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 pointer-events-auto">
//               {listing.photos.map((_, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   aria-label={`Photo ${i + 1}`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setCurrentPhoto(i);
//                   }}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${
//                     i === currentPhoto
//                       ? "w-6 bg-white"
//                       : "w-1.5 bg-white/40 hover:bg-white/60"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}

//           {/* Right Side Floating Actions */}
//           <div className="absolute right-3 bottom-20 z-10 flex flex-col gap-3 md:hidden">
//             <button
//               onClick={() => toggleSave(listing.id)}
//               className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
//             >
//               <Heart
//                 size={26}
//                 strokeWidth={1.5}
//                 className={`transition-colors ${
//                   isCurrentSaved
//                     ? "fill-emerald-500 text-emerald-500"
//                     : "fill-black/40 text-white"
//                 }`}
//               />
//             </button>
//             <button
//               onClick={() => setDetailOpen(true)}
//               className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
//             >
//               <Info size={18} className="text-white" />
//             </button>
//             <button
//               onClick={() => setFilterSheetOpen(true)}
//               className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95"
//             >
//               <SlidersHorizontal size={18} className="text-white" />
//               {activeFilterCount > 0 && (
//                 <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
//                   {activeFilterCount}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Gap strip — shows next listing */}
//         <div
//           className="absolute inset-x-0 bottom-0 flex items-center px-4"
//           style={{ height: "52px" }}
//         >
//           {filteredListings[currentIndex + 1] && (
//             <div className="flex items-center gap-2 w-full">
//               <span className="text-emerald-500 text-xs">↑</span>
//               <span className="text-emerald-500 text-xs font-medium truncate">
//                 Next: {filteredListings[currentIndex + 1].title}
//               </span>
//               <span className="text-emerald-500 text-xs ml-auto shrink-0 font-normal">
//                 UGX {filteredListings[currentIndex + 1].price.toLocaleString()}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Mobile detail popup (Sheet → Dialog) ────────────────────────── */}
//       <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
//   <DialogContent
//     className="rounded-[2rem] overflow-hidden p-0 shadow-2xl ring-1 ring-black/10"
//     style={{
//       width: "min(780px, 95vw)",
//       maxHeight: "90vh",
//       overflowX: "hidden",
//     }}
//   >
//     <DialogTitle className="sr-only">{listing.title}</DialogTitle>
//     <div
//       className="overflow-y-auto bg-background p-5"
//       style={{ maxHeight: "90vh", scrollbarWidth: "none" }}
//     >
//       <DetailContent
//         listing={listing}
//         currentPhoto={currentPhoto}
//         setCurrentPhoto={setCurrentPhoto}
//         styles={styles}
//         onRented={handleRented}
//       />
//     </div>
//   </DialogContent>
// </Dialog>
//     </>
//   );
// }
/////////////////////////////////////////////////////

"use client";
import type { Listing } from "@/app/actions/listings";
import { markAsRented, submitReport } from "@/app/actions/post-listing";
import { useFeed } from "@/app/providers/feed-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const typeStyles = {
  house: { text: "text-emerald-400" },
  office: { text: "text-blue-400" },
  shop: { text: "text-amber-400" },
};

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
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

const REPORT_REASONS = [
  "Incorrect information",
  "Already rented / no longer available",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Duplicate listing",
  "Other",
];

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
      <div className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${wasFlagged ? "bg-red-500/10" : "bg-muted"}`}>
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
    <div className="rounded-2xl overflow-hidden">
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
        {expanded ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">What&apos;s wrong with this listing?</p>
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
            {loading ? <><Loader2 size={15} className="animate-spin" />Submitting...</> : "Submit Report"}
          </Button>
        </div>
      )}
    </div>
  );
}

function OwnerSection({ listingId, onRented }: { listingId: string; onRented: () => void }) {
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
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Listing marked as rented</p>
        <p className="text-muted-foreground text-xs text-center">It will disappear from the feed shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
      >
        <div>
          <p className="text-foreground text-sm font-semibold">This is my listing</p>
          <p className="text-muted-foreground text-xs mt-0.5">Mark it as rented once it&apos;s taken</p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 pt-4">
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
            {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : "Mark as Rented"}
          </Button>
          <p className="text-muted-foreground text-[11px] text-center leading-relaxed">
            This will remove your listing from the feed immediately.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared detail modal content (used on desktop Dialog only) ──────────────
function ListingDetailContent({
  listing,
  onRented,
  onClose,
}: {
  listing: Listing;
  onRented: () => void;
  onClose: () => void;
}) {
  const styles = typeStyles[listing.type];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col" style={{ maxHeight: "90vh" }}>
      <div
        className="flex-1 overflow-y-auto bg-background"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Type | Title + close */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
          <h2 className="text-foreground font-semibold text-lg leading-snug flex-1">
            <span className={`font-bold capitalize ${styles.text}`}>{listing.type}</span>
            <span className="mx-2 text-muted-foreground/40 font-light">|</span>
            {listing.title}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5"
            aria-label="Close"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 px-5 pb-4">
          <MapPin size={13} className="text-orange-400 shrink-0" strokeWidth={2.5} />
          <p className="text-muted-foreground text-sm">{listing.location_name}</p>
        </div>

        {/* Photo grid */}
        {listing.photos.length > 0 && (
          <div className="px-5 pb-4">
            {listing.photos.length === 1 ? (
              <div
                className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
                style={{ height: "220px" }}
                onClick={() => setLightboxIndex(0)}
              >
                <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" sizes="560px" priority />
              </div>
            ) : listing.photos.length === 2 ? (
              <div className="grid grid-cols-2 gap-2" style={{ height: "220px" }}>
                {listing.photos.slice(0, 2).map((p, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(i)}>
                    <Image src={p} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="280px" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2" style={{ height: "220px" }}>
                <div className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(0)}>
                  <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" sizes="340px" priority />
                </div>
                <div className="flex flex-col gap-2" style={{ width: "46%" }}>
                  <div className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(1)}>
                    <Image src={listing.photos[1]} alt="Photo 2" fill className="object-cover" sizes="200px" />
                  </div>
                  <div className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(2)}>
                    <Image src={listing.photos[2]} alt="Photo 3" fill className="object-cover" sizes="200px" />
                    {listing.photos.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                        <span className="text-white font-bold text-lg">+{listing.photos.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 pb-4">
          {listing.rooms && (
            <span className="text-muted-foreground text-sm">
              {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}
            </span>
          )}
          {listing.photos.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {listing.photos.length} {listing.photos.length === 1 ? "photo" : "photos"}
            </span>
          )}
          <span className={`text-sm font-semibold capitalize ${styles.text}`}>{listing.type}</span>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="px-5 pb-4">
            <p className="text-foreground text-sm font-semibold mb-1.5">About this space</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Flagged warning */}
        {listing.status === "flagged" && (
          <div className="mx-5 mb-4 bg-red-500/10 rounded-xl p-3 flex gap-2.5">
            <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-red-600 dark:text-red-400 text-xs leading-relaxed">
              This listing has been flagged by multiple users and is under review. Proceed with caution.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mx-5 mb-4 bg-amber-500/10 rounded-xl p-3 flex gap-2.5">
          <span className="text-base shrink-0">⚠️</span>
          <p className="text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
            Always visit this space in person before making any payments to anyone.
          </p>
        </div>

        {/* Call */}
        <div className="px-5 pb-4">
          <Button
            variant="ghost"
            className="w-full rounded-2xl py-5 text-sm font-bold gap-2 text-foreground bg-muted/60 hover:bg-muted"
            onClick={() => window.open(`tel:${listing.phone_number}`)}
          >
            <Phone size={18} strokeWidth={2.5} />
            Call {listing.phone_number}
          </Button>
        </div>

        {/* Owner + Report */}
        <div className="px-5 pb-6 space-y-2">
          <OwnerSection listingId={listing.id} onRented={onRented} />
          <ReportSection listingId={listing.id} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col" style={{ borderRadius: "inherit" }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/60 text-sm">{lightboxIndex + 1} / {listing.photos.length}</span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              aria-label="Close lightbox"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
          <div className="flex-1 relative px-4">
            <Image src={listing.photos[lightboxIndex]} alt={`Photo ${lightboxIndex + 1}`} fill className="object-contain" sizes="100vw" />
          </div>
          <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none" }}>
            {listing.photos.map((p, i) => (
              <div
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  i === lightboxIndex ? "ring-2 ring-white ring-offset-1 ring-offset-black" : "opacity-40 hover:opacity-70"
                }`}
              >
                <Image src={p} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Desktop compact card ───────────────────────────────────────────────────
function CompactCard({
  listing,
  isSaved,
  toggleSave,
}: {
  listing: Listing;
  isSaved: boolean;
  toggleSave: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const photo = listing.photos[0];
  const styles = typeStyles[listing.type];

  return (
    <div
      onClick={() => router.push(`/listing/${(listing as any).slug ?? listing.id}`)}
      className="flex-shrink-0 w-44 sm:w-48 md:w-56 cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
        {photo ? (
          <Image src={photo} alt={listing.title} fill className="object-cover" sizes="200px" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/20">🏠</div>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleSave(listing.id); }}
          className="absolute top-2 right-2 z-10 h-9 w-9 flex items-center justify-center"
          aria-label="Save listing"
        >
          <Heart
            size={24}
            strokeWidth={1.5}
            className={isSaved ? "fill-emerald-500 text-emerald-500" : "fill-black/40 text-white"}
          />
        </button>
      </div>
      <div className="mt-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground line-clamp-1">
          {listing.location_name}
        </p>
        <h4 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
          <span className={`font-bold capitalize ${styles.text}`}>{listing.type}</span>
          <span className={`mx-1 ${styles.text} opacity-50`}>|</span>
          {listing.title}
        </h4>
        <p className="text-xs text-muted-foreground font-normal mt-1">
          UGX {listing.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
function FeedTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: "foryou" | "nearby" | "saved";
  setActiveTab: (tab: "foryou" | "nearby" | "saved") => void;
}) {
  return (
    <div
      className="flex items-center justify-center py-3"
      style={{ gap: "clamp(0.75rem, 4vw, 1.5rem)" }}
    >
      {(["foryou", "nearby", "saved"] as const).map((tab) => (
        <button
          key={tab}
          onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
          className={`relative pb-1 text-sm font-semibold transition-all duration-200 ${
            activeTab === tab
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          {tab === "foryou" ? "For You" : tab === "nearby" ? "Nearby" : "Saved"}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-foreground" />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Mobile listing card ────────────────────────────────────────────────────
// Tapping photo or ⓘ navigates to the full listing page, same as desktop.
function MobileListingCard({
  listing,
  isSaved,
  toggleSave,
  distanceBadge,
}: {
  listing: Listing;
  isSaved: boolean;
  toggleSave: (id: string) => Promise<void>;
  distanceBadge: string | null;
}) {
  const router = useRouter();
  const styles = typeStyles[listing.type];
  const [photoIdx, setPhotoIdx] = useState(0);
  const photo = listing.photos[photoIdx];
  const slug = (listing as any).slug ?? listing.id;

  return (
    <div className="mx-4 mb-5 rounded-3xl overflow-hidden bg-muted/40">

      {/* Photo — tap navigates to listing page */}
      <div
        className="relative w-full cursor-pointer"
        style={{ height: "230px" }}
        onClick={() => router.push(`/listing/${slug}`)}
      >
        {photo ? (
          <Image src={photo} alt={listing.title} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-6xl opacity-20">🏠</span>
          </div>
        )}

        {/* Save button — stopPropagation so it doesn't navigate */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(listing.id); }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          aria-label="Save listing"
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            className={isSaved ? "fill-emerald-500 text-emerald-500" : "fill-white/30 text-white"}
          />
        </button>

        {/* Distance badge */}
        {distanceBadge && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <Navigation size={10} className="text-white" strokeWidth={2.5} />
            <span className="text-white text-[11px] font-semibold">{distanceBadge}</span>
          </div>
        )}

        {/* Flagged badge */}
        {listing.status === "flagged" && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
            <AlertTriangle size={10} className="text-white" strokeWidth={2.5} />
            <span className="text-white text-[11px] font-semibold">Under review</span>
          </div>
        )}

        {/* Photo dots — stopPropagation so switching photos doesn't navigate */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {listing.photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === photoIdx ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4">

        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={12} className="text-orange-400 shrink-0" strokeWidth={2.5} />
          <span className="text-muted-foreground text-xs">{listing.location_name}</span>
        </div>

        {/* Title row — ⓘ icon navigates to listing page */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-foreground font-semibold text-[15px] leading-snug flex-1">
            <span className={`font-bold capitalize ${styles.text}`}>{listing.type}</span>
            <span className={`mx-1 ${styles.text} opacity-50`}>|</span>
            {listing.title}
          </h3>
          <button
            onClick={() => router.push(`/listing/${slug}`)}
            className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-muted flex items-center justify-center"
            aria-label="View details"
          >
            <Info size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Meta chips + price */}
        <div className="flex items-center gap-2 mb-3">
          {listing.rooms && (
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-lg font-medium shrink-0">
              {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}
            </span>
          )}
          {listing.photos.length > 0 && (
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-lg font-medium shrink-0">
              {listing.photos.length} {listing.photos.length === 1 ? "photo" : "photos"}
            </span>
          )}
          <div className="flex-1 text-right">
            <span className="text-foreground font-bold text-sm">
              UGX {listing.price.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs">/mo</span>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Call button */}
        <button
          onClick={() => window.open(`tel:${listing.phone_number}`)}
          className="w-full h-11 rounded-2xl bg-foreground text-background flex items-center justify-center gap-2 font-semibold text-sm"
        >
          <Phone size={15} strokeWidth={2.5} />
          {listing.phone_number}
        </button>
      </div>
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

  const listing = filteredListings[currentIndex];

  useEffect(() => {
    setCurrentPhoto(0);
  }, [currentIndex, setCurrentPhoto]);

  function handleRented() {
    setDetailOpen(false);
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (filteredListings.length === 0) {
    return (
      <div
        className="relative w-full flex-1 flex flex-col bg-background"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-4xl">
            {activeTab === "saved" ? "🤍" : activeTab === "nearby" ? "📍" : "🏠"}
          </p>
          <p className="text-foreground font-semibold">
            {activeTab === "saved"
              ? "No saved listings yet"
              : activeTab === "nearby"
                ? "No nearby listings found"
                : "No listings found"}
          </p>
          <p className="text-muted-foreground text-sm text-center px-8">
            {activeTab === "saved"
              ? "Tap the heart on any listing to save it here"
              : activeTab === "nearby"
                ? "Listings need coordinates set to appear here"
                : "Try adjusting your filters"}
          </p>
          {activeTab !== "saved" && (
            <Button
              variant="outline"
              className="rounded-full mt-2"
              onClick={() => setFilterSheetOpen(true)}
            >
              Adjust filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="flex-1 overflow-y-auto pb-32 bg-background">
        <div className="min-h-full px-6 py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex justify-center">
              <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <p className="mx-auto mt-1 max-w-2xl text-sm text-muted-foreground text-center">
              Browse listings — click any card to open the full listing page.
            </p>
            <div className="mt-8 space-y-8">
              {(["house", "office", "shop"] as const).map((t) => {
                const items = filteredListings.filter((l) => l.type === t);
                if (items.length === 0) return null;
                const title =
                  t === "house" ? "Available Houses"
                  : t === "office" ? "Available Offices"
                  : "Available Shops";
                return (
                  <section key={t} className="px-2">
                    <h3 className="mb-3 text-sm md:text-[22px] font-semibold text-foreground px-2">
                      {title}
                    </h3>
                    <div
                      className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-4"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {items.map((item) => (
                        <CompactCard
                          key={item.id}
                          listing={item}
                          isSaved={savedIds.has(item.id)}
                          toggleSave={toggleSave}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop detail Dialog — still used when detailOpen is triggered programmatically */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent
            className="rounded-[2rem] overflow-hidden p-0 shadow-2xl"
            style={{ width: "min(780px, 95vw)", maxHeight: "90vh", overflowX: "hidden" }}
          >
            <DialogTitle className="sr-only">{listing?.title}</DialogTitle>
            {listing && (
              <ListingDetailContent
                listing={listing}
                onRented={handleRented}
                onClose={() => setDetailOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Mobile ───────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full flex-1 bg-background overflow-hidden"
      style={{ height: "calc(100vh - 56px)" }}
    >
      <div className="px-4">
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="absolute top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold"
        >
          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
        </button>
      )}

      <div
        className="h-full overflow-y-auto pb-32 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        {filteredListings.map((item) => {
          const itemDistance =
            activeTab === "nearby" &&
            userLocation !== null &&
            item.latitude !== null &&
            item.longitude !== null
              ? formatDistance(
                  haversine(userLocation, { lat: item.latitude, lng: item.longitude }),
                )
              : null;

          return (
            <MobileListingCard
              key={item.id}
              listing={item}
              isSaved={savedIds.has(item.id)}
              toggleSave={toggleSave}
              distanceBadge={itemDistance}
            />
          );
        })}
      </div>
    </div>
  );
}
