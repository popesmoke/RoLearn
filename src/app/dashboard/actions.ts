"use server";

import { revalidatePath } from "next/cache";
import { CourseFormat, SkillCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { skillCategories } from "@/lib/constants";
import { profilePath } from "@/lib/user-display";

function safeCategory(value: FormDataEntryValue | null): SkillCategory {
  const raw = String(value ?? "");
  if (skillCategories.includes(raw as (typeof skillCategories)[number])) {
    return raw as SkillCategory;
  }
  return SkillCategory.SCRIPTER;
}

function toInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function parseMediaUrls(raw: FormDataEntryValue | null): string[] {
  const str = String(raw ?? "").trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str) as unknown;
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

function safeCourseFormat(value: FormDataEntryValue | null): CourseFormat {
  const raw = String(value ?? "WRITTEN");
  if (raw === "PDF" || raw === "MIXED") return raw;
  return CourseFormat.WRITTEN;
}

function revalidateUserPaths(user: { username?: string | null; robloxUsername?: string | null }) {
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  revalidatePath("/marketplace");
  revalidatePath("/teamfinder");
  revalidatePath("/search");
  revalidatePath("/courses");
  if (user.username || user.robloxUsername) {
    revalidatePath(profilePath(user));
  }
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: String(formData.get("displayName") ?? "").trim() || null,
      aboutMe: String(formData.get("aboutMe") ?? "").trim() || null,
      hireMeOpen: formData.get("hireMeOpen") === "on",
    },
  });
  revalidateUserPaths(updated);
}

export async function addSkill(formData: FormData) {
  const user = await requireUser();
  const category = safeCategory(formData.get("category"));
  await prisma.userSkill.upsert({
    where: {
      userId_category: {
        userId: user.id,
        category,
      },
    },
    create: {
      userId: user.id,
      category,
      level: 1,
    },
    update: {},
  });
  revalidateUserPaths(user);
}

export async function createPortfolioItem(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  await prisma.portfolioItem.create({
    data: {
      userId: user.id,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      experienceId: String(formData.get("experienceId") ?? "").trim() || null,
      groupId: String(formData.get("groupId") ?? "").trim() || null,
      assetId: String(formData.get("assetId") ?? "").trim() || null,
      mediaUrls: parseMediaUrls(formData.get("mediaUrls")),
    },
  });
  revalidateUserPaths(user);
  return { success: true };
}

export async function createCourse(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const format = safeCourseFormat(formData.get("format"));
  const content = String(formData.get("content") ?? "").trim() || null;
  const pdfUrl = String(formData.get("pdfUrl") ?? "").trim() || null;
  const coverUrl = String(formData.get("coverUrl") ?? "").trim() || null;
  const isPaid = formData.get("isPaid") === "on";
  const priceCents = isPaid ? (toInt(formData.get("priceUsd")) ?? 0) * 100 : 0;

  if (!title || !description) return { error: "Title and description are required." };
  if (format === CourseFormat.PDF && !pdfUrl) {
    return { error: "Upload a PDF or switch to written format." };
  }
  if (format === CourseFormat.WRITTEN && !content) {
    return { error: "Add written content or switch to PDF format." };
  }

  const course = await prisma.course.create({
    data: {
      title,
      summary,
      description,
      format,
      content,
      pdfUrl,
      coverUrl,
      mediaUrls: parseMediaUrls(formData.get("mediaUrls")),
      isPaid,
      priceCents,
      instructors: {
        create: {
          userId: user.id,
          revenueSharePct: 100,
        },
      },
    },
  });

  revalidateUserPaths(user);
  revalidatePath(`/courses/${course.id}`);
  return { success: true, courseId: course.id };
}

export async function createService(formData: FormData) {
  const user = await requireUser();
  await prisma.serviceOffer.create({
    data: {
      userId: user.id,
      title: String(formData.get("title") ?? "").trim(),
      category: safeCategory(formData.get("category")),
      description: String(formData.get("description") ?? "").trim(),
      basePrice: toInt(formData.get("basePriceUsd")),
    },
  });
  revalidateUserPaths(user);
}

export async function createJob(formData: FormData) {
  const user = await requireUser();
  await prisma.jobPost.create({
    data: {
      authorId: user.id,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      budgetMin: toInt(formData.get("budgetMinUsd")),
      budgetMax: toInt(formData.get("budgetMaxUsd")),
    },
  });
  revalidateUserPaths(user);
}

export async function createTeamPost(formData: FormData) {
  const user = await requireUser();
  await prisma.teamPost.create({
    data: {
      authorId: user.id,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      neededRole: safeCategory(formData.get("neededRole")),
    },
  });
  revalidateUserPaths(user);
}
