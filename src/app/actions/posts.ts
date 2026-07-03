"use server";

import { revalidatePath } from "next/cache";
import { ListingType, SkillCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { skillCategories } from "@/lib/constants";
import { profilePath } from "@/lib/user-display";
import { deleteMediaUrls } from "@/lib/storage";

function safeCategory(value: string): SkillCategory {
  if (skillCategories.includes(value as (typeof skillCategories)[number])) {
    return value as SkillCategory;
  }
  return SkillCategory.SCRIPTER;
}

function toInt(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseMediaUrls(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

function revalidateAll(user: { username?: string | null }) {
  revalidatePath("/explore");
  revalidatePath("/marketplace");
  revalidatePath("/teamfinder");
  revalidatePath("/search");
  revalidatePath("/dashboard");
  if (user.username) revalidatePath(profilePath(user));
}

export async function createPost(formData: FormData) {
  const user = await requireUser();
  const type = String(formData.get("type") ?? "service");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = safeCategory(String(formData.get("category") ?? "SCRIPTER"));
  const mediaUrls = parseMediaUrls(String(formData.get("mediaUrls") ?? "[]"));

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  if (type === "service") {
    await prisma.serviceOffer.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        basePrice: toInt(String(formData.get("price") ?? "")),
        mediaUrls,
      },
    });
  } else if (type === "job") {
    await prisma.jobPost.create({
      data: {
        authorId: user.id,
        title,
        description,
        budgetMin: toInt(String(formData.get("budgetMin") ?? "")),
        budgetMax: toInt(String(formData.get("budgetMax") ?? "")),
        mediaUrls,
      },
    });
  } else if (type === "team") {
    await prisma.teamPost.create({
      data: {
        authorId: user.id,
        title,
        description,
        neededRole: category,
        mediaUrls,
      },
    });
  } else {
    return { error: "Invalid post type." };
  }

  revalidateAll(user);
  return { success: true };
}

export async function toggleLike(listingType: ListingType, listingId: string) {
  const user = await requireUser();

  const existing = await prisma.postLike.findUnique({
    where: {
      userId_listingType_listingId: {
        userId: user.id,
        listingType,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({
      data: { userId: user.id, listingType, listingId },
    });

    const ownerId = await getListingOwnerId(listingType, listingId);
    if (ownerId && ownerId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          type: "like",
          title: "New like",
          body: "Someone liked your post",
          link: "/explore",
        },
      });
    }
  }

  revalidatePath("/explore");
  revalidatePath("/marketplace");
  revalidatePath("/teamfinder");
  return { liked: !existing };
}

async function getListingOwnerId(listingType: ListingType, listingId: string) {
  if (listingType === "SERVICE") {
    const row = await prisma.serviceOffer.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });
    return row?.userId ?? null;
  }
  if (listingType === "JOB") {
    const row = await prisma.jobPost.findUnique({
      where: { id: listingId },
      select: { authorId: true },
    });
    return row?.authorId ?? null;
  }
  const row = await prisma.teamPost.findUnique({
    where: { id: listingId },
    select: { authorId: true },
  });
  return row?.authorId ?? null;
}

async function verifyOwnership(
  postType: "service" | "job" | "team",
  postId: string,
  userId: string,
) {
  if (postType === "service") {
    const post = await prisma.serviceOffer.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) return false;
    return true;
  }
  if (postType === "job") {
    const post = await prisma.jobPost.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== userId) return false;
    return true;
  }
  const post = await prisma.teamPost.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== userId) return false;
  return true;
}

async function cleanupListing(listingType: ListingType, listingId: string) {
  await prisma.postLike.deleteMany({ where: { listingType, listingId } });
  await prisma.application.deleteMany({ where: { listingType, listingId } });
}

async function getPostMediaUrls(postType: "service" | "job" | "team", postId: string) {
  if (postType === "service") {
    const post = await prisma.serviceOffer.findUnique({
      where: { id: postId },
      select: { mediaUrls: true },
    });
    return post?.mediaUrls ?? [];
  }
  if (postType === "job") {
    const post = await prisma.jobPost.findUnique({
      where: { id: postId },
      select: { mediaUrls: true },
    });
    return post?.mediaUrls ?? [];
  }
  const post = await prisma.teamPost.findUnique({
    where: { id: postId },
    select: { mediaUrls: true },
  });
  return post?.mediaUrls ?? [];
}

export async function deletePost(postType: "service" | "job" | "team", postId: string) {
  const user = await requireUser();
  if (!(await verifyOwnership(postType, postId, user.id))) {
    return { error: "Post not found or you don't have permission." };
  }

  const listingType =
    postType === "service" ? ListingType.SERVICE : postType === "job" ? ListingType.JOB : ListingType.TEAM;

  const mediaUrls = await getPostMediaUrls(postType, postId);
  await cleanupListing(listingType, postId);

  if (postType === "service") {
    await prisma.serviceOffer.delete({ where: { id: postId } });
  } else if (postType === "job") {
    await prisma.jobPost.delete({ where: { id: postId } });
  } else {
    await prisma.teamPost.delete({ where: { id: postId } });
  }

  await deleteMediaUrls(mediaUrls);
  revalidateAll(user);
  return { success: true };
}

export async function reopenPost(postType: "job" | "team", postId: string) {
  const user = await requireUser();
  if (!(await verifyOwnership(postType, postId, user.id))) {
    return { error: "Post not found or you don't have permission." };
  }

  if (postType === "job") {
    await prisma.jobPost.update({ where: { id: postId }, data: { isOpen: true } });
  } else {
    await prisma.teamPost.update({ where: { id: postId }, data: { isOpen: true } });
  }

  revalidateAll(user);
  return { success: true };
}

export async function closePost(postType: "job" | "team", postId: string) {
  const user = await requireUser();
  if (!(await verifyOwnership(postType, postId, user.id))) {
    return { error: "Post not found or you don't have permission." };
  }

  if (postType === "job") {
    await prisma.jobPost.update({ where: { id: postId }, data: { isOpen: false } });
  } else {
    await prisma.teamPost.update({ where: { id: postId }, data: { isOpen: false } });
  }

  revalidateAll(user);
  return { success: true };
}
