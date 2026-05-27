"use client";

import { useState } from "react";
import { Home, Search, Plus, Bookmark, User } from "lucide-react";
import PostListingSheet from "@/app/_components/PostListingSheet";
import { useFeed } from "@/app/providers/feed-provider";

export default function BottomNavMobile() {
  const [activeNav, setActiveNav] = useState("home");
  const [postOpen, setPostOpen] = useState(false);

  const { activeTab, setActiveTab } = useFeed();

  return (
    <>
      {/* Raised up like Pinterest — bottom-8 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-xl border border-border rounded-full px-3 py-2 shadow-lg">
          {[
            { id: "home", icon: Home },
            { id: "search", icon: Search },
            { id: "post", icon: Plus, primary: true },
            { id: "saved", icon: Bookmark },
            { id: "account", icon: User },
          ].map(({ id, icon: Icon, primary }) => (
            <button
              key={id}
              onClick={() => {
                if (id === "post") {
                  setPostOpen(true);
                  return;
                }

                setActiveNav(id);

                // ── Feed Tabs Integration ───────────────────────────────
                if (id === "home") {
                  setActiveTab("foryou");
                }

                if (id === "saved") {
                  setActiveTab("saved");
                }
              }}
              className={`flex items-center justify-center transition-all active:scale-95 ${
                primary
                  ? "w-12 h-10 rounded-full bg-primary text-primary-foreground mx-1"
                  : `w-10 h-10 rounded-full ${
                      (id === "home" && activeTab === "foryou") ||
                      (id === "saved" && activeTab === "saved")
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