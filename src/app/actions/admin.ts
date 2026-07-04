"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canManageRole } from "@/lib/roles";
import { requireAtLeastAdmin, requireOwner, requireStaff } from "@/lib/user";

export async function createAnnouncement(formData: FormData) {
  await requireAtLeastAdmin();
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

export async function deleteAnnouncement(announcementId: string) {
  await requireOwner();
  await prisma.announcement.delete({ where: { id: announcementId } });
  revalidatePath("/announcements");
  revalidatePath("/admin");
  return { success: true };
}

export async function resolveReport(reportId: string) {
  await requireStaff();
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
  await requireAtLeastAdmin();
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
  const actor = await requireStaff();
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "User not found." };

  if (!canManageRole(actor, role) || !canManageRole(actor, target.role)) {
    return { error: "You cannot assign that role." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
  revalidatePath(`/u/${target.username ?? target.robloxUsername}`);
  return { success: true };
}

export async function deletePostAdmin(
  listingType: "SERVICE" | "JOB" | "TEAM",
  listingId: string,
) {
  await requireAtLeastAdmin();
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

export async function deleteUserContent(userId: string) {
  await requireOwner();
  await prisma.$transaction([
    prisma.serviceOffer.deleteMany({ where: { userId } }),
    prisma.jobPost.deleteMany({ where: { authorId: userId } }),
    prisma.teamPost.deleteMany({ where: { authorId: userId } }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/explore");
  return { success: true };
}
