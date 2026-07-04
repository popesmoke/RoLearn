"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { verifyApplicationOwner } from "@/lib/applications";
import { adjustReputation, adjustTrustScore } from "@/lib/trust";
import { profilePath } from "@/lib/user-display";

export async function createReview(applicationId: string, rating: number, comment: string) {
  const user = await requireUser();
  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!app || app.status !== ApplicationStatus.COMPLETED) {
    return { error: "Reviews are only available after a project is marked complete." };
  }

  const isOwner = Boolean(await verifyApplicationOwner(applicationId, user.id));
  const isApplicant = app.applicantId === user.id;
  if (!isOwner && !isApplicant) {
    return { error: "You are not part of this project." };
  }

  const revieweeId = isOwner ? app.applicantId : (await getListingOwnerId(app.listingType, app.listingId));
  if (!revieweeId || revieweeId === user.id) {
    return { error: "Cannot review yourself." };
  }

  const existing = await prisma.review.findFirst({
    where: { applicationId, reviewerId: user.id },
  });
  if (existing) {
    return { error: "You already left a review for this project." };
  }

  await prisma.review.create({
    data: {
      reviewerId: user.id,
      revieweeId,
      applicationId,
      rating,
      comment: comment.trim() || null,
    },
  });

  if (isOwner) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { ownerReviewed: true },
    });
  } else {
    await prisma.application.update({
      where: { id: applicationId },
      data: { applicantReviewed: true },
    });
  }

  await adjustReputation(revieweeId, rating * 2);
  await adjustTrustScore(revieweeId, rating);

  const reviewee = await prisma.user.findUnique({
    where: { id: revieweeId },
    select: { username: true, robloxUsername: true },
  });
  if (reviewee) revalidatePath(profilePath(reviewee));

  await prisma.notification.create({
    data: {
      userId: revieweeId,
      type: "review",
      title: "New review",
      body: `You received a ${rating}-star review`,
      link: reviewee ? profilePath(reviewee) : "/notifications",
    },
  });

  revalidatePath(`/review/${applicationId}`);
  return { success: true };
}

async function getListingOwnerId(listingType: string, listingId: string) {
  if (listingType === "SERVICE") {
    const row = await prisma.serviceOffer.findUnique({ where: { id: listingId }, select: { userId: true } });
    return row?.userId ?? null;
  }
  if (listingType === "JOB") {
    const row = await prisma.jobPost.findUnique({ where: { id: listingId }, select: { authorId: true } });
    return row?.authorId ?? null;
  }
  const row = await prisma.teamPost.findUnique({ where: { id: listingId }, select: { authorId: true } });
  return row?.authorId ?? null;
}
