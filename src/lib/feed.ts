import { ListingType, PaymentCurrency, SkillCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FeedAuthor } from "@/components/feed/feed-item";
import { feedTypeToListing, getLikeCounts, getUserLikedSet } from "@/lib/likes";
import type { FeedFilters, PostType } from "@/lib/posts";

export type FeedEntry = {
  id: string;
  type: PostType;
  title: string;
  description: string;
  createdAt: Date;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: PaymentCurrency;
  mediaUrls: string[];
  likeCount: number;
  likedByMe: boolean;
  isOpen?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  expiresAt?: Date | null;
  author: FeedAuthor & { id: string };
};

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
  isVerified: true,
  trustScore: true,
  trustLevel: true,
  responseCount: true,
  responseTotalMin: true,
} as const;

type FeedQuery = FeedFilters & {
  limit?: number;
  after?: Date;
  before?: Date;
  userId?: string;
};

function expiryWhere() {
  return { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

export async function fetchFeed({
  limit = 40,
  after,
  before,
  userId,
  type,
  skill,
  currency,
  verifiedOnly,
  featuredOnly,
  followingIds,
}: FeedQuery = {}): Promise<FeedEntry[]> {
  const afterFilter = after ? { gt: after } : undefined;
  const beforeFilter = before ? { lt: before } : undefined;
  const createdAtFilter =
    afterFilter || beforeFilter
      ? { ...(afterFilter ?? {}), ...(beforeFilter ?? {}) }
      : undefined;

  const fetchServices = type === undefined || type === "service";
  const fetchJobs = type === undefined || type === "job";
  const fetchTeams = type === undefined || type === "team";

  const [services, jobs, teamPosts] = await Promise.all([
    fetchServices
      ? prisma.serviceOffer.findMany({
          where: {
            ...expiryWhere(),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(skill ? { category: skill } : {}),
            ...(currency ? { currency: { in: [currency, PaymentCurrency.BOTH] } } : {}),
            ...(featuredOnly ? { isFeatured: true } : {}),
            ...(followingIds?.length ? { userId: { in: followingIds } } : {}),
            ...(verifiedOnly
              ? { user: { isVerified: true } }
              : {}),
          },
          orderBy: featuredOnly
            ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
            : { createdAt: "desc" },
          take: limit,
          include: { user: { select: authorSelect } },
        })
      : Promise.resolve([]),
    fetchJobs
      ? prisma.jobPost.findMany({
          where: {
            isOpen: true,
            ...expiryWhere(),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(currency ? { currency: { in: [currency, PaymentCurrency.BOTH] } } : {}),
            ...(featuredOnly ? { isFeatured: true } : {}),
            ...(followingIds?.length ? { authorId: { in: followingIds } } : {}),
            ...(verifiedOnly ? { author: { isVerified: true } } : {}),
          },
          orderBy: featuredOnly
            ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
            : { createdAt: "desc" },
          take: limit,
          include: { author: { select: authorSelect } },
        })
      : Promise.resolve([]),
    fetchTeams
      ? prisma.teamPost.findMany({
          where: {
            isOpen: true,
            ...expiryWhere(),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(skill ? { neededRole: skill } : {}),
            ...(featuredOnly ? { isFeatured: true } : {}),
            ...(followingIds?.length ? { authorId: { in: followingIds } } : {}),
            ...(verifiedOnly ? { author: { isVerified: true } } : {}),
          },
          orderBy: featuredOnly
            ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
            : { createdAt: "desc" },
          take: limit,
          include: { author: { select: authorSelect } },
        })
      : Promise.resolve([]),
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
      currency: item.currency,
      mediaUrls: item.mediaUrls,
      isOpen: true,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
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
      currency: item.currency,
      mediaUrls: item.mediaUrls,
      isOpen: item.isOpen,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
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
      isOpen: item.isOpen,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
      author: item.author,
    })),
  ].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

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

export async function fetchFeaturedPosts(limit = 3): Promise<FeedEntry[]> {
  return fetchFeed({ limit, featuredOnly: true });
}

export async function fetchRecommendedPosts(userId: string, limit = 10): Promise<FeedEntry[]> {
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    select: { category: true },
  });
  if (skills.length === 0) {
    return fetchFeed({ limit, userId });
  }
  const results: FeedEntry[] = [];
  for (const { category } of skills.slice(0, 3)) {
    const batch = await fetchFeed({ limit: 5, skill: category, userId });
    results.push(...batch);
  }
  const seen = new Set<string>();
  return results
    .filter((e) => {
      const k = `${e.type}-${e.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}

export async function fetchUserPosts(userId: string, limit = 50): Promise<FeedEntry[]> {
  const [services, jobs, teamPosts] = await Promise.all([
    prisma.serviceOffer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: authorSelect } },
    }),
    prisma.jobPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { author: { select: authorSelect } },
    }),
    prisma.teamPost.findMany({
      where: { authorId: userId },
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
      currency: item.currency,
      mediaUrls: item.mediaUrls,
      isOpen: true,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
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
      currency: item.currency,
      mediaUrls: item.mediaUrls,
      isOpen: item.isOpen,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
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
      isOpen: item.isOpen,
      isFeatured: item.isFeatured,
      viewCount: item.viewCount,
      expiresAt: item.expiresAt,
      author: item.author,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const refs = raw.map((e) => ({ type: feedTypeToListing(e.type), id: e.id }));
  const [likeMap, likedSet] = await Promise.all([
    getLikeCounts(refs),
    getUserLikedSet(userId, refs),
  ]);

  return raw.map((entry) => {
    const key = `${feedTypeToListing(entry.type)}-${entry.id}`;
    return {
      ...entry,
      likeCount: likeMap.get(key) ?? 0,
      likedByMe: likedSet.has(key),
    };
  });
}

export async function fetchBookmarkedPosts(userId: string): Promise<FeedEntry[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const entries: FeedEntry[] = [];
  for (const b of bookmarks) {
    const type =
      b.listingType === "SERVICE" ? "service" : b.listingType === "JOB" ? "job" : "team";
    const post = await import("@/lib/posts").then((m) => m.getPostById(type, b.listingId, userId));
    if (post) entries.push(post);
  }
  return entries;
}

export function serializeFeed(entries: FeedEntry[]) {
  return entries.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    expiresAt: e.expiresAt?.toISOString() ?? null,
  }));
}

export async function fetchPostsBySkill(skill: SkillCategory, limit = 30, userId?: string) {
  return fetchFeed({ limit, skill, userId });
}
