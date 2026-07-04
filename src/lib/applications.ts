import { ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InboxApplication } from "@/components/dashboard/applications-inbox";

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
} as const;

export async function fetchIncomingApplications(userId: string): Promise<InboxApplication[]> {
  const [services, jobs, teams] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: { userId },
      select: { id: true, title: true },
    }),
    prisma.jobPost.findMany({
      where: { authorId: userId },
      select: { id: true, title: true },
    }),
    prisma.teamPost.findMany({
      where: { authorId: userId },
      select: { id: true, title: true },
    }),
  ]);

  const titleMap = new Map<string, string>();
  for (const s of services) titleMap.set(`SERVICE-${s.id}`, s.title);
  for (const j of jobs) titleMap.set(`JOB-${j.id}`, j.title);
  for (const t of teams) titleMap.set(`TEAM-${t.id}`, t.title);

  const listingIds = [
    ...services.map((s) => s.id),
    ...jobs.map((j) => j.id),
    ...teams.map((t) => t.id),
  ];

  if (listingIds.length === 0) return [];

  const applications = await prisma.application.findMany({
    where: { listingId: { in: listingIds } },
    include: { applicant: { select: authorSelect } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return applications.map((app) => ({
    id: app.id,
    status: app.status,
    message: app.message,
    createdAt: app.createdAt.toISOString(),
    listingType: app.listingType,
    listingId: app.listingId,
    listingTitle: titleMap.get(`${app.listingType}-${app.listingId}`) ?? "Your post",
    applicant: app.applicant,
  }));
}

export async function verifyApplicationOwner(applicationId: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!app) return null;

  const listing = await getListingOwner(app.listingType, app.listingId);
  if (!listing || listing.ownerId !== userId) return null;
  return app;
}

async function getListingOwner(listingType: ListingType, listingId: string) {
  if (listingType === "SERVICE") {
    const row = await prisma.serviceOffer.findUnique({
      where: { id: listingId },
      select: { userId: true, title: true },
    });
    return row ? { ownerId: row.userId, title: row.title } : null;
  }
  if (listingType === "JOB") {
    const row = await prisma.jobPost.findUnique({
      where: { id: listingId },
      select: { authorId: true, title: true },
    });
    return row ? { ownerId: row.authorId, title: row.title } : null;
  }
  const row = await prisma.teamPost.findUnique({
    where: { id: listingId },
    select: { authorId: true, title: true },
  });
  return row ? { ownerId: row.authorId, title: row.title } : null;
}
