import { getCurrentUser } from "@/lib/user";
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

  return (
    <div className="app-grid bg-background text-foreground">
      <Sidebar user={user} unreadCount={unreadCount} />
      <div className="min-h-screen pb-16 lg:pb-0">
        {title ? (
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
              </div>
              {headerAction}
            </div>
          </header>
        ) : null}
        <main>{children}</main>
        <footer className="hidden border-t border-border px-4 py-3 text-center text-xs text-subtle lg:block">
          <a href="https://icons8.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted">
            Icons by Icons8
          </a>
        </footer>
      </div>
      {showRightRail ? <RightRail /> : <div className="hidden lg:block" />}
      <MobileNav />
    </div>
  );
}
