"use client";

import { postListing, uploadPhoto } from "@/app/actions/post-listing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

type PropertyType = "house" | "office" | "shop";

const ROOM_TYPES = [
  { value: "single_room", label: "Single Room" },
  { value: "double_room", label: "Double Room" },
  { value: "self_contained", label: "Self-Contained" },
  { value: "studio_room", label: "Studio Room" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "maisonette", label: "Maisonette" },
  { value: "airbnb", label: "Airbnb" },
] as const;

const SHOP_TYPES = [
  { value: "whole_shop", label: "Whole Shop" },
  { value: "stall", label: "Stall / Subrent" },
] as const;

const AMENITIES = [
  { value: "furnished", label: "Furnished" },
  { value: "parking", label: "Parking" },
  { value: "security", label: "Security" },
  { value: "wifi", label: "WiFi" },
  { value: "generator", label: "Generator" },
  { value: "borehole", label: "Borehole" },
  { value: "water_24hr", label: "24hr Water" },
  { value: "yaka", label: "Yaka" },
] as const;

// ── Chip component — reused for room types, shop types, amenities ─────────────
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        selected
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
function PostListingForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState<PropertyType>("house");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"per_month" | "per_night">(
    "per_month",
  );
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");
  const [shopType, setShopType] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleAmenity(value: string) {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  }

  // When property type changes, clear type-specific selections
  function handleTypeChange(t: PropertyType) {
    setType(t);
    setRoomType("");
    setShopType("");
    setAmenities([]);
    // Reset price type unless house+airbnb stays selected
    setPriceType("per_month");
  }

  // When room type changes, reset price type unless airbnb
  function handleRoomTypeChange(value: string) {
    setRoomType(value);
    if (value !== "airbnb") setPriceType("per_month");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (photos.length + files.length > 6) {
      setError("Maximum 6 photos allowed");
      return;
    }
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const uploadFile = new File([compressedFile], file.name, {
          type: compressedFile.type || file.type,
        });
        const url = await uploadPhoto(uploadFile);
        if (url) uploaded.push(url);
      } catch (uploadError) {
        console.error("Compression/upload error:", uploadError);
      }
    }
    setPhotos((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) return setError("Please add a title");
    if (!price || isNaN(Number(price)))
      return setError("Please enter a valid price");
    if (!location.trim()) return setError("Please add a location");
    if (!phone.trim()) return setError("Please add a contact number");
    if (pin.length !== 4 || isNaN(Number(pin)))
      return setError("PIN must be exactly 4 digits");
    if (photos.length === 0)
      return setError("Please upload at least one photo");

    setSubmitting(true);
    const result = await postListing({
      type,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location_name: location.trim(),
      room_type: type === "house" ? roomType || null : null,
      shop_type: type === "shop" ? shopType || null : null,
      price_type: priceType,
      amenities,
      phone_number: phone.trim(),
      pin,
      photos,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    setSuccess(true);
    setTimeout(() => onSuccess(), 2000);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl">
          ✓
        </div>
        <p className="text-foreground font-bold text-lg">Listing posted!</p>
        <p className="text-muted-foreground text-sm text-center">
          Your listing is now live and visible to tenants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Property Type ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Property type
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["house", "office", "shop"] as PropertyType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                type === t
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t === "house" ? "House" : t === "office" ? "Office" : "Shop"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Room Type (houses only) ────────────────────────────────────────── */}
      {type === "house" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Room type</p>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                selected={roomType === value}
                onClick={() => handleRoomTypeChange(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Shop Type (shops only) ────────────────────────────────────────── */}
      {type === "shop" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Shop type</p>
          <div className="flex flex-wrap gap-2">
            {SHOP_TYPES.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                selected={shopType === value}
                onClick={() => setShopType(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Photos ────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Photos{" "}
          <span className="text-muted-foreground font-normal">
            ({photos.length}/6)
          </span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((url, i) => (
            <div key={i} className="relative w-20 h-20">
              <img
                src={url}
                alt=""
                className="w-20 h-20 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-all"
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <ImagePlus size={20} />
                  <span className="text-[10px] font-medium">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Title</p>
        <Input
          placeholder="e.g. Self Contained in Ntinda"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary py-5"
        />
      </div>

      {/* ── Price ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          {roomType === "airbnb" ? "Price (UGX)" : "Monthly price (UGX)"}
        </p>
        <Input
          type="number"
          placeholder={roomType === "airbnb" ? "e.g. 80000" : "e.g. 450000"}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-auto rounded-xl bg-muted border-transparent py-5 focus:border-border focus-visible:ring-primary"
        />
        {/* Price type toggle — only visible for Airbnb */}
        {roomType === "airbnb" && (
          <div className="flex gap-2 mt-2">
            {(["per_month", "per_night"] as const).map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setPriceType(pt)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  priceType === pt
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {pt === "per_month" ? "Per Month" : "Per Night"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Location ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Location</p>
        <Input
          placeholder="e.g. Ntinda, Kampala"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-auto rounded-xl bg-muted border-transparent py-5 focus:border-border focus-visible:ring-primary"
        />
      </div>

      {/* ── Amenities (houses only) ───────────────────────────────────────── */}
      {type === "house" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Amenities{" "}
            <span className="text-muted-foreground font-normal">
              (optional)...Tap everything that applies!
            </span>
          </p>
          {/* <p className="text-xs text-muted-foreground mb-3">
            Tap everything that applies
          </p> */}
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                selected={amenities.includes(value)}
                onClick={() => toggleAmenity(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Description ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </p>
        <textarea
          placeholder="Describe the space — nearby landmarks, access road, any extra details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all border border-transparent focus:border-border resize-none text-sm"
        />
      </div>

      {/* ── Phone ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Contact phone number
        </p>
        <Input
          type="tel"
          placeholder="e.g. 0772 123 456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary py-5"
        />
        <p className="text-muted-foreground text-xs mt-1.5">
          This number will be visible to tenants
        </p>
      </div>

      {/* ── PIN ───────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Create a 4-digit PIN
        </p>
        <Input
          type="password"
          placeholder="····"
          maxLength={4}
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary tracking-widest text-center text-lg py-5"
        />
        <p className="text-muted-foreground text-xs mt-1.5">
          You will need this PIN to edit or delete your listing later
        </p>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || uploading}
        className="w-full rounded-2xl py-6 text-base font-bold gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Posting...
          </>
        ) : (
          "Post Listing"
        )}
      </Button>
    </div>
  );
}

// ── Shell (Sheet on mobile, Dialog on desktop) ────────────────────────────────
export default function PostListingSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  function handleSuccess() {
    onOpenChange(false);
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[92vh] overflow-y-auto px-5 pb-10"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="w-9 h-1 rounded-full bg-border mx-auto mb-5" />
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-foreground">
              Post a listing
            </SheetTitle>
          </SheetHeader>
          <PostListingForm onSuccess={handleSuccess} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl overflow-hidden p-0"
        style={{
          width: "560px",
          maxWidth: "90vw",
          maxHeight: "75vh",
          overflowX: "hidden",
        }}
      >
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "75vh", scrollbarWidth: "none" }}
        >
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-foreground">
              Post a listing
            </DialogTitle>
          </DialogHeader>
          <PostListingForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
