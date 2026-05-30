import { getListingById, getListingBySlug } from "@/app/actions/listings";
import ListingPageClient from "./ListingPageClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// ── Resolve slug or UUID → listing ────────────────────────────────────────
// The [id] segment can be either:
//   - a slug:  "self-contained-in-kiwatule-a3f2"  (new links)
//   - a UUID:  "f4739f7b-42b9-430f-8790-7b440661962e"  (old links)
// We try slug first (fast exact match), then fall back to UUID.
// This means every old shared link continues to work forever.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveListing(idOrSlug: string) {
  if (UUID_RE.test(idOrSlug)) {
    // Looks like a UUID — go straight to ID lookup
    return getListingById(idOrSlug);
  }
  // Treat as slug
  return getListingBySlug(idOrSlug);
}

// ── Dynamic metadata ───────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await resolveListing(id);

  if (!listing) {
    return {
      title: "Listing not found | Landlord",
      description: "This listing is no longer available.",
    };
  }

  const typeLabel =
    listing.type === "house"
      ? "House"
      : listing.type === "office"
        ? "Office Space"
        : "Shop Space";

  const price = `UGX ${listing.price.toLocaleString()}/month`;
  const title = `${listing.title} — ${typeLabel} in ${listing.location_name} | Landlord`;
  const description = listing.description
    ? `${listing.description.slice(0, 140)}…`
    : `${typeLabel} available in ${listing.location_name} for ${price}. Find your next space on Landlord.`;

  // Canonical URL always uses the slug if available, otherwise the UUID
  const canonicalSlug = listing.slug ?? listing.id;
  const url = `https://landlord-bay.vercel.app/listing/${canonicalSlug}`;

  const ogImage = listing.photos?.[0]
    ? [{ url: listing.photos[0], width: 1200, height: 630, alt: listing.title }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Landlord",
      type: "website",
      images: ogImage,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [listing.photos[0]] : undefined,
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await resolveListing(id);

  if (!listing) return notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={15}
              strokeWidth={2}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-foreground font-medium truncate">
            {listing.title}
          </span>
        </div>
      </header>

      <ListingPageClient listing={listing} />
    </div>
  );
}
