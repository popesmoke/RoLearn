import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";
import { SkillCategory } from "@prisma/client";
import { skillCategories } from "@/lib/constants";

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

  return (
    <AppShell title="Team Finder" subtitle="Recruit scripters, builders, and designers">
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

      <div className="feed-grid">
        {teamPosts.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <p className="text-lg font-bold">No open team posts</p>
            <p className="mt-2 text-muted">Post a recruitment request from Studio.</p>
            <div className="mt-6">
              <ButtonLink href="/dashboard">Open Studio</ButtonLink>
            </div>
          </div>
        ) : (
          teamPosts.map((post) => (
            <FeedItem
              key={post.id}
              id={post.id}
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
