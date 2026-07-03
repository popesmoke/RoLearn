import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  searchParams: Promise<{ tab?: string; skill?: string }>;
};

export default async function MarketplacePage({ searchParams }: PageProps) {
  const { tab = "services", skill } = await searchParams;
  const skillFilter = skill && skillCategories.includes(skill as (typeof skillCategories)[number])
    ? (skill as SkillCategory)
    : undefined;

  const [services, jobs] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: skillFilter ? { category: skillFilter } : undefined,
      orderBy: { createdAt: "desc" },
      include: { user: { select: authorSelect } },
      take: 40,
    }),
    prisma.jobPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: authorSelect } },
      take: 40,
    }),
  ]);

  const tabs = [
    { id: "services", label: "Services", count: services.length },
    { id: "jobs", label: "Jobs", count: jobs.length },
  ];

  return (
    <AppShell title="Marketplace" subtitle="Hire creators or find contract work">
      <div className="flex border-b border-border">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/marketplace?tab=${item.id}${skill ? `&skill=${skill}` : ""}`}
            className={cn(
              "flex-1 py-3.5 text-center text-[15px] font-medium transition hover:bg-surface-hover",
              tab === item.id ? "tab-active font-bold" : "text-muted",
            )}
          >
            {item.label}
            <span className="ml-1.5 text-sm text-subtle">{item.count}</span>
          </Link>
        ))}
      </div>

      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {tab === "services"
              ? "Hire verified Roblox creators for scripting, building, UI, and more."
              : "Contract work with clear budgets and scope."}
          </p>
          <ButtonLink href="/dashboard" size="sm" variant="outline">
            Post listing
          </ButtonLink>
        </div>
      </div>

      <div className="feed-grid">
        {tab === "services" ? (
          services.length === 0 ? (
            <EmptyState type="service" />
          ) : (
            services.map((service) => (
              <FeedItem
                key={service.id}
                id={service.id}
                type="service"
                title={service.title}
                description={service.description}
                author={service.user}
                createdAt={service.createdAt}
                category={service.category}
                price={service.basePrice}
              />
            ))
          )
        ) : jobs.length === 0 ? (
          <EmptyState type="job" />
        ) : (
          jobs.map((job) => (
            <FeedItem
              key={job.id}
              id={job.id}
              type="job"
              title={job.title}
              description={job.description}
              author={job.author}
              createdAt={job.createdAt}
              budgetMin={job.budgetMin}
              budgetMax={job.budgetMax}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ type }: { type: "service" | "job" }) {
  return (
    <div className="surface-panel px-4 py-16 text-center">
      <p className="text-lg font-bold">No {type === "service" ? "services" : "jobs"} yet</p>
      <p className="mt-2 text-muted">Publish from Studio to show up here.</p>
      <div className="mt-6">
        <ButtonLink href="/dashboard">Go to Studio</ButtonLink>
      </div>
    </div>
  );
}
