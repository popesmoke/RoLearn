import { prisma } from "@/lib/prisma";
import { postPath } from "@/lib/posts";
import { timeAgo } from "@/lib/utils";
import { getDisplayName, profilePath } from "@/lib/user-display";

export type ActivityItem = {
  id: string;
  type: "post" | "application" | "review" | "follow";
  title: string;
  body?: string;
  link: string;
  createdAt: Date;
  user?: {
    id: string;
    displayName: string | null;
    username?: string | null;
    robloxUsername?: string | null;
    avatarUrl?: string | null;
    email: string;
  };
};

export async function fetchUserActivity(userId: string, limit = 20): Promise<ActivityItem[]> {
  const [services, jobs, teams, applications, reviews] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.jobPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.teamPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, listingType: true, listingId: true, status: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        reviewer: {
          select: {
            id: true,
            displayName: true,
            username: true,
            robloxUsername: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const items: ActivityItem[] = [
    ...services.map((p) => ({
      id: `service-${p.id}`,
      type: "post" as const,
      title: "Published a service",
      body: p.title,
      link: postPath("service", p.id),
      createdAt: p.createdAt,
    })),
    ...jobs.map((p) => ({
      id: `job-${p.id}`,
      type: "post" as const,
      title: "Posted a job",
      body: p.title,
      link: postPath("job", p.id),
      createdAt: p.createdAt,
    })),
    ...teams.map((p) => ({
      id: `team-${p.id}`,
      type: "post" as const,
      title: "Recruiting for team",
      body: p.title,
      link: postPath("team", p.id),
      createdAt: p.createdAt,
    })),
    ...applications.map((a) => ({
      id: `app-${a.id}`,
      type: "application" as const,
      title: `Application ${a.status.toLowerCase()}`,
      body: "Submitted an application",
      link: "/dashboard?tab=posts",
      createdAt: a.createdAt,
    })),
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      type: "review" as const,
      title: `Received ${r.rating}-star review`,
      body: r.comment ?? undefined,
      link: profilePath({ username: null, robloxUsername: null }),
      createdAt: r.createdAt,
      user: r.reviewer,
    })),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export async function fetchFollowingActivity(userId: string, limit = 30): Promise<ActivityItem[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const ids = following.map((f) => f.followingId);
  if (ids.length === 0) return [];

  const items: ActivityItem[] = [];
  for (const fid of ids.slice(0, 20)) {
    const batch = await fetchUserActivity(fid, 3);
    items.push(...batch);
  }
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export async function getActiveAnnouncements() {
  return prisma.announcement.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
    take: 5,
  });
}
