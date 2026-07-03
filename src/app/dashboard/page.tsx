import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { skillCategories } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AppIcon, type IconName } from "@/components/icons";
import { cn, formatCategory, trustLevelStyles } from "@/lib/utils";
import { getHandle, profilePath } from "@/lib/user-display";
import {
  addSkill,
  createCourse,
  createJob,
  createPortfolioItem,
  createService,
  createTeamPost,
  updateProfile,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

const tabs: { id: string; label: string; icon: IconName }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "portfolio", label: "Portfolio", icon: "briefcase" },
  { id: "courses", label: "Courses", icon: "star" },
  { id: "market", label: "Market", icon: "marketplace" },
  { id: "recruit", label: "Recruit", icon: "teams" },
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab = "profile" } = await searchParams;
  const user = await requireUser();

  const [skills, portfolioItems, courses, services, jobs, teamPosts] = await Promise.all([
    prisma.userSkill.findMany({ where: { userId: user.id }, orderBy: { category: "asc" } }),
    prisma.portfolioItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.courseInstructor.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { course: { createdAt: "desc" } },
      take: 8,
    }),
    prisma.serviceOffer.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.jobPost.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.teamPost.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const handle = getHandle(user);

  return (
    <AppShell title="Studio" showRightRail={false}>
      <div className="border-b border-border">
        <div className="px-4 py-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={user.avatarUrl}
              name={user.displayName}
              email={user.email}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.displayName ?? handle}</h2>
                {user.isVerified ? <AppIcon name="verified" size={20} /> : null}
              </div>
              <p className="text-sm text-muted">@{handle}</p>
              <Link href={profilePath(user)} className="text-sm text-accent hover:underline">
                View public profile
              </Link>
              {user.aboutMe ? (
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{user.aboutMe}</p>
              ) : (
                <p className="mt-2 text-sm text-subtle">Add a bio to stand out to clients and teams.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={trustLevelStyles[user.trustLevel]}>
                  {formatCategory(user.trustLevel)}
                </Badge>
                {user.hireMeOpen ? <Badge variant="success">Open for hire</Badge> : null}
                <Badge>{user.trustScore} trust</Badge>
                <Badge>{user.reputationPoints} rep</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto border-t border-border">
          {tabs.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard?tab=${item.id}`}
              className={cn(
                "flex min-w-[100px] flex-1 items-center justify-center gap-2 whitespace-nowrap py-3.5 text-center text-[15px] font-medium transition hover:bg-surface-hover",
                tab === item.id ? "tab-active font-bold" : "text-muted",
              )}
            >
              <AppIcon name={item.icon} size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === "profile" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Edit profile</h3>
              </CardHeader>
              <CardBody>
                <form action={updateProfile} className="space-y-4">
                  <Input name="displayName" label="Display name" defaultValue={user.displayName ?? ""} />
                  <Textarea name="aboutMe" label="Bio" defaultValue={user.aboutMe ?? ""} placeholder="What do you build on Roblox?" />
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="hireMeOpen" defaultChecked={user.hireMeOpen} className="rounded border-border" />
                    Available for hire
                  </label>
                  <Button type="submit">Save profile</Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold">Skills</h3>
              </CardHeader>
              <CardBody>
                <form action={addSkill} className="space-y-4">
                  <Select name="category" label="Add skill" options={skillCategories} defaultValue="SCRIPTER" />
                  <Button type="submit" variant="outline">Add skill</Button>
                </form>
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <p className="text-sm text-muted">No skills added yet.</p>
                  ) : (
                    skills.map((skill) => (
                      <Badge key={skill.id} variant="accent">
                        {formatCategory(skill.category)}
                      </Badge>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}

        {tab === "portfolio" ? (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Add portfolio project</h3>
              </CardHeader>
              <CardBody>
                <form action={createPortfolioItem} className="space-y-4">
                  <Input name="title" label="Project title" required placeholder="Obby framework, UI kit, etc." />
                  <Textarea name="description" label="Description" placeholder="What did you ship?" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input name="experienceId" label="Experience ID" placeholder="Optional" />
                    <Input name="groupId" label="Group ID" placeholder="Optional" />
                    <Input name="assetId" label="Asset ID" placeholder="Optional" />
                  </div>
                  <Button type="submit">Publish project</Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold">Your projects</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {portfolioItems.length === 0 ? (
                  <p className="text-sm text-muted">No portfolio items yet.</p>
                ) : (
                  portfolioItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-background/50 p-3">
                      <p className="font-semibold">{item.title}</p>
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted">{item.description}</p>
                      ) : null}
                      {item.ownershipVerified ? (
                        <Badge variant="success" className="mt-2">Verified</Badge>
                      ) : null}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}

        {tab === "courses" ? (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Create course</h3>
              </CardHeader>
              <CardBody>
                <form action={createCourse} className="space-y-4">
                  <Input name="title" label="Course title" required />
                  <Textarea name="description" label="Description" required />
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="isPaid" className="rounded border-border" />
                    Paid course
                  </label>
                  <Input name="priceUsd" label="Price (USD)" type="number" min="0" placeholder="0" />
                  <Button type="submit">Publish course</Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold">Your courses</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {courses.length === 0 ? (
                  <p className="text-sm text-muted">No courses published yet.</p>
                ) : (
                  courses.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-background/50 p-3">
                      <p className="font-semibold">{item.course.title}</p>
                      <p className="mt-1 text-sm text-muted line-clamp-2">{item.course.description}</p>
                      <Badge className="mt-2">
                        {item.course.isPaid ? `$${item.course.priceCents / 100}` : "Free"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}

        {tab === "market" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Offer a service</h3>
              </CardHeader>
              <CardBody>
                <form action={createService} className="space-y-4">
                  <Input name="title" label="Service title" required />
                  <Select name="category" label="Category" options={skillCategories} />
                  <Textarea name="description" label="Details" required />
                  <Input name="basePriceUsd" label="Starting price (USD)" type="number" min="0" />
                  <Button type="submit">Publish service</Button>
                </form>
                <div className="mt-5 space-y-2">
                  {services.map((item) => (
                    <p key={item.id} className="text-sm text-muted">· {item.title}</p>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold">Post a job</h3>
              </CardHeader>
              <CardBody>
                <form action={createJob} className="space-y-4">
                  <Input name="title" label="Job title" required />
                  <Textarea name="description" label="Scope" required />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="budgetMinUsd" label="Min budget (USD)" type="number" min="0" />
                    <Input name="budgetMaxUsd" label="Max budget (USD)" type="number" min="0" />
                  </div>
                  <Button type="submit">Post job</Button>
                </form>
                <div className="mt-5 space-y-2">
                  {jobs.map((item) => (
                    <p key={item.id} className="text-sm text-muted">
                      · {item.title} {item.isOpen ? "" : "(closed)"}
                    </p>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}

        {tab === "recruit" ? (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Recruit for your team</h3>
              </CardHeader>
              <CardBody>
                <form action={createTeamPost} className="space-y-4">
                  <Input name="title" label="Post title" required placeholder="Looking for lead scripter" />
                  <Select name="neededRole" label="Role needed" options={skillCategories} />
                  <Textarea name="description" label="What you're building" required />
                  <Button type="submit">Publish team post</Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold">Your team posts</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {teamPosts.length === 0 ? (
                  <p className="text-sm text-muted">No team posts yet.</p>
                ) : (
                  teamPosts.map((post) => (
                    <div key={post.id} className="rounded-xl border border-border bg-background/50 p-3">
                      <p className="font-semibold">{post.title}</p>
                      <p className="mt-1 text-sm text-muted">{formatCategory(post.neededRole)}</p>
                      <Badge className="mt-2" variant={post.isOpen ? "success" : "default"}>
                        {post.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
