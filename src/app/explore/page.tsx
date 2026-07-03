import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";
import { AppIcon, type IconName } from "@/components/icons";

export const dynamic = "force-dynamic";

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
} as const;

type FeedEntry = {
  id: string;
  type: "service" | "job" | "team";
  title: string;
  description: string;
  createdAt: Date;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  author: {
    id: string;
    username: string | null;
    robloxUsername: string | null;
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

export default async function ExplorePage() {
  const [services, jobs, teamPosts] = await Promise.all([
    prisma.serviceOffer.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: authorSelect } },
    }),
    prisma.jobPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: authorSelect } },
    }),
    prisma.teamPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: authorSelect } },
    }),
  ]);

  const feed: FeedEntry[] = [
    ...services.map((item) => ({
      id: item.id,
      type: "service" as const,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      category: item.category,
      price: item.basePrice,
      author: item.user,
    })),
    ...jobs.map((item) => ({
      id: item.id,
      type: "job" as const,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      budgetMin: item.budgetMin,
      budgetMax: item.budgetMax,
      author: item.author,
    })),
    ...teamPosts.map((item) => ({
      id: item.id,
      type: "team" as const,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      category: item.neededRole,
      author: item.author,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <AppShell
      title="Discover"
      subtitle="Services, jobs, and team posts from Roblox creators"
      headerAction={
        <ButtonLink href="/dashboard" size="sm" className="gap-1.5">
          <AppIcon name="plus" size={16} />
          Post
        </ButtonLink>
      }
    >
      <div className="feed-grid">
        {feed.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <AppIcon name="rocket" size={48} className="mx-auto mb-4 opacity-60" />
            <p className="text-lg font-bold">Nothing here yet</p>
            <p className="mt-2 text-muted">
              Be the first to publish a service, job, or team request.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/dashboard">Open Studio</ButtonLink>
              <ButtonLink href="/marketplace" variant="outline">
                Marketplace
              </ButtonLink>
            </div>
          </div>
        ) : (
          feed.map((item) => (
            <FeedItem
              key={`${item.type}-${item.id}`}
              id={item.id}
              type={item.type}
              title={item.title}
              description={item.description}
              author={item.author}
              createdAt={item.createdAt}
              category={item.category}
              price={item.price}
              budgetMin={item.budgetMin}
              budgetMax={item.budgetMax}
            />
          ))
        )}
      </div>

      <div className="px-4 py-6 text-center text-sm text-muted">
        <Link href="/marketplace" className="text-accent hover:underline">
          Browse marketplace
        </Link>
        {" · "}
        <Link href="/teamfinder" className="text-accent hover:underline">
          Find a team
        </Link>
      </div>
    </AppShell>
  );
}
