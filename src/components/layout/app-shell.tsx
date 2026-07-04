import Link from "next/link";
import { checkIsAdmin, getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "./sidebar";
import { RightRail } from "./right-rail";
import { MobileNav } from "./mobile-nav";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showRightRail?: boolean;
  headerAction?: React.ReactNode;
};

export async function AppShell({
  children,
  title,
  subtitle,
  showRightRail = true,
  headerAction,
}: AppShellProps) {
  const user = await getCurrentUser();
  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, readAt: null } })
    : 0;
  const isAdmin = user ? checkIsAdmin(user) : false;

  return (
    <div className="app-grid bg-background text-foreground">
      <Sidebar user={user} unreadCount={unreadCount} isAdmin={isAdmin} />
      <div className="min-h-screen pb-16 lg:pb-0">
        {title ? (
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6">
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
              </div>
              {headerAction}
            </div>
          </header>
        ) : null}
        <main className="main-content">{children}</main>
        <footer className="hidden border-t border-border px-4 py-4 text-center text-xs text-subtle lg:block">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-muted">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-muted">
              Privacy
            </Link>
            <Link href="/disclaimer" className="hover:text-muted">
              Disclaimer
            </Link>
            <Link href="/cookies" className="hover:text-muted">
              Cookies
            </Link>
            <Link href="/monetization" className="hover:text-muted">
              Monetization
            </Link>
            <a href="https://icons8.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted">
              Icons by Icons8
            </a>
          </div>
        </footer>
      </div>
      {showRightRail ? <RightRail /> : <div className="hidden lg:block" />}
      <MobileNav />
    </div>
  );
}
