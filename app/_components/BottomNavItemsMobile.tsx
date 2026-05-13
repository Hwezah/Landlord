import {
    House,
    Search,
    PlusSquare,
    Bookmark,
    User,
  } from "lucide-react";
  
  export const navItems = [
    {
      name: "Home",
      href: "/",
      icon: House,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
    },
    {
      name: "Post",
      href: "/post",
      icon: PlusSquare,
    },
    {
      name: "Saved",
      href: "/saved",
      icon: Bookmark,
    },
    {
      name: "Account",
      href: "/account",
      icon: User,
    },
  ];