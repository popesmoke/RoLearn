import { AppShell } from "@/components/layout/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { requireAdmin } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const [reports, users, featuredServices, stats] = await Promise.all([
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
      take: 20,
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
    Promise.all([
      prisma.user.count(),
      prisma.serviceOffer.count(),
      prisma.jobPost.count({ where: { isOpen: true } }),
      prisma.report.count({ where: { resolved: false } }),
    ]),
  ]);

  return (
    <AppShell title="Admin" subtitle="Moderation and platform management" showRightRail={false}>
      <div className="p-4">
        <AdminPanel
          reports={reports.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          users={users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          }))}
          featured={featuredServices}
          stats={{
            users: stats[0],
            services: stats[1],
            openJobs: stats[2],
            openReports: stats[3],
          }}
        />
      </div>
    </AppShell>
  );
}
