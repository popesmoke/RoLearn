import { AppShell } from "@/components/layout/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { checkIsAdmin, checkIsOwner, requireStaff } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentUser = await requireStaff();
  const isOwner = checkIsOwner(currentUser);
  const isAdmin = checkIsAdmin(currentUser);

  const [
    reports,
    users,
    featuredServices,
    featuredJobs,
    featuredTeams,
    announcements,
    recentPosts,
    stats,
    ownerStats,
  ] = await Promise.all([
    prisma.report.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reporter: { select: { displayName: true, username: true, robloxUsername: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        displayName: true,
        username: true,
        robloxUsername: true,
        role: true,
        trustScore: true,
        createdAt: true,
      },
    }),
    prisma.serviceOffer.findMany({
      where: { isFeatured: true },
      take: 10,
      select: { id: true, title: true },
    }),
    isAdmin
      ? prisma.jobPost.findMany({
          where: { isFeatured: true },
          take: 10,
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.teamPost.findMany({
          where: { isFeatured: true },
          take: 10,
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.announcement.findMany({
          orderBy: { publishedAt: "desc" },
          take: 10,
          select: { id: true, title: true, publishedAt: true },
        })
      : Promise.resolve([]),
    isAdmin
      ? Promise.all([
          prisma.serviceOffer.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, title: true },
          }).then((s) => s.map((p) => ({ id: p.id, title: p.title, type: "SERVICE" as const }))),
          prisma.jobPost.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, title: true },
          }).then((j) => j.map((p) => ({ id: p.id, title: p.title, type: "JOB" as const }))),
          prisma.teamPost.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, title: true },
          }).then((t) => t.map((p) => ({ id: p.id, title: p.title, type: "TEAM" as const }))),
        ]).then(([s, j, t]) => [...s, ...j, ...t].slice(0, 15))
      : Promise.resolve([]),
    Promise.all([
      prisma.user.count(),
      prisma.serviceOffer.count(),
      prisma.jobPost.count({ where: { isOpen: true } }),
      prisma.report.count({ where: { resolved: false } }),
    ]),
    isOwner
      ? Promise.all([
          prisma.teamPost.count(),
          prisma.message.count(),
          prisma.review.count(),
          prisma.report.count(),
          prisma.announcement.count(),
        ])
      : Promise.resolve(null),
  ]);

  return (
    <AppShell
      title={isOwner ? "Owner panel" : "Admin"}
      subtitle={
        isOwner
          ? "Full platform control"
          : isAdmin
            ? "Moderation and management"
            : "Report moderation"
      }
      showRightRail={false}
    >
      <div className="p-4">
        <AdminPanel
          isOwner={isOwner}
          isAdmin={isAdmin}
          reports={reports.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          users={users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          }))}
          featuredServices={featuredServices}
          featuredJobs={featuredJobs}
          featuredTeams={featuredTeams}
          announcements={announcements.map((a) => ({
            ...a,
            publishedAt: a.publishedAt.toISOString(),
          }))}
          recentPosts={recentPosts}
          stats={{
            users: stats[0],
            services: stats[1],
            openJobs: stats[2],
            openReports: stats[3],
          }}
          ownerStats={
            ownerStats
              ? {
                  teams: ownerStats[0],
                  messages: ownerStats[1],
                  reviews: ownerStats[2],
                  totalReports: ownerStats[3],
                  announcements: ownerStats[4],
                }
              : null
          }
        />
      </div>
    </AppShell>
  );
}
