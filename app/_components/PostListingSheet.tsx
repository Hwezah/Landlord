"use client";

import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postListing, uploadPhoto } from "@/app/actions/post-listing";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImagePlus, X, Loader2 } from "lucide-react";

type PropertyType = "house" | "office" | "shop";

type PostListingSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const typeLabels: Record<PropertyType, string> = {
  house: "House",
  office: "Office",
  shop: "Shop",
};

function PostListingForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState<PropertyType>("house");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      const url = await uploadPhoto(file);
      if (url) uploaded.push(url);
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
    if (!price || isNaN(Number(price))) return setError("Please enter a valid price");
    if (!location.trim()) return setError("Please add a location");
    if (!phone.trim()) return setError("Please add a contact number");
    if (pin.length !== 4 || isNaN(Number(pin))) return setError("PIN must be exactly 4 digits");
    if (photos.length === 0) return setError("Please upload at least one photo");

    setSubmitting(true);
    const result = await postListing({
      type,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location_name: location.trim(),
      rooms: rooms ? Number(rooms) : null,
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
    <div className="space-y-5">

      {/* Property Type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Property type</p>
        <div className="grid grid-cols-3 gap-2">
          {(["house", "office", "shop"] as PropertyType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === t
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Photos <span className="text-muted-foreground font-normal">({photos.length}/6)</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((url, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
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

      {/* Title */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Title</p>
        <Input
          placeholder="e.g. Self Contained in Ntinda"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary"
        />
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Monthly price (UGX)</p>
        <Input
          type="number"
          placeholder="e.g. 450000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary"
        />
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Location</p>
        <Input
          placeholder="e.g. Ntinda, Kampala"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary"
        />
      </div>

      {/* Rooms */}
      {type === "house" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Number of rooms</p>
          <div className="grid grid-cols-4 gap-2">
            {["1", "2", "3", "4+"].map((r) => (
              <button
                key={r}
                onClick={() => setRooms(r === "4+" ? "4" : r)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  rooms === (r === "4+" ? "4" : r)
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </p>
        <textarea
          placeholder="Describe the space — security, water, parking, nearby landmarks..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all border border-transparent focus:border-border resize-none text-sm"
        />
      </div>

      {/* Phone */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Contact phone number</p>
        <Input
          type="tel"
          placeholder="e.g. 0772 123 456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary"
        />
        <p className="text-muted-foreground text-xs mt-1.5">
          This number will be visible to tenants
        </p>
      </div>

      {/* PIN */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Create a 4-digit PIN</p>
        <Input
          type="password"
          placeholder="e.g. 1234"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="rounded-xl bg-muted border-transparent focus:border-border focus-visible:ring-primary tracking-widest text-center text-lg"
        />
        <p className="text-muted-foreground text-xs mt-1.5">
          You will need this PIN to edit or delete your listing later
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
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

export default function PostListingSheet({ open, onOpenChange }: PostListingSheetProps) {
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
        style={{ width: "560px", maxWidth: "90vw", maxHeight: "75vh", overflowX: "hidden" }}
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