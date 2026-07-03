"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon8, icons } from "@/components/icon8";
import { ButtonLink } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth-buttons";
import { getHandle, profilePath } from "@/lib/user-display";

const navItems = [
  { href: "/explore", label: "Discover", icon: icons.home },
  { href: "/search", label: "Search", icon: icons.search },
  { href: "/marketplace", label: "Market", icon: icons.marketplace },
  { href: "/teamfinder", label: "Teams", icon: icons.teams },
  { href: "/messages", label: "Messages", icon: icons.messages },
  { href: "/dashboard", label: "Studio", icon: icons.studio },
];

type SidebarProps = {
  user?: {
    username?: string | null;
    robloxUsername?: string | null;
    displayName?: string | null;
    email?: string | null;
  } | null;
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-surface px-3 py-4">
      <Link href="/" className="mb-6 flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-surface-hover">
        <Image src="/logo.png" alt="RoLearn" width={36} height={36} className="rounded-xl" />
        <span className="hidden text-lg font-bold tracking-tight xl:inline">
          Ro<span className="text-accent">Learn</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              <span className="hidden xl:inline">{item.label}</span>
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
            <Icon8 name={icons.user} size={22} />
            <span className="hidden truncate xl:inline">
              @{getHandle(user)}
            </span>
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-3 px-1 pb-2">
        <ButtonLink href="/dashboard" className="hidden w-full xl:flex" size="sm">
          <Icon8 name={icons.plus} size={16} />
          Create
        </ButtonLink>
        <AuthButtons compact />
      </div>
    </aside>
  );
}
