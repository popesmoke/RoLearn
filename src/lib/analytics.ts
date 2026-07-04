import { ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function trackPostView(
  listingType: ListingType,
  listingId: string,
  viewerId?: string,
) {
  await prisma.$transaction([
    prisma.postView.create({
      data: { listingType, listingId, viewerId: viewerId ?? null },
    }),
    listingType === "SERVICE"
      ? prisma.serviceOffer.update({
          where: { id: listingId },
          data: { viewCount: { increment: 1 } },
        })
      : listingType === "JOB"
        ? prisma.jobPost.update({
            where: { id: listingId },
            data: { viewCount: { increment: 1 } },
          })
        : prisma.teamPost.update({
            where: { id: listingId },
            data: { viewCount: { increment: 1 } },
          }),
  ]);
}

export async function trackProfileView(profileId: string, viewerId?: string) {
  if (viewerId === profileId) return;
  await prisma.profileView.create({
    data: { profileId, viewerId: viewerId ?? null },
  });
}

export async function getCreatorAnalytics(userId: string) {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [services, jobs, teams, profileViews] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: { userId },
      select: { id: true, viewCount: true, title: true },
    }),
    prisma.jobPost.findMany({
      where: { authorId: userId },
      select: { id: true, viewCount: true, title: true },
    }),
    prisma.teamPost.findMany({
      where: { authorId: userId },
      select: { id: true, viewCount: true, title: true },
    }),
    prisma.profileView.count({
      where: { profileId: userId, createdAt: { gte: since30 } },
    }),
  ]);

  const listingIds = {
    SERVICE: services.map((s) => s.id),
    JOB: jobs.map((j) => j.id),
    TEAM: teams.map((t) => t.id),
  };

  const applicationCount = await prisma.application.count({
    where: {
      OR: [
        { listingType: "SERVICE", listingId: { in: listingIds.SERVICE } },
        { listingType: "JOB", listingId: { in: listingIds.JOB } },
        { listingType: "TEAM", listingId: { in: listingIds.TEAM } },
      ],
      createdAt: { gte: since30 },
    },
  });

  const totalViews =
    services.reduce((s, p) => s + p.viewCount, 0) +
    jobs.reduce((s, p) => s + p.viewCount, 0) +
    teams.reduce((s, p) => s + p.viewCount, 0);

  const topPosts = [...services, ...jobs, ...teams]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return {
    totalViews,
    profileViews30d: profileViews,
    applications30d: applicationCount,
    postCount: services.length + jobs.length + teams.length,
    topPosts,
  };
}
