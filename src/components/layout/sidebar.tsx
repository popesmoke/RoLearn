"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon8, type IconName } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth-buttons";
import { getHandle, profilePath } from "@/lib/user-display";

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: "/explore", label: "Live feed", icon: "live" },
  { href: "/compose", label: "Create", icon: "compose" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/marketplace", label: "Market", icon: "marketplace" },
  { href: "/teamfinder", label: "Teams", icon: "teams" },
  { href: "/messages", label: "Messages", icon: "messages" },
  { href: "/notifications", label: "Alerts", icon: "bell" },
  { href: "/dashboard", label: "Studio", icon: "studio" },
];

type SidebarProps = {
  user?: {
    username?: string | null;
    robloxUsername?: string | null;
    displayName?: string | null;
    email?: string | null;
  } | null;
  unreadCount?: number;
};

export function Sidebar({ user, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface px-3 py-4 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-surface-hover">
        <Image src="/logo.svg" alt="RoLearn" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-bold tracking-tight">
          Ro<span className="text-accent">Learn</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showBadge = item.href === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition",
                active
                  ? "nav-active font-semibold"
                  : "font-medium text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon8 name={item.icon} size={22} />
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}

        {user ? (
          <Link
            href={profilePath(user)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition",
              pathname.startsWith("/u/")
                ? "nav-active font-semibold"
                : "font-medium text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <Icon8 name="user" size={22} />
            <span className="truncate">@{getHandle(user)}</span>
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-3 px-1 pb-2">
        <ButtonLink href="/compose" className="w-full gap-2" size="sm">
          <Icon8 name="plus" size={16} />
          New post
        </ButtonLink>
        <AuthButtons compact />
      </div>
    </aside>
  );
}
