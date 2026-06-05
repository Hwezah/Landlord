"use client";
import PostListingSheet from "@/app/_components/PostListingSheet";
import { useFeedOptional } from "@/app/providers/feed-provider";
import { Home, Plus, Search, SlidersHorizontal, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function BottomNavMobile() {
  const router = useRouter();
  const pathname = usePathname();
  const [postOpen, setPostOpen] = useState(false);

  const feed = useFeedOptional();
  const activeTab = feed?.activeTab ?? "foryou";

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-xl border border-border rounded-full px-3 py-2 shadow-lg">
          {[
            { id: "home", icon: Home },
            { id: "search", icon: Search },
            { id: "post", icon: Plus, primary: true },
            { id: "filter", icon: SlidersHorizontal },
            { id: "account", icon: User },
          ].map(({ id, icon: Icon, primary }) => (
            <button
              key={id}
              onClick={() => {
                if (id === "post") {
                  setPostOpen(true);
                  return;
                }

                if (id === "home") {
                  router.push("/");
                  feed?.setActiveTab("foryou");
                  return;
                }

                if (id === "search") {
                  router.push("/search");
                  return;
                }

                if (id === "filter") {
                  if (pathname !== "/") {
                    router.push("/?filters=1");
                    return;
                  }

                  feed?.setFilters(feed.appliedFilters);
                  feed?.setFilterSheetOpen(true);
                  return;
                }
              }}
              className={`flex items-center justify-center transition-all active:scale-95 ${
                primary
                  ? "w-12 h-10 rounded-full bg-primary text-primary-foreground mx-1"
                  : `w-10 h-10 rounded-full ${
                      (id === "home" &&
                        pathname === "/" &&
                        activeTab === "foryou") ||
                      (id === "search" && pathname === "/search") ||
                      (id === "filter" && feed?.filterSheetOpen)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`
              }`}
            >
              <Icon size={primary ? 22 : 18} />
            </button>
          ))}
        </div>
      </div>

      <PostListingSheet open={postOpen} onOpenChange={setPostOpen} />
    </>
  );
}
