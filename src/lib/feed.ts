import { prisma } from "@/lib/prisma";
import type { FeedAuthor } from "@/components/feed/feed-item";
import { feedTypeToListing, getLikeCounts, getUserLikedSet } from "@/lib/likes";

export type FeedEntry = {
  id: string;
  type: "service" | "job" | "team";
  title: string;
  description: string;
  createdAt: Date;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  mediaUrls: string[];
  likeCount: number;
  likedByMe: boolean;
  author: FeedAuthor & { id: string };
};

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
} as const;

export async function fetchFeed(
  limit = 40,
  after?: Date,
  userId?: string,
): Promise<FeedEntry[]> {
  const dateFilter = after ? { gt: after } : undefined;

  const [services, jobs, teamPosts] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: authorSelect } },
    }),
    prisma.jobPost.findMany({
      where: {
        isOpen: true,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { author: { select: authorSelect } },
    }),
    prisma.teamPost.findMany({
      where: {
        isOpen: true,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { author: { select: authorSelect } },
    }),
  ]);

  const raw: Omit<FeedEntry, "likeCount" | "likedByMe">[] = [
    ...services.map((item) => ({
      id: item.id,
      type: "service" as const,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      category: item.category,
      price: item.basePrice,
      mediaUrls: item.mediaUrls,
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
      mediaUrls: item.mediaUrls,
      author: item.author,
    })),
    ...teamPosts.map((item) => ({
      id: item.id,
      type: "team" as const,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      category: item.neededRole,
      mediaUrls: item.mediaUrls,
      author: item.author,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const sliced = raw.slice(0, limit);
  const refs = sliced.map((e) => ({ type: feedTypeToListing(e.type), id: e.id }));

  const [likeMap, likedSet] = await Promise.all([
    getLikeCounts(refs),
    getUserLikedSet(userId, refs),
  ]);

  return sliced.map((entry) => {
    const key = `${feedTypeToListing(entry.type)}-${entry.id}`;
    return {
      ...entry,
      likeCount: likeMap.get(key) ?? 0,
      likedByMe: likedSet.has(key),
    };
  });
}

export function serializeFeed(entries: FeedEntry[]) {
  return entries.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));
}
