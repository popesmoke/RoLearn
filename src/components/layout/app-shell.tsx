import { getCurrentUser } from "@/lib/user";
import { Sidebar } from "./sidebar";
import { RightRail } from "./right-rail";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  showRightRail?: boolean;
};

export async function AppShell({
  children,
  title,
  showRightRail = true,
}: AppShellProps) {
  const user = await getCurrentUser();

  return (
    <div className="app-grid bg-background text-foreground">
      <Sidebar displayName={user?.displayName ?? user?.email} />
      <div className="min-h-screen border-r border-border">
        {title ? (
          <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
          </header>
        ) : null}
        <main>{children}</main>
      </div>
      {showRightRail ? <RightRail /> : <div className="hidden lg:block" />}
    </div>
  );
}
