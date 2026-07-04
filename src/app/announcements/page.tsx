import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getActiveAnnouncements } from "@/lib/activity";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getActiveAnnouncements();

  return (
    <AppShell title="Announcements" subtitle="Platform news and updates">
      <div className="space-y-3 p-4">
        {announcements.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center text-muted">
            No announcements right now. Check back later.
          </div>
        ) : (
          announcements.map((a) => (
            <article key={a.id} className="surface-panel p-5">
              <p className="text-xs text-subtle">{timeAgo(a.publishedAt)}</p>
              <h2 className="mt-1 text-lg font-bold">{a.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-muted">{a.body}</p>
              {a.link ? (
                <Link href={a.link} className="mt-3 inline-block text-sm text-accent hover:underline">
                  Learn more
                </Link>
              ) : null}
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}
