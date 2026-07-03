import Link from "next/link";
import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { LiveFeed } from "@/components/feed/live-feed";
import { QuickCompose } from "@/components/compose/quick-compose";
import { FeedGuide } from "@/components/feed/feed-guide";
import { ButtonLink } from "@/components/ui/button";
import { Icon8 } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const user = await getCurrentUser();
  const feed = await fetchFeed({ limit: 20, userId: user?.id });
  const initialItems = serializeFeed(feed);

  return (
    <AppShell
      title="Live feed"
      subtitle="Services · Jobs · Teams — updated in real time"
      headerAction={
        <ButtonLink href="/compose" size="sm" className="gap-1.5">
          <Icon8 name="plus" size={16} />
          New post
        </ButtonLink>
      }
    >
      <FeedGuide />
      <QuickCompose />
      <LiveFeed initialItems={initialItems} />

      <div className="px-4 py-6 text-center text-sm text-muted">
        <Link href="/marketplace" className="text-accent hover:underline">
          Marketplace
        </Link>
        {" · "}
        <Link href="/teamfinder" className="text-accent hover:underline">
          Find teammates
        </Link>
        {" · "}
        <Link href="/dashboard?tab=posts" className="text-accent hover:underline">
          Your posts
        </Link>
      </div>
    </AppShell>
  );
}
