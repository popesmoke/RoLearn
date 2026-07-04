import { notFound } from "next/navigation";
import { SkillCategory } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { LiveFeed } from "@/components/feed/live-feed";
import { skillCategories } from "@/lib/constants";
import { fetchPostsBySkill, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";
import { formatCategory } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ skill: string }>;
};

export default async function SkillLandingPage({ params }: PageProps) {
  const { skill: raw } = await params;
  const skill = raw.toUpperCase().replace(/-/g, "_");
  if (!skillCategories.includes(skill as (typeof skillCategories)[number])) {
    notFound();
  }

  const user = await getCurrentUser();
  const feed = await fetchPostsBySkill(skill as SkillCategory, 30, user?.id);

  return (
    <AppShell
      title={formatCategory(skill)}
      subtitle={`Services, jobs, and teams for ${formatCategory(skill).toLowerCase()}s`}
    >
      <LiveFeed initialItems={serializeFeed(feed)} />
    </AppShell>
  );
}
