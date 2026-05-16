import { getListings } from "@/app/actions/listings";
import HomeClient from "@/app/_components/HomeClient";

export default async function Home() {
  const listings = await getListings();
  return <HomeClient listings={listings} />;
}