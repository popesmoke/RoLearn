"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon8, type IconName } from "@/components/icons";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/explore", label: "Feed", icon: "live" },
  { href: "/compose", label: "Post", icon: "plus" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/notifications", label: "Alerts", icon: "bell" },
  { href: "/messages", label: "Chat", icon: "messages" },
];

type MobileNavProps = {
  isStaff?: boolean;
  isOwner?: boolean;
};

export function MobileNav({ isStaff = false, isOwner = false }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = isStaff
    ? [
        ...items.slice(0, 4),
        { href: "/admin", label: isOwner ? "Owner" : "Admin", icon: "studio" as IconName },
      ]
    : items;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
      <div className="flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon8 name={item.icon} size={22} className={active ? "text-accent" : ""} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
