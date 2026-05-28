import { getListings } from "@/app/actions/listings";
import { FeedProvider } from "@/app/providers/feed-provider";
import SearchClient from "@/app/search/SearchClient";

export default async function SearchPage() {
  const listings = await getListings();

  return (
    <FeedProvider listings={listings}>
      <SearchClient />
    </FeedProvider>
  );
}
