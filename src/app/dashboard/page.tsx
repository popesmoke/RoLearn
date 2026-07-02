import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { skillCategories } from "@/lib/constants";
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

function SkillSelect({ name }: { name: string }) {
  return (
    <select
      name={name}
      className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
      defaultValue="SCRIPTER"
    >
      {skillCategories.map((category) => (
        <option key={category} value={category}>
          {category.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [skills, portfolioItems, courses, services, jobs, teamPosts] = await Promise.all([
    prisma.userSkill.findMany({ where: { userId: user.id }, orderBy: { category: "asc" } }),
    prisma.portfolioItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.courseInstructor.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { course: { createdAt: "desc" } },
      take: 5,
    }),
    prisma.serviceOffer.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.jobPost.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.teamPost.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">
            Creator Dashboard - <span className="text-blue-400">{user.displayName ?? user.email}</span>
          </h1>
          <nav className="flex gap-4 text-sm text-zinc-400">
            <Link href="/marketplace" className="hover:text-white">Marketplace</Link>
            <Link href="/teamfinder" className="hover:text-white">Team Finder</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Profile</h2>
          <form action={updateProfile} className="mt-4 space-y-3">
            <input name="displayName" defaultValue={user.displayName ?? ""} placeholder="Display name" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <textarea name="aboutMe" defaultValue={user.aboutMe ?? ""} placeholder="About me" className="min-h-24 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="hireMeOpen" defaultChecked={user.hireMeOpen} />
              Open for hire
            </label>
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Save profile</button>
          </form>
          <div className="mt-4 text-xs text-zinc-400">
            Trust score: {user.trustScore} | Reputation: {user.reputationPoints}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Skills</h2>
          <form action={addSkill} className="mt-4 space-y-3">
            <SkillSelect name="category" />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Add skill</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <p className="text-sm text-zinc-400">No skills yet.</p>
            ) : (
              skills.map((skill) => (
                <span key={skill.id} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                  {skill.category.replaceAll("_", " ")}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <form action={createPortfolioItem} className="mt-4 space-y-3">
            <input name="title" required placeholder="Project title" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <textarea name="description" placeholder="What did you build?" className="min-h-20 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <input name="experienceId" placeholder="Experience ID" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input name="groupId" placeholder="Group ID" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input name="assetId" placeholder="Asset ID" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            </div>
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Add project</button>
          </form>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {portfolioItems.map((item) => <li key={item.id}>- {item.title}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Create Course</h2>
          <form action={createCourse} className="mt-4 space-y-3">
            <input name="title" required placeholder="Course title" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <textarea name="description" required placeholder="Course description" className="min-h-20 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="isPaid" />
              Paid course
            </label>
            <input name="priceUsd" type="number" min="0" placeholder="Price in USD" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Publish course</button>
          </form>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {courses.map((item) => <li key={item.id}>- {item.course.title}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Offer Service</h2>
          <form action={createService} className="mt-4 space-y-3">
            <input name="title" required placeholder="Service title" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <SkillSelect name="category" />
            <textarea name="description" required placeholder="Service details" className="min-h-20 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <input name="basePriceUsd" type="number" min="0" placeholder="Starting price (USD)" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Publish service</button>
          </form>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {services.map((item) => <li key={item.id}>- {item.title}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Post Jobs and Team Requests</h2>
          <form action={createJob} className="mt-4 space-y-3 border-b border-white/10 pb-4">
            <input name="title" required placeholder="Job title" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <textarea name="description" required placeholder="Job scope" className="min-h-16 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input name="budgetMinUsd" type="number" min="0" placeholder="Min budget USD" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input name="budgetMaxUsd" type="number" min="0" placeholder="Max budget USD" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            </div>
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Post job</button>
          </form>
          <form action={createTeamPost} className="mt-4 space-y-3">
            <input name="title" required placeholder="Team post title" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <SkillSelect name="neededRole" />
            <textarea name="description" required placeholder="Who do you need?" className="min-h-16 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Post team request</button>
          </form>
          <div className="mt-4 text-xs text-zinc-400">
            Your open jobs: {jobs.filter((job) => job.isOpen).length} | Team posts: {teamPosts.filter((post) => post.isOpen).length}
          </div>
        </section>
      </main>
    </div>
  );
}
