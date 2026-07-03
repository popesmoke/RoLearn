import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icon8, icons } from "@/components/icon8";
import { skillCategories } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";
import { getDisplayName, getHandle, profilePath } from "@/lib/user-display";
import { SkillCategory } from "@prisma/client";

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
  searchParams: Promise<{
    q?: string;
    type?: string;
    skill?: string;
    hire?: string;
  }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", type = "all", skill, hire } = await searchParams;
  const query = q.trim();
  const skillFilter = skill && skillCategories.includes(skill as (typeof skillCategories)[number])
    ? (skill as SkillCategory)
    : undefined;
  const hireOnly = hire === "1";

  const textFilter = query
    ? { contains: query, mode: "insensitive" as const }
    : undefined;

  const [users, services, jobs, teams] = await Promise.all([
    type === "all" || type === "creators"
      ? prisma.user.findMany({
          where: {
            ...(hireOnly ? { hireMeOpen: true } : {}),
            OR: query
              ? [
                  { displayName: textFilter },
                  { username: textFilter },
                  { robloxUsername: textFilter },
                  { aboutMe: textFilter },
                ]
              : undefined,
          },
          orderBy: { reputationPoints: "desc" },
          take: 20,
        })
      : [],
    type === "all" || type === "services"
      ? prisma.serviceOffer.findMany({
          where: {
            ...(skillFilter ? { category: skillFilter } : {}),
            OR: query
              ? [{ title: textFilter }, { description: textFilter }]
              : undefined,
          },
          include: { user: { select: authorSelect } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [],
    type === "all" || type === "jobs"
      ? prisma.jobPost.findMany({
          where: {
            isOpen: true,
            OR: query
              ? [{ title: textFilter }, { description: textFilter }]
              : undefined,
          },
          include: { author: { select: authorSelect } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [],
    type === "all" || type === "teams"
      ? prisma.teamPost.findMany({
          where: {
            isOpen: true,
            ...(skillFilter ? { neededRole: skillFilter } : {}),
            OR: query
              ? [{ title: textFilter }, { description: textFilter }]
              : undefined,
          },
          include: { author: { select: authorSelect } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [],
  ]);

  const hasResults = users.length + services.length + jobs.length + teams.length > 0;

  return (
    <AppShell title="Search" subtitle="Find creators, services, jobs, and teams">
      <div className="border-b border-border p-4">
        <form className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon8
                name={icons.search}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search creators, services, jobs…"
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              name="type"
              label="Type"
              defaultValue={type}
              options={[
                { value: "all", label: "All" },
                { value: "creators", label: "Creators" },
                { value: "services", label: "Services" },
                { value: "jobs", label: "Jobs" },
                { value: "teams", label: "Teams" },
              ]}
            />
            <Select
              name="skill"
              label="Skill"
              defaultValue={skill ?? ""}
              options={[
                { value: "", label: "Any skill" },
                ...skillCategories.map((s) => ({ value: s, label: formatCategory(s) })),
              ]}
            />
            <label className="flex items-end gap-2 pb-2 text-sm text-muted">
              <input
                type="checkbox"
                name="hire"
                value="1"
                defaultChecked={hireOnly}
                className="rounded border-border"
              />
              Open for hire only
            </label>
          </div>
        </form>
      </div>

      <div className="p-4">
        {!hasResults ? (
          <div className="surface-panel px-4 py-16 text-center">
            <Icon8 name={icons.search} size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">No results found</p>
            <p className="mt-2 text-muted">Try different keywords or filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {users.length > 0 ? (
              <section>
                <h2 className="mb-3 font-bold">Creators</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={profilePath(user)}
                      className="surface-panel flex items-center gap-3 p-4 transition hover:border-accent/30"
                    >
                      <Avatar
                        src={user.avatarUrl}
                        name={user.displayName}
                        email={user.email}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{getDisplayName(user)}</p>
                        <p className="text-sm text-muted">@{getHandle(user)}</p>
                        {user.hireMeOpen ? (
                          <Badge variant="success" className="mt-1">Hire me</Badge>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {services.length > 0 ? (
              <section>
                <h2 className="mb-3 font-bold">Services</h2>
                <div className="feed-grid !p-0">
                  {services.map((s) => (
                    <FeedItem
                      key={s.id}
                      id={s.id}
                      type="service"
                      title={s.title}
                      description={s.description}
                      author={s.user}
                      createdAt={s.createdAt}
                      category={s.category}
                      price={s.basePrice}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {jobs.length > 0 ? (
              <section>
                <h2 className="mb-3 font-bold">Jobs</h2>
                <div className="feed-grid !p-0">
                  {jobs.map((j) => (
                    <FeedItem
                      key={j.id}
                      id={j.id}
                      type="job"
                      title={j.title}
                      description={j.description}
                      author={j.author}
                      createdAt={j.createdAt}
                      budgetMin={j.budgetMin}
                      budgetMax={j.budgetMax}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {teams.length > 0 ? (
              <section>
                <h2 className="mb-3 font-bold">Teams</h2>
                <div className="feed-grid !p-0">
                  {teams.map((t) => (
                    <FeedItem
                      key={t.id}
                      id={t.id}
                      type="team"
                      title={t.title}
                      description={t.description}
                      author={t.author}
                      createdAt={t.createdAt}
                      category={t.neededRole}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
