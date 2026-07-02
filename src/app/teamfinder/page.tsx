import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TeamFinderPage() {
  const teamPosts = await prisma.teamPost.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { displayName: true, email: true, avatarUrl: true } } },
    take: 50,
  });

  return (
    <AppShell title="Team Finder">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Find scripters, builders, designers, and animators for your next game.
          </p>
          <ButtonLink href="/dashboard" size="sm" variant="outline">
            Recruit
          </ButtonLink>
        </div>
      </div>

      <div className="feed-divider">
        {teamPosts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-semibold">No open team posts</p>
            <p className="mt-2 text-muted">Post a recruitment request from Studio.</p>
            <div className="mt-6">
              <ButtonLink href="/dashboard">Open Studio</ButtonLink>
            </div>
          </div>
        ) : (
          teamPosts.map((post) => (
            <FeedItem
              key={post.id}
              type="team"
              title={post.title}
              description={post.description}
              author={post.author}
              createdAt={post.createdAt}
              category={post.neededRole}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
