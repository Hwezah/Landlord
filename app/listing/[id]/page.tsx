// app/listing/[id]/page.tsx
import { getListingById } from "@/app/actions/listings";
import ListingPageClient from "./ListingPageClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15+, params is a Promise — must be awaited first
  const { id } = await params;
  const listing = await getListingById(id);

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

