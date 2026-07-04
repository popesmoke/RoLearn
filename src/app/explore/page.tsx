import Link from "next/link";
import { Suspense } from "react";
import { PaymentCurrency, SkillCategory } from "@prisma/client";
import { fetchFeed, fetchFeaturedPosts, fetchRecommendedPosts, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";
import { getFollowingIds } from "@/app/actions/follows";
import { getActiveAnnouncements } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { LiveFeed } from "@/components/feed/live-feed";
import { QuickCompose } from "@/components/compose/quick-compose";
import { FeedGuide } from "@/components/feed/feed-guide";
import { FeedFilters } from "@/components/feed/feed-filters";
import { FeaturedSpotlight, RecommendedSection } from "@/components/feed/featured-spotlight";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    type?: string;
    skill?: string;
    currency?: string;
    verified?: string;
    following?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const followingIds =
    params.following === "1" && user ? await getFollowingIds(user.id) : undefined;

  const feed = await fetchFeed({
    limit: 20,
    userId: user?.id,
    type:
      params.type === "service" || params.type === "job" || params.type === "team"
        ? params.type
        : undefined,
    skill: params.skill as SkillCategory | undefined,
    currency: params.currency as PaymentCurrency | undefined,
    verifiedOnly: params.verified === "1",
    followingIds,
  });

  const [featured, recommended, announcements, onboardingStats] = await Promise.all([
    fetchFeaturedPosts(3),
    user ? fetchRecommendedPosts(user.id, 3) : Promise.resolve([]),
    getActiveAnnouncements(),
    user
      ? Promise.all([
          prisma.userSkill.count({ where: { userId: user.id } }),
          prisma.serviceOffer.count({ where: { userId: user.id } }),
          prisma.application.count({ where: { applicantId: user.id } }),
        ])
      : Promise.resolve([0, 0, 0]),
  ]);

  const initialItems = serializeFeed(feed);

  return (
    <AppShell
      title="Live feed"
      subtitle="Services · Jobs · Teams — updated in real time"
      headerAction={
        <ButtonLink href="/compose" size="sm" className="gap-1.5">
          New post
        </ButtonLink>
      }
    >
      <AnnouncementBanner
        announcements={announcements.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          link: a.link,
        }))}
      />
      {user && !user.onboardingDone ? (
        <OnboardingChecklist
          onboardingDone={user.onboardingDone}
          hasLinkedRoblox={Boolean(user.robloxUserId)}
          hasSkill={onboardingStats[0] > 0}
          hasPost={onboardingStats[1] > 0}
          hasApplied={onboardingStats[2] > 0}
        />
      ) : null}
      <FeedGuide />
      <FeaturedSpotlight posts={serializeFeed(featured)} />
      {user ? <RecommendedSection posts={serializeFeed(recommended)} /> : null}
      <Suspense fallback={null}>
        <FeedFilters />
      </Suspense>
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
        {" · "}
        <Link href="/bookmarks" className="text-accent hover:underline">
          Saved
        </Link>
      </div>
    </AppShell>
  );
}
