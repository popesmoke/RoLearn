"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  HomeIcon,
  LayoutIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth-buttons";

const navItems = [
  { href: "/explore", label: "Home", icon: HomeIcon },
  { href: "/marketplace", label: "Marketplace", icon: BriefcaseIcon },
  { href: "/teamfinder", label: "Teams", icon: UsersIcon },
  { href: "/dashboard", label: "Studio", icon: LayoutIcon },
];

type SidebarProps = {
  displayName?: string | null;
};

export function Sidebar({ displayName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-border px-3 py-3 lg:px-4">
      <Link href="/" className="mb-2 flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-surface-hover">
        <Image src="/logo.png" alt="RoLearn" width={32} height={32} className="rounded-lg" />
        <span className="hidden text-lg font-bold tracking-tight xl:inline">RoLearn</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-full px-3 py-3 text-[15px] transition",
                active
                  ? "font-bold text-foreground"
                  : "font-medium text-foreground/80 hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon className={cn("h-[26px] w-[26px]", active && "stroke-[2.5]")} />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          );
        })}

        {displayName ? (
          <Link
            href="/dashboard"
            className={cn(
              "group flex items-center gap-4 rounded-full px-3 py-3 text-[15px] transition",
              pathname === "/dashboard"
                ? "font-bold text-foreground"
                : "font-medium text-foreground/80 hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <UserIcon className="h-[26px] w-[26px]" />
            <span className="hidden truncate xl:inline">{displayName}</span>
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-3 px-1 pb-2">
        <ButtonLink href="/dashboard" className="hidden w-full xl:flex">
          Create
        </ButtonLink>
        <div className="xl:hidden">
          <AuthButtons compact />
        </div>
      </div>
    </aside>
  );
}
