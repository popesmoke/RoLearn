import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { skillCategories } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export async function RightRail() {
  const [stats, creators] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.serviceOffer.count(),
      prisma.jobPost.count({ where: { isOpen: true } }),
      prisma.teamPost.count({ where: { isOpen: true } }),
    ]),
    prisma.user.findMany({
      where: { hireMeOpen: true },
      orderBy: { reputationPoints: "desc" },
      take: 3,
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        trustLevel: true,
        reputationPoints: true,
      },
    }),
  ]);

  const [creatorsCount, servicesCount, jobsCount, teamsCount] = stats;

  return (
    <aside className="hidden px-4 py-2 lg:block">
      <div className="sticky top-2 space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Platform pulse</h2>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Stat label="Creators" value={creatorsCount} />
            <Stat label="Services" value={servicesCount} />
            <Stat label="Open jobs" value={jobsCount} />
            <Stat label="Team posts" value={teamsCount} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Trending skills</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            {skillCategories.slice(0, 8).map((skill) => (
              <Link key={skill} href={`/marketplace?skill=${skill}`}>
                <Badge variant="accent">{formatCategory(skill)}</Badge>
              </Link>
            ))}
          </CardBody>
        </Card>

        {creators.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Available now</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {creators.map((creator) => (
                <div key={creator.id} className="flex items-center gap-3">
                  <Avatar
                    src={creator.avatarUrl}
                    name={creator.displayName}
                    email={creator.email}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {creator.displayName ?? creator.email}
                    </p>
                    <p className="text-xs text-muted">
                      {creator.reputationPoints} rep · {formatCategory(creator.trustLevel)}
                    </p>
                  </div>
                  <Badge variant="success">Hire me</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}

        <p className="px-2 text-xs leading-relaxed text-subtle">
          RoLearn is the professional network for Roblox developers — portfolios,
          gigs, teams, and reputation in one feed.
        </p>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
