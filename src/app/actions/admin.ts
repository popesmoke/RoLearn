"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/user";

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const days = Number(formData.get("days") ?? "30");

  if (!title || !body) return { error: "Title and body required." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.announcement.create({
    data: { title, body, link, expiresAt, priority: 1 },
  });

  revalidatePath("/announcements");
  revalidatePath("/explore");
  return { success: true };
}

export async function resolveReport(reportId: string) {
  await requireAdmin();
  await prisma.report.update({
    where: { id: reportId },
    data: { resolved: true },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleFeatured(
  listingType: "SERVICE" | "JOB" | "TEAM",
  listingId: string,
  featured: boolean,
) {
  await requireAdmin();
  if (listingType === "SERVICE") {
    await prisma.serviceOffer.update({ where: { id: listingId }, data: { isFeatured: featured } });
  } else if (listingType === "JOB") {
    await prisma.jobPost.update({ where: { id: listingId }, data: { isFeatured: featured } });
  } else {
    await prisma.teamPost.update({ where: { id: listingId }, data: { isFeatured: featured } });
  }
  revalidatePath("/explore");
  revalidatePath("/admin");
  return { success: true };
}

export async function setUserRole(userId: string, role: UserRole) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
  return { success: true };
}

export async function deletePostAdmin(
  listingType: "SERVICE" | "JOB" | "TEAM",
  listingId: string,
) {
  await requireAdmin();
  if (listingType === "SERVICE") {
    await prisma.serviceOffer.delete({ where: { id: listingId } });
  } else if (listingType === "JOB") {
    await prisma.jobPost.delete({ where: { id: listingId } });
  } else {
    await prisma.teamPost.delete({ where: { id: listingId } });
  }
  revalidatePath("/admin");
  revalidatePath("/explore");
  return { success: true };
}

