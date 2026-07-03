import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";
import { Icon8 } from "@/components/icons";
import { SkillCategory } from "@prisma/client";
import { skillCategories } from "@/lib/constants";
import { feedTypeToListing, getLikeCounts, getUserLikedSet } from "@/lib/likes";
import { getCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
} as const;

type PageProps = {
  searchParams: Promise<{ skill?: string }>;
};

export default async function TeamFinderPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { skill } = await searchParams;
  const skillFilter = skill && skillCategories.includes(skill as (typeof skillCategories)[number])
    ? (skill as SkillCategory)
    : undefined;

  const teamPosts = await prisma.teamPost.findMany({
    where: {
      isOpen: true,
      ...(skillFilter ? { neededRole: skillFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: authorSelect } },
    take: 50,
  });

  const refs = teamPosts.map((p) => ({ type: feedTypeToListing("team"), id: p.id }));
  const [likeMap, likedSet] = await Promise.all([
    getLikeCounts(refs),
    getUserLikedSet(user?.id, refs),
  ]);

  return (
    <AppShell title="Team Finder" subtitle="Recruit scripters, builders, and designers">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Find scripters, builders, designers, and animators for your next game.
          </p>
          <ButtonLink href="/compose" size="sm" className="gap-1.5">
            <Icon8 name="plus" size={16} />
            Recruit
          </ButtonLink>
        </div>
      </div>

      <div className="feed-grid">
        {teamPosts.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <Icon8 name="teams" size={48} className="mx-auto mb-4 opacity-50 text-muted" />
            <p className="text-lg font-bold">No open team posts</p>
            <p className="mt-2 text-muted">Post a recruitment request in seconds.</p>
            <div className="mt-6">
              <ButtonLink href="/compose">Create post</ButtonLink>
            </div>
          </div>
        ) : (
          teamPosts.map((post) => {
            const key = `TEAM-${post.id}`;
            return (
              <FeedItem
                key={post.id}
                id={post.id}
                type="team"
                title={post.title}
                description={post.description}
                author={post.author}
                createdAt={post.createdAt}
                category={post.neededRole}
                mediaUrls={post.mediaUrls}
                likeCount={likeMap.get(key) ?? 0}
                likedByMe={likedSet.has(key)}
              />
            );
          })
        )}
      </div>
    </AppShell>
  );
}
