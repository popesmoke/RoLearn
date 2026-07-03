import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { skillCategories } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";
import { getHandle, profilePath } from "@/lib/user-display";
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
      take: 4,
      select: {
        id: true,
        username: true,
        robloxUsername: true,
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
    <aside className="hidden px-4 py-4 lg:block">
      <div className="sticky top-4 space-y-4">
        <Card>
          <CardHeader>
            <h2 className="font-bold">Live stats</h2>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-2">
            <Stat label="Creators" value={creatorsCount} />
            <Stat label="Services" value={servicesCount} />
            <Stat label="Jobs" value={jobsCount} />
            <Stat label="Teams" value={teamsCount} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold">Browse by skill</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            {skillCategories.slice(0, 8).map((skill) => (
              <Link key={skill} href={`/search?skill=${skill}`}>
                <Badge variant="secondary">{formatCategory(skill)}</Badge>
              </Link>
            ))}
          </CardBody>
        </Card>

        {creators.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 className="font-bold">Open for hire</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {creators.map((creator) => (
                <Link
                  key={creator.id}
                  href={profilePath(creator)}
                  className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-surface-hover"
                >
                  <Avatar
                    src={creator.avatarUrl}
                    name={creator.displayName}
                    email={creator.email}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {creator.displayName ?? getHandle(creator)}
                    </p>
                    <p className="text-xs text-muted">
                      {creator.reputationPoints} rep · {formatCategory(creator.trustLevel)}
                    </p>
                  </div>
                  <Badge variant="success">Hire</Badge>
                </Link>
              ))}
            </CardBody>
          </Card>
        ) : null}
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5">
      <p className="text-lg font-bold tabular-nums text-accent">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
