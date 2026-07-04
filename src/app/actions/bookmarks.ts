"use server";

import { revalidatePath } from "next/cache";
import { ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";

export async function toggleBookmark(listingType: ListingType, listingId: string) {
  const user = await requireUser();

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_listingType_listingId: {
        userId: user.id,
        listingType,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: { userId: user.id, listingType, listingId },
    });
  }

  revalidatePath("/bookmarks");
  return { saved: !existing };
}

export async function getUserBookmarkIds(userId: string) {
  const rows = await prisma.bookmark.findMany({
    where: { userId },
    select: { listingType: true, listingId: true },
  });
  return new Set(rows.map((r) => `${r.listingType}-${r.listingId}`));
}
