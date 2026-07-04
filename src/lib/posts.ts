import { ListingType, PaymentCurrency, SkillCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FeedEntry } from "@/lib/feed";
import { feedTypeToListing, getLikeCounts, getUserLikedSet } from "@/lib/likes";

export type PostType = "service" | "job" | "team";

const authorSelect = {
  id: true,
  username: true,
  robloxUsername: true,
  displayName: true,
  email: true,
  avatarUrl: true,
  trustScore: true,
  trustLevel: true,
  isVerified: true,
  responseCount: true,
  responseTotalMin: true,
} as const;

export function postPath(type: PostType, id: string) {
  return `/p/${type}/${id}`;
}

export function listingTypeToPost(type: ListingType): PostType {
  if (type === "SERVICE") return "service";
  if (type === "JOB") return "job";
  return "team";
}

function notExpiredFilter() {
  return { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

export async function getPostById(
  type: PostType,
  id: string,
  userId?: string,
): Promise<FeedEntry | null> {
  let raw: Omit<FeedEntry, "likeCount" | "likedByMe"> | null = null;

  if (type === "service") {
    const item = await prisma.serviceOffer.findUnique({
      where: { id },
      include: { user: { select: authorSelect } },
    });
    if (!item) return null;
    raw = {
      id: item.id,
      type: "service",
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
    };
  } else if (type === "job") {
    const item = await prisma.jobPost.findUnique({
      where: { id },
      include: { author: { select: authorSelect } },
    });
    if (!item) return null;
    raw = {
      id: item.id,
      type: "job",
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
    };
  } else {
    const item = await prisma.teamPost.findUnique({
      where: { id },
      include: { author: { select: authorSelect } },
    });
    if (!item) return null;
    raw = {
      id: item.id,
      type: "team",
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
    };
  }

  const refs = [{ type: feedTypeToListing(raw.type), id: raw.id }];
  const [likeMap, likedSet] = await Promise.all([
    getLikeCounts(refs),
    getUserLikedSet(userId, refs),
  ]);
  const key = `${feedTypeToListing(raw.type)}-${raw.id}`;
  return {
    ...raw,
    likeCount: likeMap.get(key) ?? 0,
    likedByMe: likedSet.has(key),
  };
}

export async function expireOldPosts() {
  const now = new Date();
  const [jobs, teams, services] = await Promise.all([
    prisma.jobPost.updateMany({
      where: { expiresAt: { lte: now }, isOpen: true },
      data: { isOpen: false },
    }),
    prisma.teamPost.updateMany({
      where: { expiresAt: { lte: now }, isOpen: true },
      data: { isOpen: false },
    }),
    prisma.serviceOffer.deleteMany({ where: { expiresAt: { lte: now } } }),
  ]);
  return { jobs: jobs.count, teams: teams.count, services: services.count };
}

export type FeedFilters = {
  type?: PostType;
  skill?: SkillCategory;
  currency?: PaymentCurrency;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  followingIds?: string[];
  sort?: "newest" | "popular";
};

export function buildExpiryDate(days: number | null): Date | null {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export { notExpiredFilter };
