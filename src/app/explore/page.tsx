import Link from "next/link";
import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { LiveFeed } from "@/components/feed/live-feed";
import { QuickCompose } from "@/components/compose/quick-compose";
import { ButtonLink } from "@/components/ui/button";
import { Icon8 } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const user = await getCurrentUser();
  const feed = await fetchFeed(40, undefined, user?.id);
  const initialItems = serializeFeed(feed);

  return (
    <AppShell
      title="Live feed"
      subtitle="Real-time updates from creators worldwide"
      headerAction={
        <ButtonLink href="/compose" size="sm" className="gap-1.5">
          <Icon8 name="plus" size={16} />
          Post
        </ButtonLink>
      }
    >
      <QuickCompose />
      <LiveFeed initialItems={initialItems} />

      <div className="px-4 py-6 text-center text-sm text-muted">
        <Link href="/marketplace" className="text-accent hover:underline">
          Marketplace
        </Link>
        {" · "}
        <Link href="/teamfinder" className="text-accent hover:underline">
          Teams
        </Link>
        {" · "}
        <Link href="/compose" className="text-accent hover:underline">
          Full editor
        </Link>
      </div>
    </AppShell>
  );
}
