import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

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
      include: {
        user: { select: { displayName: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.jobPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { displayName: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.teamPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { displayName: true, email: true, avatarUrl: true } },
      },
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
    <AppShell title="Home">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Your creator network</p>
            <p className="text-[15px] text-subtle">
              Services, jobs, and team posts — updated in real time.
            </p>
          </div>
          <ButtonLink href="/dashboard" size="sm">
            Post
          </ButtonLink>
        </div>
      </div>

      <div className="feed-divider">
        {feed.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-semibold">Nothing here yet</p>
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

      <div className="border-t border-border px-4 py-6 text-center text-sm text-muted">
        <Link href="/marketplace" className="text-sky-400 hover:underline">
          Browse marketplace
        </Link>
        {" · "}
        <Link href="/teamfinder" className="text-sky-400 hover:underline">
          Find a team
        </Link>
      </div>
    </AppShell>
  );
}
