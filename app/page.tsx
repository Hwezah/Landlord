import { getListings } from "@/app/actions/listings";
import { FeedProvider } from "@/app/providers/feed-provider";
import HomeClient from "@/app/_components/HomeClient";

export default async function Home() {
  const listings = await getListings();

  return (
    <FeedProvider listings={listings}>
      <HomeClient />
    </FeedProvider>
  );
}