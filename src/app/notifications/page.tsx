import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { markNotificationsRead } from "@/app/actions/interactions";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Icon8 } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <AppShell title="Notifications" subtitle={unread ? `${unread} unread` : "All caught up"}>
      <div className="p-4">
        {unread > 0 ? (
          <form action={markNotificationsRead} className="mb-4">
            <button type="submit" className="text-sm text-accent hover:underline">
              Mark all as read
            </button>
          </form>
        ) : null}

        {notifications.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <Icon8 name="bell" size={48} className="mx-auto mb-4 opacity-50 text-muted" />
            <p className="font-bold">No notifications yet</p>
            <p className="mt-2 text-sm text-muted">Messages and activity will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                className={`surface-panel block p-4 transition hover:border-accent/30 ${
                  !n.readAt ? "border-accent/20 bg-accent/5" : ""
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                {n.body ? <p className="mt-1 text-sm text-muted">{n.body}</p> : null}
                <p className="mt-2 text-xs text-subtle">{timeAgo(n.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
