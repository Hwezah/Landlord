import { getListings, getDistinctLocations } from "@/app/actions/listings";
import { FeedProvider } from "@/app/providers/feed-provider";
import HomeClient from "@/app/_components/HomeClient";

export default async function Home() {
  // Run both fetches in parallel — no reason to wait for one before the other.
  const [listings, locations] = await Promise.all([
    getListings(),
    getDistinctLocations(),
  ]);

  return (
    <FeedProvider listings={listings} locations={locations}>
      <HomeClient />
    </FeedProvider>
  );
}