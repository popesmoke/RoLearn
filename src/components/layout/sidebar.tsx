"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon8, type IconName } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth-buttons";
import { ThemeToggle } from "@/components/theme-toggle";
import { getHandle, profilePath } from "@/lib/user-display";

const primaryNav: { href: string; label: string; icon: IconName }[] = [
  { href: "/explore", label: "Live feed", icon: "live" },
  { href: "/compose", label: "Create", icon: "compose" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/marketplace", label: "Market", icon: "marketplace" },
  { href: "/teamfinder", label: "Teams", icon: "teams" },
];

const secondaryNav: { href: string; label: string; icon: IconName }[] = [
  { href: "/activity", label: "Activity", icon: "refresh" },
  { href: "/bookmarks", label: "Saved", icon: "star" },
  { href: "/announcements", label: "News", icon: "bell" },
  { href: "/messages", label: "Messages", icon: "messages" },
  { href: "/notifications", label: "Alerts", icon: "bell" },
  { href: "/dashboard", label: "Studio", icon: "studio" },
];

type SidebarProps = {
  user?: {
    id?: string;
    username?: string | null;
    robloxUsername?: string | null;
    displayName?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  unreadCount?: number;
  isAdmin?: boolean;
};

function NavLink({
  item,
  pathname,
  unreadCount,
}: {
  item: (typeof primaryNav)[number];
  pathname: string;
  unreadCount: number;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const showBadge = item.href === "/notifications" && unreadCount > 0;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition",
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
}

export function Sidebar({ user, unreadCount = 0, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface-hover">
        <Image src="/logo.png" alt="RoLearn" width={40} height={40} className="rounded-xl" />
        <span className="text-lg font-bold tracking-tight">
          Ro<span className="text-accent">Learn</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-subtle">Browse</p>
        {primaryNav.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} unreadCount={unreadCount} />
        ))}

        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-subtle">You</p>
        {secondaryNav.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} unreadCount={unreadCount} />
        ))}

        {user ? (
          <Link
            href={profilePath(user)}
            className={cn(
              "mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition",
              pathname.startsWith("/u/")
                ? "nav-active font-semibold"
                : "font-medium text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <Icon8 name="user" size={22} />
            <span className="truncate">@{getHandle(user)}</span>
          </Link>
        ) : null}

        {isAdmin ? (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition",
              pathname.startsWith("/admin")
                ? "nav-active font-semibold"
                : "font-medium text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <Icon8 name="studio" size={22} />
            <span>Admin</span>
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-3 px-1 pb-2 pt-4">
        <ThemeToggle />
        <ButtonLink href="/compose" className="w-full gap-2" size="sm">
          <Icon8 name="plus" size={16} />
          New post
        </ButtonLink>
        <AuthButtons compact />
      </div>
    </aside>
  );
}
