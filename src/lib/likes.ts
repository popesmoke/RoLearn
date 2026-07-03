import { ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ListingRef = { type: ListingType; id: string };

export async function getLikeCounts(refs: ListingRef[]): Promise<Map<string, number>> {
  if (refs.length === 0) return new Map();

  const likes = await prisma.postLike.groupBy({
    by: ["listingType", "listingId"],
    where: { OR: refs.map((r) => ({ listingType: r.type, listingId: r.id })) },
    _count: { id: true },
  });

  return new Map(likes.map((l) => [`${l.listingType}-${l.listingId}`, l._count.id]));
}

export async function getUserLikedSet(
  userId: string | undefined,
  refs: ListingRef[],
): Promise<Set<string>> {
  if (!userId || refs.length === 0) return new Set();

  const liked = await prisma.postLike.findMany({
    where: {
      userId,
      OR: refs.map((r) => ({ listingType: r.type, listingId: r.id })),
    },
    select: { listingType: true, listingId: true },
  });

  return new Set(liked.map((l) => `${l.listingType}-${l.listingId}`));
}

export function feedTypeToListing(type: "service" | "job" | "team"): ListingType {
  return type === "service" ? "SERVICE" : type === "job" ? "JOB" : "TEAM";
}
