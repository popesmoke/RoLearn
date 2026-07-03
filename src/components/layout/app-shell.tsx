import { getCurrentUser } from "@/lib/user";
import { Sidebar } from "./sidebar";
import { RightRail } from "./right-rail";

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

  return (
    <div className="app-grid bg-background text-foreground">
      <Sidebar user={user} />
      <div className="min-h-screen">
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
      </div>
      {showRightRail ? <RightRail /> : <div className="hidden lg:block" />}
    </div>
  );
}
