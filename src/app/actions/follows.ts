"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { profilePath } from "@/lib/user-display";

export async function toggleFollow(targetUserId: string) {
  const user = await requireUser();
  if (targetUserId === user.id) {
    return { error: "You cannot follow yourself." };
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: user.id, followingId: targetUserId },
    });
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "follow",
        title: "New follower",
        body: `${user.displayName ?? user.username ?? "Someone"} started following you`,
        link: profilePath(user),
      },
    });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true, robloxUsername: true },
  });
  if (target) revalidatePath(profilePath(target));
  revalidatePath("/activity");
  return { following: !existing };
}

export async function getFollowStats(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  return Boolean(row);
}

export async function getFollowingIds(userId: string) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return rows.map((r) => r.followingId);
}
