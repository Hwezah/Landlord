import Link from "next/link";
import { navItems } from "./BottomNavItemsMobile";

export default function BottomNavMobile() {
  return (
    <nav className="flex justify-around items-center h-16 border-t">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center"
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}